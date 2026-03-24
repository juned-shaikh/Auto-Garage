const express = require('express');
const router = express.Router();
const Part = require('../models/Part');

// GET all parts
router.get('/', async (req, res) => {
  try {
    const parts = await Part.find().sort({ createdAt: -1 });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single part
router.get('/:id', async (req, res) => {
  try {
    const part = await Part.findById(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    res.json(part);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE new part
router.post('/', async (req, res) => {
  try {
    const part = new Part(req.body);
    const savedPart = await part.save();
    res.status(201).json(savedPart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE part
router.put('/:id', async (req, res) => {
  try {
    const part = await Part.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    res.json(part);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE part
router.delete('/:id', async (req, res) => {
  try {
    const part = await Part.findByIdAndDelete(req.params.id);
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    res.json({ message: 'Part deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET low stock parts
router.get('/low-stock/all', async (req, res) => {
  try {
    const parts = await Part.find({
      $expr: { $lt: ['$quantity', '$minQuantity'] }
    });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
