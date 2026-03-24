const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

// GET all cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE new car transaction
router.post('/', async (req, res) => {
  try {
    const car = new Car(req.body);
    const savedCar = await car.save();
    res.status(201).json(savedCar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE car
router.put('/:id', async (req, res) => {
  try {
    // Calculate profit manually before updating
    const updateData = { ...req.body };
    if (updateData.type === 'sell' && updateData.sellPrice > 0) {
      updateData.profit = updateData.sellPrice - updateData.buyPrice;
    } else {
      updateData.profit = 0;
    }

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE car
router.delete('/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json({ message: 'Car record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET car statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalBought = await Car.countDocuments({ type: 'buy' });
    const totalSold = await Car.countDocuments({ type: 'sell' });
    const totalProfit = await Car.aggregate([
      { $match: { type: 'sell' } },
      { $group: { _id: null, totalProfit: { $sum: '$profit' } } }
    ]);

    res.json({
      totalBought,
      totalSold,
      totalProfit: totalProfit[0]?.totalProfit || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
