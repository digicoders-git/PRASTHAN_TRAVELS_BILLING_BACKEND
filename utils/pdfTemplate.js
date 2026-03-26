const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const inWords = (n) => {
        if ((n = n.toString()).length > 9) return 'Overflow';
        let nStr = ('000000000' + n).substr(-9);
        let nArray = nStr.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!nArray) return '';
        let str = '';
        str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
        str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
        str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
        str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
        str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) + 'only ' : 'only';
        return str;
    };
    return inWords(Math.floor(num));
};

const pdfTemplate = (bill, logoBase64 = '') => {
    const { 
        billNo, clientName, clientAddress, clientGSTIN, items, 
        totalAmount, subTotal, totalTax, createdAt, isGstEnabled 
    } = bill;

    const billDate = new Date(createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const amountInWords = numberToWords(totalAmount);
    
    // Unified Logo & Watermark Logic
    const headerLogoHtml = logoBase64 ? `<img src="${logoBase64}" style="max-height: 70px; width: auto; object-fit: contain; margin-bottom: 5px;" />` : '';

    const watermarkHtml = logoBase64 ? `
        <div style="position: absolute; top: 35%; left: 10%; width: 80%; opacity: 0.12; transform: rotate(-30deg); z-index: -1; pointer-events: none; text-align: center;">
            <img src="${logoBase64}" style="width: 100%; height: auto;" />
        </div>
    ` : '';

    const invoiceTitle = isGstEnabled ? 'TAX INVOICE' : 'ESTIMATE / QUOTATION';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; color: #000; font-size: 13px; }
            .wrapper { border: 2px solid #000; max-width: 800px; margin: auto; padding: 0px; position: relative; min-height: 1000px; }
            .top-pan { border-bottom: 2px solid #000; display: flex; justify-content: space-between; padding: 5px 15px; font-weight: bold; font-size: 12px; }
            
            .header { text-align: center; border-bottom: 2px solid #000; padding: 15px; background: #fff; }
            .comp-name { font-size: 32px; font-weight: 950; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; margin-top: 5px; }
            .comp-addr { font-size: 11px; font-weight: 600; line-height: 1.6; }
            
            .info-section { display: flex; border-bottom: 2px solid #000; min-height: 130px; }
            .left-box { width: 60.3%; border-right: 2px solid #000; padding: 12px 15px; }
            .right-box { width: 39.7%; padding: 12px 15px; }
            .box-title { font-weight: 900; text-decoration: underline; margin-bottom: 15px; display: block; text-align: center; font-size: 14px; text-transform: uppercase; }
            
            .data-row { margin-bottom: 10px; font-weight: bold; }
            .line-fill { border-bottom: 1.5px dotted #000; min-width: 160px; display: inline-block; font-weight: bold; }
            
            .table-main { width: 100%; border-collapse: collapse; }
            .table-main th, .table-main td { border: 1.5px solid #000; padding: 8px 10px; text-align: left; }
            .table-main th { text-align: center; font-weight: 900; background: #f0f0f0; border-top: none; }
            .table-main td { vertical-align: top; }
            
            .footer-box { display: flex; justify-content: flex-end; border: 1.5px solid #000; border-top: none; }
            .footer-label { width: 25.4%; background: #f0f0f0; padding: 8px; font-weight: 950; text-align: center; border-right: 2px solid #000; border-left: 2px solid #000; border-top: 2px solid #000;}
            .footer-val { width: 17%; padding: 8px; font-weight: 950; text-align: right; border-top: 2px solid #000;}
            
            .inbound-words { border-top: 1.5px solid #000; padding: 10px 15px; font-weight: bold; }
            .sign-section { display: flex; justify-content: space-between; align-items: flex-end; padding: 10px 15px 15px 15px; margin-top: auto; }
            .auth-side { text-align: right; font-weight: bold; }
            
            .empty-row { height: 25px; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            ${watermarkHtml}
            <div class="top-pan">
                <span>PAN: GWKPS6928H</span>
                <span>${invoiceTitle}</span>
            </div>
            
            <div class="header">
                ${headerLogoHtml}
                <div class="comp-name">PRASTHAN TRAVELS</div>
                <div class="comp-addr">
                    PLOT NO.-54 KESHAV NAGAR, FAZULLAGANJ, SITAPUR ROAD, LUCKNOW, PIN: 226020<br>
                    MOB : +91 7801898441, +91 90055 96777
                </div>
            </div>

            <div class="info-section">
                <div class="left-box">
                    <span class="box-title">Detail of Receiver / Consignee</span>
                    <div class="data-row">Name : <span class="line-fill">${(clientName || 'GUEST').toUpperCase()}</span></div>
                    <div class="data-row">Address : <span class="line-fill">${clientAddress || 'AS PER RECORDS'}</span></div>
                    <div class="data-row">GSTIN NO. : <span class="line-fill">${clientGSTIN || 'N/A'}</span></div>
                </div>
                <div class="right-box">
                    <div class="data-row" style="margin-top:20px;">Invoice No. : <strong>${billNo || 'N/A'}</strong></div>
                    <div class="data-row">Date : <strong>${billDate || 'N/A'}</strong></div>
                </div>
            </div>

            <table class="table-main">
                <thead>
                    <tr>
                        <th style="width: 8%;">S. NO.</th>
                        <th style="width: 45%;">Description</th>
                        <th style="width: 10%;">Unit</th>
                        <th style="width: 10%;">Qty.</th>
                        <th style="width: 12%;">Rate</th>
                        <th style="width: 15%;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${(items || []).map((item, idx) => `
                        <tr>
                            <td style="text-align: center;">${idx + 1}</td>
                            <td>${item.description || 'Service'}</td>
                            <td style="text-align: center;">NOS</td>
                            <td style="text-align: center;">${item.qty || 0}</td>
                            <td style="text-align: right;">${(item.rate || 0).toLocaleString('en-IN')}</td>
                            <td style="text-align: right; font-weight: bold;">${((item.qty || 0) * (item.rate || 0)).toLocaleString('en-IN')}</td>
                        </tr>
                    `).join('')}
                    <!-- Dynamic filler to maintain spacing -->
                    ${Array(Math.max(0, 8 - (items?.length || 0))).fill('<tr class="empty-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>').join('')}
                    <tr style="height: 150px;"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                </tbody>
            </table>

            <div class="footer-box"><div class="footer-label" style="width: 44.8%;">OTHER CHARGES</div><div class="footer-val" style="width: 12.8%;">0.00</div></div>
            ${isGstEnabled ? `
                <div class="footer-box"><div class="footer-label" style="width: 44.8%;">GST (18%)</div><div class="footer-val" style="width: 12.8%;">${(totalTax || 0).toLocaleString('en-IN')}</div></div>
            ` : ''}
            <div class="footer-box" style="background:#f0f0f0;">
                <div class="footer-label" style="width: 44.8%; border-bottom: 2px solid #000;">GRAND TOTAL</div>
                <div class="footer-val" style="width: 12.8%; border-bottom: 2px solid #000;">₹ ${(totalAmount || 0).toLocaleString('en-IN')}</div>
            </div>

            <div class="inbound-words">Total Amount (in words) : RUPEES ${amountInWords.toUpperCase()}</div>

            <div class="sign-section">
                <div style="font-size: 10px;">E. & O. E.<br>Subject to Lucknow Jurisdiction.</div>
                <div class="auth-side">
                    <div>For <strong>PRASTHAN TRAVELS</strong></div>
                    <div style="margin-top: 50px; border-top: 1px solid #000; padding-top: 5px;">Authorized Signatory</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { pdfTemplate };
