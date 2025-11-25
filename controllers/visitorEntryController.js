// controllers/visitorEntryController.js
import { VisitorEntry } from '../models/visitorEntry.js';
import { generatePassId } from '../utils/numberGenerators.js';

export const createVisitorEntry = async (req, res) => {
  try {
    const passId = generatePassId();

    const visitor = new VisitorEntry({
      ...req.body,
      passId,
      createdBy: req.user.id
    });

    await visitor.save();
    res.status(201).json({ success: true, data: visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveVisitor = async (req, res) => {
  try {
    const visitor = await VisitorEntry.findById(req.params.id);
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });

    visitor.approved = true;
    visitor.approvedBy = req.user.id;
    visitor.approvedAt = new Date();
    visitor.status = 'approved';
    await visitor.save();
    res.json({ success: true, data: visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkOutVisitor = async (req, res) => {
  try {
    const visitor = await VisitorEntry.findById(req.params.id);
    if (!visitor) return res.status(404).json({ success: false, message: 'Visitor not found' });

    visitor.timeOut = new Date().toISOString();
    visitor.status = 'exited';
    await visitor.save();
    res.json({ success: true, data: visitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};