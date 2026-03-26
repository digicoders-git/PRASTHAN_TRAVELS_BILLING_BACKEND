const Bill = require('../models/Bill');
const { calculateBillData } = require('../utils/calculateBill');
const { generateInvoiceNo } = require('../utils/generateInvoiceNo');

// @desc Create new bill
const createBill = async (req, res) => {
    try {
        const { clientName, items, isGstEnabled } = req.body;

        if (!clientName || !items || items.length === 0) {
            return res.status(400).json({ message: 'Missing required data' });
        }

        const billData = calculateBillData(items);
        const billNo = await generateInvoiceNo();

        const newBill = new Bill({
            ...req.body,
            billNo,
            items: billData.updatedItems,
            totalQty: billData.totalQty,
            totalTax: billData.totalTax,
            cgstAmount: billData.cgstAmount,
            sgstAmount: billData.sgstAmount,
            igstAmount: billData.igstAmount,
            subTotal: billData.subTotal,
            totalAmount: billData.totalAmount,
            isGstEnabled
        });

        await newBill.save();
        res.status(201).json(newBill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get all bills with search/pagination
const getBills = async (req, res) => {
    try {
        const { search, status, from, to } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { clientName: { $regex: search, $options: 'i' } },
                { billNo: { $regex: search, $options: 'i' } },
                { clientGSTIN: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        if (from && to) {
            const endDate = new Date(to);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = {
                $gte: new Date(from),
                $lte: endDate
            };
        }

        const bills = await Bill.find(query).sort({ createdAt: -1 });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get bill stats
const getStats = async (req, res) => {
    try {
        const totalBills = await Bill.countDocuments();
        const paidBills = await Bill.countDocuments({ status: 'Paid' });
        const unpaidBills = await Bill.countDocuments({ status: 'Unpaid' });
        const pendingBills = await Bill.countDocuments({ status: 'Pending' });
        const gstCount = await Bill.countDocuments({ isGstEnabled: true });
        const nonGstCount = await Bill.countDocuments({ isGstEnabled: false });

        // Total Customers (Unique names)
        const totalCustomers = (await Bill.distinct('clientName')).length;

        // Today's Sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySalesResult = await Bill.aggregate([
            { $match: { createdAt: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const todaySales = todaySalesResult[0] ? todaySalesResult[0].total : 0;

        const result = await Bill.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalTax: { $sum: '$totalTax' }
                }
            }
        ]);

        res.json({
            count: totalBills,
            paid: paidBills,
            unpaid: unpaidBills,
            pending: pendingBills,
            revenue: result[0] ? result[0].totalRevenue : 0,
            tax: result[0] ? result[0].totalTax : 0,
            gstCount,
            nonGstCount,
            totalCustomers,
            todaySales
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc Get unique customers from bills
const getUniqueCustomers = async (req, res) => {
    try {
        const customers = await Bill.aggregate([
            {
                $group: {
                    _id: '$clientName',
                    name: { $first: '$clientName' },
                    address: { $first: '$clientAddress' },
                    gstin: { $first: '$clientGSTIN' },
                    totalBills: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    lastBillDate: { $max: '$createdAt' }
                }
            },
            { $sort: { lastBillDate: -1 } }
        ]);
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// CRUD for singular bill id
const getBillById = async (req, res) => {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'not found' });
    res.json(bill);
};

const updateBill = async (req, res) => {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bill);
};

const deleteBill = async (req, res) => {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted' });
};

module.exports = {
    createBill,
    getBills,
    getStats,
    getBillById,
    updateBill,
    deleteBill,
    getUniqueCustomers
};
