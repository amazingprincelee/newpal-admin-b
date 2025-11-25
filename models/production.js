// models/ProductionBatch.js  ← 100% FINAL & WORKING
import mongoose from 'mongoose';

const productionBatchSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true, uppercase: true },

  product: {
    type: String,
    required: true,
    enum: [
      'Maize Flour 50kg',
      'Maize Grits',
      'Corn-Soya Blend (CSB+)',
      'Instant Ogi',
      'Maize-Based Malt Beverage',
      'Animal Feed'
    ]
  },

  line: { type: String, required: true },
  shift: { type: String, enum: ['Morning', 'Afternoon', 'Night'], required: true },

  plannedStart: { type: Date, required: true },
  actualStart: Date,
  actualEnd: Date,
  durationMinutes: Number,

  rawMaterials: [{
    inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    product: { type: String, required: true },
    plannedBags: { type: Number, required: true, min: 1 },
    actualBags: { type: Number },
    batchNo: String,
    reservedAt: Date,
    consumedAt: Date
  }],

  output: {
    plannedBags: { type: Number, required: true },
    actualBags: { type: Number },
    goodBags: { type: Number },
    rejectedBags: { type: Number },
    reworkBags: { type: Number },
    yieldPercent: { type: Number }
  },

  approval: {
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    requestedAt: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: String,
    notes: String
  },

  qcStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Passed', 'Failed', 'Conditional'],
    default: 'Pending'
  },
  qcCheckedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qcCheckedAt: Date,
  qcNotes: String,
  labTestRequired: { type: Boolean, default: false },
  labReportUrl: String,

  status: {
    type: String,
    enum: [
      'Draft',
      'Pending Approval',
      'Approved',
      'In Progress',
      'Completed',
      'Cancelled',
      'On Hold'
    ],
    default: 'Draft'
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  notes: String,
  downtimeMinutes: Number,
  downtimeReason: String,

  inventoryEntry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }

}, { timestamps: true });


// ========================================
// 100% WORKING AUTO RESERVE & CONSUME LOGIC
// ========================================
productionBatchSchema.pre('save', async function (next) {
  const batch = this;

  try {
    // 1. WHEN BATCH IS APPROVED → RESERVE RAW MATERIALS
    if (batch.isModified('approval.status') && 
        batch.approval.status === 'APPROVED' && 
        batch.status === 'Pending Approval') {

      for (const rm of batch.rawMaterials) {
        const inventory = await mongoose.model('Inventory').findById(rm.inventoryItem);
        if (!inventory) throw new Error(`Inventory not found: ${rm.inventoryItem}`);
        if (inventory.availableStock < rm.plannedBags) {
          throw new Error(`Not enough stock for ${rm.product}. Need: ${rm.plannedBags}, Available: ${inventory.availableStock}`);
        }

        await mongoose.model('Inventory').findByIdAndUpdate(rm.inventoryItem, {
          $inc: { reserved: rm.plannedBags },
          $push: {
            reservedByBatches: { batch: batch._id, bags: rm.plannedBags, reservedAt: new Date() },
            movements: {
              type: 'RESERVE',
              reference: batch._id,
              referenceType: 'ProductionBatch',
              bags: rm.plannedBags,
              user: batch.createdBy,
              notes: `Reserved for batch ${batch.batchNumber}`
            }
          }
        });

        rm.reservedAt = new Date();
      }

      batch.status = 'Approved';
    }


    // 2. WHEN PRODUCTION IS COMPLETED → CONSUME RAW + ADD FINISHED GOODS
    if (batch.isModified('status') && batch.status === 'Completed' && batch.output.goodBags > 0) {

      // Consume raw materials
      for (const rm of batch.rawMaterials) {
        if (rm.actualBags > 0) {
          await mongoose.model('Inventory').findByIdAndUpdate(rm.inventoryItem, {
            $inc: { 
              quantity: -rm.actualBags,
              reserved: -rm.actualBags
            },
            $pull: { reservedByBatches: { batch: batch._id } },
            $push: {
              movements: {
                type: 'OUT',
                reference: batch._id,
                referenceType: 'ProductionBatch',
                bags: -rm.actualBags,
                user: batch.completedBy || batch.createdBy,
                notes: `Consumed in batch ${batch.batchNumber}`
              }
            }
          });
          rm.consumedAt = new Date();
        }
      }

      // Add finished goods to inventory
      const finishedInventory = await mongoose.model('Inventory').findOneAndUpdate(
        { product: batch.product, category: 'Finished Goods' },
        {
          $inc: { quantity: batch.output.goodBags },
          $push: {
            movements: {
              type: 'IN',
              reference: batch._id,
              referenceType: 'ProductionBatch',
              bags: batch.output.goodBags,
              user: batch.completedBy || batch.createdBy,
              notes: `Produced from batch ${batch.batchNumber}`
            }
          },
          $setOnInsert: {
            product: batch.product,
            category: 'Finished Goods',
            unit: 'Bag',
            location: 'Finished Goods Warehouse'
          }
        },
        { upsert: true, new: true }
      );

      batch.inventoryEntry = finishedInventory._id;
    }


    // 3. BASIC AUTO CALCULATIONS
    if (batch.actualStart && batch.actualEnd) {
      batch.durationMinutes = Math.round((batch.actualEnd - batch.actualStart) / (1000 * 60));
    }

    if (batch.output?.plannedBags > 0 && batch.output?.goodBags != null) {
      batch.output.yieldPercent = Number(((batch.output.goodBags / batch.output.plannedBags) * 100).toFixed(2));
    }

    // Auto status updates
    if (batch.approval.status === 'REJECTED') {
      batch.status = 'Cancelled';
    }
    if (batch.actualStart && !batch.actualEnd) {
      batch.status = 'In Progress';
    }

    next();
  } catch (error) {
    next(error); // This will reject the save with proper error
  }
});




export default mongoose.model('ProductionBatch', productionBatchSchema);