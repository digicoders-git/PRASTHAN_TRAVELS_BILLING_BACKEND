const fs = require('fs');
const path = require('path');

const getLogoBase64 = () => {
    try {
        // Updated to the correct path provided by the user
        const logoPath = path.join(__dirname, '../../Dashbord/src/assets/Prasthan PNG.png');
        if (!fs.existsSync(logoPath)) {
            console.warn('Logo file not found at:', logoPath);
            return '';
        }
        const bitmap = fs.readFileSync(logoPath);
        return `data:image/png;base64,${new Buffer.from(bitmap).toString('base64')}`;
    } catch (err) {
        console.error('Logo Base64 Error:', err);
        return '';
    }
};

module.exports = { getLogoBase64 };
