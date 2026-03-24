const express = require('express');
const router = express.Router();
const Part = require('../models/Part');
const Car = require('../models/Car');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

// GET dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalParts = await Part.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const lowStockItems = await Part.countDocuments({
      $expr: { $lt: ['$quantity', '$minQuantity'] }
    });

    const carStats = await Car.aggregate([
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: {
              $cond: [{ $eq: ['$type', 'sell'] }, '$sellPrice', 0]
            }
          },
          totalProfit: { $sum: '$profit' },
          totalBought: {
            $sum: { $cond: [{ $eq: ['$type', 'buy'] }, 1, 0] }
          },
          totalSold: {
            $sum: { $cond: [{ $eq: ['$type', 'sell'] }, 1, 0] }
          }
        }
      }
    ]);

    const invoiceStats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalInvoiceAmount: { $sum: '$total' }
        }
      }
    ]);

    const totalSales = (carStats[0]?.totalSales || 0) + (invoiceStats[0]?.totalInvoiceAmount || 0);
    const totalProfit = (carStats[0]?.totalProfit || 0) + ((invoiceStats[0]?.totalInvoiceAmount || 0) * 0.3);

    res.json({
      totalSales,
      totalProfit,
      totalParts,
      totalCustomers,
      lowStockItems,
      totalBought: carStats[0]?.totalBought || 0,
      totalSold: carStats[0]?.totalSold || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET recent transactions
router.get('/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const cars = await Car.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('make model year type buyPrice sellPrice date customer createdAt');

    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('customerId', 'name')
      .select('invoiceNumber total date status customerId createdAt');

    const transactions = [
      ...cars.map(car => ({
        ...car.toObject(),
        transactionType: car.type,
        description: `${car.year} ${car.make} ${car.model}`,
        amount: car.type === 'buy' ? car.buyPrice : car.sellPrice,
        customerName: car.customer,
        type: 'car'
      })),
      ...invoices.map(inv => ({
        ...inv.toObject(),
        transactionType: 'invoice',
        description: `Invoice ${inv.invoiceNumber}`,
        amount: inv.total,
        customerName: inv.customerId?.name,
        type: 'invoice'
      }))
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET monthly sales data
router.get('/monthly-sales', async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyCarSales = await Car.aggregate([
      {
        $match: {
          type: 'sell',
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          sales: { $sum: '$sellPrice' },
          profit: { $sum: '$profit' }
        }
      }
    ]);

    const monthlyInvoiceSales = await Invoice.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          sales: { $sum: '$total' },
          profit: { $sum: { $multiply: ['$total', 0.3] } }
        }
      }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((month, index) => {
      const carData = monthlyCarSales.find(d => d._id.month === index + 1);
      const invoiceData = monthlyInvoiceSales.find(d => d._id.month === index + 1);
      
      const sales = (carData?.sales || 0) + (invoiceData?.sales || 0);
      const profit = (carData?.profit || 0) + (invoiceData?.profit || 0);

      return { month, sales, profit };
    });

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET inventory by category
router.get('/inventory-category', async (req, res) => {
  try {
    const categoryData = await Part.aggregate([
      {
        $group: {
          _id: '$category',
          value: { $sum: '$quantity' }
        }
      }
    ]);

    const result = categoryData.map(item => ({
      name: item._id,
      value: item.value
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
