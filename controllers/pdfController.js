const puppeteer = require('puppeteer');
const Bill = require('../models/Bill');
const { pdfTemplate } = require('../utils/pdfTemplate');
const { getLogoBase64 } = require('../utils/getLogoBase64');

const generatePdf = async (req, res) => {
    let browser = null;
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Requested bill record not found' });
        }

        const logoBase64 = getLogoBase64();
        const html = pdfTemplate(bill, logoBase64);
        
        // Launch with more robust arguments for server environments
        browser = await puppeteer.launch({ 
            headless: true, // Standard headless mode
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
            // For Vercel, we often need executablePath pointing to chromium, 
            // but for local/VPS standard puppeteer works.
        });

        const page = await browser.newPage();
        
        // Use networkidle0 to ensure all assets (css/images) are loaded if any
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });
        
        await browser.close();
        browser = null;

        const safeFileName = `Bill-${bill.billNo.replace(/[\/\\]/g, '-')}.pdf`;

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename="${safeFileName}"`,
            'Cache-Control': 'no-cache'
        });
        
        res.send(pdfBuffer);
    } catch (err) {
        console.error('PDF generation error details:', err);
        if (browser) await browser.close();
        res.status(500).json({ 
            message: 'Error generating PDF. Server may be missing browser binary or template error.',
            error: err.message 
        });
    }
};

module.exports = { generatePdf };
