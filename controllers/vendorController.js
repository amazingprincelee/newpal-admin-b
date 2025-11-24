// controllers/vendorController.js
import Vendor from '../models/vendor.js';

export const createVendor = async (req, res) => {
  try {
    const vendor = new Vendor({
      ...req.body,
      status: 'Pending'
    });
    await vendor.save();
    res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    vendor.status = 'Approved';
    vendor.approvedBy = req.user.id;
    vendor.approvedAt = new Date();
    await vendor.save();
    res.json({ success: true, message: 'Vendor approved', data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};