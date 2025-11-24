import Inventory from '../models/inventory.js';

export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ category: 1, product: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const items = await Inventory.find({ available: { $lte: '$reorderLevel' } });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockSummary = async (req, res) => {
  try {
    const summary = await Inventory.aggregate([
      { $group: { _id: '$category', totalQuantity: { $sum: '$quantity' }, totalReserved: { $sum: '$reserved' } } }
    ]);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};