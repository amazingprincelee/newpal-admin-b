// controllers/outgoingShipmentController.js
import OutgoingShipment from '../models/outgoingingShipment.js';
import { generateOutgoingNumber } from '../utils/numberGenerators.js';

export const createOutgoingShipment = async (req, res) => {
  try {
    const shipmentNumber = await generateOutgoingNumber();

    const shipment = new OutgoingShipment({
      shipmentNumber,
      ...req.body,
      releasedBy: req.user.id,
      status: 'Draft'
    });

    await shipment.save();
    res.status(201).json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveOutgoing = async (req, res) => {
  try {
    const shipment = await OutgoingShipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    shipment.mdApproval.status = 'APPROVED';
    shipment.mdApproval.approvedBy = req.user.id;
    shipment.mdApproval.approvedAt = new Date();
    shipment.status = 'MD Approved';
    await shipment.save();
    res.json({ success: true, message: 'Outgoing approved', data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const gateOutVerify = async (req, res) => {
  try {
    const shipment = await OutgoingShipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    shipment.gateOut = {
      ...req.body,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    };
    shipment.status = 'Gate Out Verification';
    await shipment.save();
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmDelivery = async (req, res) => {
  try {
    const shipment = await OutgoingShipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    shipment.actualBagsReceived = req.body.actualBagsReceived;
    shipment.issues = req.body.issues;
    shipment.proofOfDelivery = req.body.proofOfDelivery;
    shipment.customerSignature = req.body.customerSignature;
    shipment.status = 'Delivered';
    shipment.deliveredAt = new Date();
    await shipment.save();
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};