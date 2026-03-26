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
        
        // Launch with even more restricted resource usage for cloud environments
        browser = await puppeteer.launch({ 
            headless: true,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--single-process' // Saves RAM on some environments
            ],
            timeout: 60000 // 60s timeout for launch
        });

        const page = await browser.newPage();
        page.setDefaultTimeout(30000); // 30s timeout for page operations
        
        // Since we use Base64 for images, we don't need to wait for network
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            printBackground: true,
            margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' },
            timeout: 30000
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
