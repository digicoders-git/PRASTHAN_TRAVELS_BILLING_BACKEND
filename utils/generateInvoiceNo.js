const Bill = require('../models/Bill');

const generateInvoiceNo = async () => {
    try {
        const totalBills = await Bill.countDocuments();
        const nextNo = totalBills + 1;
        
        // Simple counter starting with GST/001
        const paddedNo = String(nextNo).padStart(3, '0');
        return `PT/${paddedNo}`;
    } catch (err) {
        console.error('Error generating invoice number:', err);
        return `PT/TEMP-${Math.floor(Math.random() * 1000)}`;
    }
};

module.exports = { generateInvoiceNo };
