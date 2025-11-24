import Asset from '../models/Asset.js';

export const createAsset = async (req, res) => {
  try {
    const asset = new Asset({
      ...req.body,
      movements: [{ type: 'Acquisition', performedBy: req.user.id, notes: 'Initial acquisition' }]
    });
    await asset.save();
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    Object.assign(asset, req.body);
    asset.movements.push({
      type: req.body.movementType || 'Update',
      performedBy: req.user.id,
      notes: req.body.notes
    });
    await asset.save();
    res.json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};