const path = require('path');
const puppeteer = require('puppeteer');
const Bill = require('../models/Bill');
const { pdfTemplate } = require('../utils/pdfTemplate');
const { getLogoBase64 } = require('../utils/getLogoBase64');

let sharedBrowser = null;

const findExecutable = () => {
    const fs = require('fs');

    // Common Windows Chrome paths
    const windowsPaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ];
    for (const p of windowsPaths) {
        if (fs.existsSync(p)) return p;
    }

    // Fallback: search puppeteer cache
    const cachePath = path.join(process.cwd(), '.cache/puppeteer');
    if (!fs.existsSync(cachePath)) return undefined;
    const findFile = (dir, target) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                const found = findFile(fullPath, target);
                if (found) return found;
            } else if (file === target) return fullPath;
        }
        return null;
    };
    return findFile(cachePath, 'chrome.exe') || findFile(cachePath, 'chrome');
};

let browserPromise = null;

const getBrowser = async () => {
    // If browser exists and is connected, return it
    if (browserPromise) {
        try {
            const browser = await browserPromise;
            if (browser.isConnected()) return browser;
        } catch (e) {
            browserPromise = null; // Reset on failure
        }
    }

    // Attempt to find executable dynamically
    const executablePath = findExecutable();
    console.log('Final Executable Search Result:', executablePath || 'NOT FOUND - using default');

    // Create a new promise for launching the browser
    browserPromise = puppeteer.launch({ 
        headless: true,
        executablePath: executablePath || undefined,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        timeout: 60000 
    }).catch(err => {
        console.error('PUPEER LAUNCH FAILED:', err.message);
        browserPromise = null;
        throw err;
    });

    return browserPromise;
};

const generatePdf = async (req, res) => {
    let page = null;
    try {
        const { id } = req.params;
        console.log('Generating PDF for Bill ID:', id);

        const bill = await Bill.findById(id);
        if (!bill) {
            console.error('Bill NOT found in Database:', id);
            return res.status(404).json({ message: 'Bill record missing' });
        }

        console.log('Bill loaded, preparing template...');
        const logoBase64 = getLogoBase64();
        const html = pdfTemplate(bill, logoBase64);
        
        console.log('Template generated, requesting browser...');
        const browser = await getBrowser();
        
        console.log('Browser ready, creating new page...');
        page = await browser.newPage();
        
        page.setDefaultTimeout(30000); 
        await page.setViewport({ width: 800, height: 1200 });
        
        console.log('Setting HTML content...');
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        
        console.log('Rendering PDF buffer...');
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            printBackground: true,
            margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' },
            timeout: 30000
        });
        
        await page.close();
        page = null;
        console.log('PDF Generated successfully, sending to client');

        const filename = `${bill.billNo || 'invoice'}_${bill.clientName || 'bill'}.pdf`.replace(/[\/\\?%*:|"<>]/g, '');
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);

    } catch (err) {
        console.error('CRITICAL PDF ERROR:', err);
        if (page) await page.close().catch(() => {});
        res.status(500).json({ 
            message: 'PDF Engine Error',
            error: err.message 
        });
    }
};

module.exports = { generatePdf };
