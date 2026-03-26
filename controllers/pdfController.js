const puppeteer = require('puppeteer');
const Bill = require('../models/Bill');
const { pdfTemplate } = require('../utils/pdfTemplate');
const { getLogoBase64 } = require('../utils/getLogoBase64');

let sharedBrowser = null;

const getBrowser = async () => {
    if (sharedBrowser && sharedBrowser.isConnected()) {
        return sharedBrowser;
    }
    
    // Launch with even more restricted resource usage for cloud environments
    sharedBrowser = await puppeteer.launch({ 
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--single-process',
            '--font-render-hinting=none' // Saves space/RAM
        ],
        timeout: 60000 
    });
    
    return sharedBrowser;
};

const generatePdf = async (req, res) => {
    let page = null;
    try {
        const { id } = req.params;
        const bill = await Bill.findById(id);
        
        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const logoBase64 = getLogoBase64();
        const html = pdfTemplate(bill, logoBase64);
        
        const browser = await getBrowser();
        page = await browser.newPage();
        
        page.setDefaultTimeout(30000); 
        
        // Optimize page settings
        await page.setViewport({ width: 800, height: 1200 });
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            printBackground: true,
            margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' },
            timeout: 30000
        });
        
        // Close page but keep browser alive for next request!
        await page.close();
        page = null;

        const filename = `${bill.billNo || 'invoice'}_${bill.clientName || 'bill'}.pdf`.replace(/[\/\\?%*:|"<>]/g, '');

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);

    } catch (err) {
        console.error('PDF generation error details:', err);
        if (page) await page.close().catch(() => {});
        res.status(500).json({ 
            message: 'Error generating PDF. Server may be missing browser binary or template error.',
            error: err.message 
        });
    }
};

module.exports = { generatePdf };
