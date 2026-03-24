const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customerId', 'name email phone address city state zip')
      .populate('items.partId', 'name category')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'name email phone address city state zip')
      .populate('items.partId', 'name category');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE new invoice
router.post('/', async (req, res) => {
  try {
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;
    
    const invoice = new Invoice({
      ...req.body,
      invoiceNumber
    });
    const savedInvoice = await invoice.save();
    
    const populatedInvoice = await Invoice.findById(savedInvoice._id)
      .populate('customerId', 'name email phone address city state zip')
      .populate('items.partId', 'name category');
    
    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE invoice
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customerId', 'name email phone address city state zip')
      .populate('items.partId', 'name category');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET invoices by customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const invoices = await Invoice.find({ customerId: req.params.customerId })
      .populate('customerId', 'name email phone')
      .populate('items.partId', 'name category')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
