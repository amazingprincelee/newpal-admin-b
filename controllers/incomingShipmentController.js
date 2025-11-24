// controllers/incomingShipmentController.js
import IncomingShipment from '../models/incomingShipment.js';
import Inventory from '../models/inventory.js';
import { generateIncomingNumber } from '../utils/numberGenerators.js';

export const createGateEntry = async (req, res) => {
  try {
    const shipmentNumber = await generateIncomingNumber();

    const shipment = new IncomingShipment({
      shipmentNumber,
      gateEntry: {
        ...req.body,
        enteredBy: req.user.id,
        enteredAt: new Date()
      },
      currentStatus: 'AT_GATE'
    });

    await shipment.save();
    res.status(201).json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateQC = async (req, res) => {
  try {
    const shipment = await IncomingShipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    shipment.qualityControl = {
      inspectedBy: req.user.id,
      inspectedAt: new Date(),
      ...req.body
    };
    shipment.currentStatus = 'IN_QC';
    await shipment.save();
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveIncoming = async (req, res) => {
  try {
    const shipment = await IncomingShipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    shipment.adminApproval = {
      status: 'APPROVED',
      approvedBy: req.user.id,
      approvedAt: new Date(),
      notes: req.body.notes
    };
    shipment.currentStatus = 'APPROVED';
    await shipment.save();

    // AUTO ADD TO INVENTORY
    const inventory = await Inventory.findOneAndUpdate(
      { product: shipment.gateEntry.productType, category: 'Raw Material' },
      {
        $inc: { quantity: shipment.offloading.actualBagsCounted || shipment.gateEntry.declaredBags },
        $push: { movements: { type: 'IN', reference: shipment._id, referenceType: 'IncomingShipment', bags: shipment.offloading.actualBagsCounted, user: req.user.id } }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Shipment approved & stock updated', data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingIncoming = async (req, res) => {
  try {
    const shipments = await IncomingShipment.find({ 'adminApproval.status': 'PENDING' }).sort({ createdAt: -1 });
    res.json({ success: true, data: shipments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};