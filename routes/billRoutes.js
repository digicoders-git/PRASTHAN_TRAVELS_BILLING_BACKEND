const express = require('express');
const router = express.Router();
const { 
    createBill, 
    getBills, 
    getStats, 
    getBillById, 
    updateBill, 
    deleteBill,
    getUniqueCustomers
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.get('/customers', protect, getUniqueCustomers);

router.route('/')
    .get(protect, getBills)
    .post(protect, createBill);

router.get('/stats', protect, getStats);

router.route('/:id')
    .get(protect, getBillById)
    .put(protect, updateBill)
    .delete(protect, deleteBill);

module.exports = router;
