// models/SalesOrder.js
import mongoose from 'mongoose';

const salesOrderSchema = new mongoose.Schema({
  // === AUTO-GENERATED SO NUMBER ===
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
    // e.g., "SO-2025-003421"
  },

  // === Customer ===
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },

  // === Sales Rep ===
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now },

  // === Order Details ===
  items: [{
    product: { type: String, required: true },           // e.g., "Maize Flour 50kg"
    batchNo: { type: String },                           // optional at order stage
    quantityBags: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },         // per bag
    unitWeight: { type: Number, default: 50 },
    totalWeight: { type: Number },
    lineTotal: { type: Number }                          // quantity × unitPrice
  }],

  // === Totals ===
  totalBags: { type: Number, required: true },
  totalWeight: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },

  // === Payment & Credit ===
  paymentTerms: {
    type: String,
    enum: ['Cash', '7 Days', '14 Days', '30 Days', '60 Days'],
    default: 'Cash'
  },
  creditApproved: { type: Boolean, default: false },
  creditApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creditApprovedAt: Date,

  // === MD / Finance Approval (for large or credit orders) ===
  mdApproval: {
    status: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NOT_REQUIRED'
    },
    requestedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: String
  },

  // === Order Status ===
  status: {
    type: String,
    enum: [
      'Draft',
      'Confirmed',           // Customer confirmed
      'MD Approval Pending',
      'Approved',
      'Partially Delivered',
      'Fully Delivered',
      'Cancelled',
      'On Hold'
    ],
    default: 'Draft'
  },

  // === Delivery ===
  deliveryAddress: { type: String, required: true },
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,

  // === Linked Documents ===
  shipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OutgoingShipment' }],
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },

  // === Notes ===
  customerNotes: String,      // Visible to customer
  internalNotes: String,      // Only staff

  // === Cancellation ===
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date,
  cancellationReason: String

}, { timestamps: true });

// === AUTO-CALCULATIONS ===
salesOrderSchema.pre('save', function(next) {
  const order = this;

  if (order.items?.length > 0) {
    // Line totals
    order.items.forEach(item => {
      item.totalWeight = item.quantityBags * item.unitWeight;
      item.lineTotal = item.quantityBags * item.unitPrice;
    });

    // Order totals
    order.totalBags = order.items.reduce((sum, i) => sum + i.quantityBags, 0);
    order.totalWeight = order.items.reduce((sum, i) => sum + i.totalWeight, 0);
    order.subtotal = order.items.reduce((sum, i) => sum + i.lineTotal, 0);
    order.grandTotal = order.subtotal - order.discount + order.tax;
  }

  // Auto-set MD approval requirement
  if (order.grandTotal > 50000000 || order.paymentTerms !== 'Cash') { // >₦50m or credit
    order.mdApproval.status = 'PENDING';
  }

  // Update status based on MD approval
  if (order.mdApproval.status === 'APPROVED') {
    order.status = 'Approved';
  }
  if (order.mdApproval.status === 'REJECTED') {
    order.status = 'Cancelled';
  }

  next();
});



export default mongoose.model('SalesOrder', salesOrderSchema);