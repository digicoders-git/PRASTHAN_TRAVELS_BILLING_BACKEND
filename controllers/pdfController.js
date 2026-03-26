const puppeteer = require('puppeteer');
const Bill = require('../models/Bill');
const { pdfTemplate } = require('../utils/pdfTemplate');
const { getLogoBase64 } = require('../utils/getLogoBase64');

const generatePdf = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const logoBase64 = getLogoBase64();
        const html = pdfTemplate(bill, logoBase64);
        
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        
        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename=Bill-${bill.billNo}.pdf`
        });
        res.send(pdfBuffer);
    } catch (err) {
        console.error('PDF error:', err);
        res.status(500).json({ message: 'Error generating PDF: ' + err.message });
    }
};

module.exports = { generatePdf };
