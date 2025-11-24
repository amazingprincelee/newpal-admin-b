import ProductionBatch from '../models/ProductionBatch.js';
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