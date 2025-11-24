// models/Asset.js
import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true }, // e.g. AST-2025-09-01
  name: { type: String, required: true },                  // Forklift, Safety Helmet
  category: {
    type: String,
    enum: ['Fixed Asset', 'Non-Fixed Asset'],
    required: true
  },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'piece' },
  serialNumber: String,
  purchaseDate: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  condition: { type: String, enum: ['Good', 'Faulty', 'Under Repair'], default: 'Good' },
  storageLocation: String,

  movements: [{
    type: { type: String, enum: ['Acquisition', 'Issue', 'Return', 'Repair', 'Disposal'] },
    quantityChange: { type: Number, default: 0 },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    notes: String
  }]
}, { timestamps: true });

export default mongoose.model('Asset', assetSchema);