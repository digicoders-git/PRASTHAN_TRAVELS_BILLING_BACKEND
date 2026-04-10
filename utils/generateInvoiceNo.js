const Bill = require('../models/Bill');

const generateInvoiceNo = async () => {
    try {
        // Find the last bill sorted by creation time
        const lastBill = await Bill.findOne({}, { billNo: 1 }).sort({ createdAt: -1 });

        let nextNo = 1;

        if (lastBill && lastBill.billNo) {
            // Extract number from format PT/001
            const match = lastBill.billNo.match(/PT\/(\d+)/);
            if (match) {
                nextNo = parseInt(match[1]) + 1;
            }
        }

        // Keep incrementing until we find a unique billNo
        let billNo;
        let exists = true;
        while (exists) {
            billNo = `PT/${String(nextNo).padStart(3, '0')}`;
            exists = await Bill.exists({ billNo });
            if (exists) nextNo++;
        }

        return billNo;
    } catch (err) {
        console.error('Error generating invoice number:', err);
        return `PT/TEMP-${Date.now()}`;
    }
};

module.exports = { generateInvoiceNo };
