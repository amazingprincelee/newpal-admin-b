import ProductionBatch from '../models/production.js';
import { generateBatchNumber } from '../utils/numberGenerators.js';

export const createProductionBatch = async (req, res) => {
  try {
    const { product, line, shift, plannedStart, rawMaterials, output } = req.body;

    const batchNumber = await generateBatchNumber(product);

    const batch = new ProductionBatch({
      batchNumber,
      product,
      line,
      shift,
      plannedStart: new Date(plannedStart),
      rawMaterials,
      output,
      createdBy: req.user.id,
      status: 'Pending Approval',
      approval: { status: 'PENDING' }
    });

    await batch.save();
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Example stubs for controllers
export const getAllBatches = async (req, res) => {
  const batches = await ProductionBatch.find().sort({ plannedStart: -1 });
  res.json({ success: true, data: batches });
};

export const getBatchById = async (req, res) => {
  const batch = await ProductionBatch.findById(req.params.id)
    .populate('rawMaterials.inventoryItem')
    .populate('createdBy')
    .populate('startedBy')
    .populate('completedBy');
  if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
  res.json({ success: true, data: batch });
};

// Approval
export const approveBatch = async (req, res) => {
  const batch = await ProductionBatch.findById(req.params.id);
  if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
  batch.approval.status = 'APPROVED';
  batch.approval.approvedBy = req.user.id;
  batch.approval.approvedAt = new Date();
  batch.status = 'Approved';
  await batch.save();
  res.json({ success: true, data: batch });
};

export const rejectBatch = async (req, res) => {
  const batch = await ProductionBatch.findById(req.params.id);
  if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
  batch.approval.status = 'REJECTED';
  batch.approval.rejectedBy = req.user.id;
  batch.approval.rejectedAt = new Date();
  batch.approval.rejectionReason = req.body.reason || '';
  batch.status = 'Cancelled';
  await batch.save();
  res.json({ success: true, data: batch });
};

// Start / Complete
export const startBatch = async (req, res) => {
  const batch = await ProductionBatch.findById(req.params.id);
  if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
  batch.actualStart = new Date();
  batch.startedBy = req.user.id;
  batch.status = 'In Progress';
  await batch.save();
  res.json({ success: true, data: batch });
};

export const completeBatch = async (req, res) => {
  const batch = await ProductionBatch.findById(req.params.id);
  if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
  batch.actualEnd = new Date();
  batch.completedBy = req.user.id;
  batch.output.actualBags = req.body.actualBags;
  batch.output.goodBags = req.body.goodBags;
  batch.output.rejectedBags = req.body.rejectedBags;
  batch.status = 'Completed';
  await batch.save();
  res.json({ success: true, data: batch });
};

// QC
export const updateQC = async (req, res) => {
  const batch = await ProductionBatch.findById(req.params.id);
  if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
  batch.qcStatus = req.body.qcStatus;
  batch.qcCheckedBy = req.user.id;
  batch.qcCheckedAt = new Date();
  batch.qcNotes = req.body.qcNotes;
  batch.labTestRequired = req.body.labTestRequired;
  batch.labReportUrl = req.body.labReportUrl;
  await batch.save();
  res.json({ success: true, data: batch });
};

// Delete
export const deleteBatch = async (req, res) => {
  const batch = await ProductionBatch.findByIdAndDelete(req.params.id);
  if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
  res.json({ success: true, message: 'Batch deleted' });
};
