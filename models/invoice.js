// models/Invoice.js
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  // === AUTO-GENERATED INVOICE NUMBER ===
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    // e.g., "INV-2025-008421"
  },

  // === Links ===
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },        // optional if proforma
  shipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OutgoingShipment' }], // what was delivered

  // === Invoice Details ===
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },

  items: [{
    description: { type: String, required: true },     // e.g., "Maize Flour 50kg - Batch MF2025A"
    quantityBags: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],

  // === Money ===
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  vat: { type: Number, default: 0 },           // 7.5% in Nigeria
  totalAmount: { type: Number, required: true },

  // === Payment Status ===
  amountPaid: { type: Number, default: 0 },
  balanceDue: { type: Number, required: true },

  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Written Off'],
    default: 'Unpaid'
  },

  // === Payment Records ===
  payments: [{
    paymentDate: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['Cash', 'Transfer', 'Cheque', 'POS'] },
    reference: String,                    // bank ref, cheque no.
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }],

  // === Approval & Status ===
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Viewed', 'Approved', 'Cancelled'],
    default: 'Draft'
  },

  sentAt: Date,
  viewedAt: Date,

  // === Tax & Compliance ===
  tin: String,                          // Your company's TIN
  vatNumber: String,
  companyAddress: String,
  bankDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String
  },

  // === Notes ===
  customerNotes: String,
  internalNotes: String,

  // === Cancellation ===
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: Date,
  cancellationReason: String

}, { timestamps: true });

// === AUTO-CALCULATIONS ===
invoiceSchema.pre('save', function(next) {
  const inv = this;

  // Totals
  if (inv.items?.length > 0) {
    inv.subtotal = inv.items.reduce((sum, i) => sum + i.total, 0);
    inv.totalAmount = inv.subtotal - inv.discount + inv.vat;
  }

  // Balance
  inv.balanceDue = inv.totalAmount - inv.amountPaid;

  // Auto payment status
  if (inv.balanceDue <= 0) inv.paymentStatus = 'Paid';
  else if (inv.amountPaid > 0) inv.paymentStatus = 'Partially Paid';
  else if (inv.dueDate < new Date() && inv.balanceDue > 0) inv.paymentStatus = 'Overdue';
  else inv.paymentStatus = 'Unpaid';

  next();
});



export default mongoose.model('Invoice', invoiceSchema);