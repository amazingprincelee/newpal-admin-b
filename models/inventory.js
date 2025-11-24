// models/Inventory.js  ← FINAL PROFESSIONAL VERSION
import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  // === Core Identification ===
  product: {
    type: String,
    required: true,
    trim: true
    // e.g., "Yellow Maize", "Maize Flour 50kg", "Packaging Bags"
  },

  category: {
    type: String,
    enum: ['Raw Material', 'Finished Goods', 'Packaging', 'Spares', 'Consumables'],
    required: true
  },

  unit: {
    type: String,
    enum: ['Bag', 'Kg', 'Ton', 'Liter', 'Piece'],
    default: 'Bag'
  },

  unitWeight: { type: Number, default: 50 }, // kg per bag (for conversion)

  // === Stock Levels (THE HEART) ===
  quantity: { type: Number, default: 0, min: 0 },           // Physical available stock
  reserved: { type: Number, default: 0, min: 0 },           // Reserved for approved production
  available: { type: Number, default: 0 },                  // = quantity - reserved

  // === Batch Tracking (NAFDAC Requirement) ===
  batches: [{
    batchNo: { type: String, required: true },
    supplierBatch: String,                    // from vendor
    receivedDate: Date,
    expiryDate: Date,                         // for packaging or CSB+
    quantity: { type: Number, required: true },
    location: String,                         // Silo A, Warehouse 2, etc.
    qcStatus: { type: String, enum: ['Pending', 'Passed', 'Failed', 'Quarantined'] }
  }],

  // === Safety & Reorder ===
  minStock: { type: Number, default: 0 },      // trigger reorder
  maxStock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },

  // === Location ===
  location: { type: String, required: true },  // "Main Warehouse", "Silo 3", "Line 1 Buffer"

  // === Audit Trail ===
  lastReceived: { type: Date },
  lastIssued: { type: Date },
  lastCounted: { type: Date },                 // physical count
  lastCountedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // === Reservations Log (for traceability) ===
  reservedByBatches: [{
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionBatch' },
    bags: Number,
    reservedAt: { type: Date, default: Date.now },
    releasedAt: Date
  }],

  
currentStatus: {
  type: String,
  enum: ['Active', 'Quarantined', 'Blocked', 'Expired'],
  default: 'Active'
},

  // === Stock Movement History ===
  movements: [{
    type: { type: String, enum: ['IN', 'OUT', 'ADJUST', 'RESERVE', 'RELEASE'], required: true },
    reference: { type: mongoose.Schema.Types.ObjectId }, // IncomingShipment, ProductionBatch, etc.
    referenceType: String,                    // "IncomingShipment", "ProductionBatch"
    quantity: { type: Number, required: true },
    bags: Number,
    date: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }]

}, { timestamps: true });

// === VIRTUAL: Available Stock ===
inventorySchema.virtual('availableStock').get(function() {
  return this.quantity - this.reserved;
});

// === AUTO UPDATE AVAILABLE ===
inventorySchema.pre('save', function(next) {
  this.available = this.quantity - this.reserved;
  next();
});

// === INDEXES (Critical for speed) ===
inventorySchema.index({ product: 1, category: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ location: 1 });
inventorySchema.index({ 'batches.batchNo': 1 });
inventorySchema.index({ quantity: -1 });
inventorySchema.index({ availableStock: -1 });

export default mongoose.model('Inventory', inventorySchema);