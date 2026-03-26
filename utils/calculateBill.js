const calculateBillData = (items) => {
    let subTotal = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let totalQty = 0;

    const updatedItems = items.map((item) => {
        const itemSubTotal = item.qty * item.rate;
        const totalGSTAmount = (itemSubTotal * (item.gstRate || 0)) / 100;
        
        let it_cgst = 0;
        let it_sgst = 0;
        let it_igst = 0;

        // Simple logic: Assume intra-state (CGST + SGST) for now. 
        // Can be refined later based on client/provider location.
        it_cgst = totalGSTAmount / 2;
        it_sgst = totalGSTAmount / 2;

        subTotal += itemSubTotal;
        cgstAmount += it_cgst;
        sgstAmount += it_sgst;
        totalQty += item.qty;

        return {
            ...item,
            cgst: it_cgst,
            sgst: it_sgst,
            total: itemSubTotal + totalGSTAmount
        };
    });

    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const totalAmount = subTotal + totalTax;

    return {
        updatedItems,
        totalQty,
        totalTax,
        cgstAmount,
        sgstAmount,
        igstAmount,
        subTotal,
        totalAmount
    };
};

module.exports = { calculateBillData };
