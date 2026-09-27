const fs = require('fs');
const path = require('path');

const readmePath = path.join(__dirname, 'README.md');
let content = fs.readFileSync(readmePath, 'utf8');

// Replace standard occurrences
content = content.replace(/\[\!\[Twilio\].*?\]\(.*?\)/g, '[![Fast2SMS](https://img.shields.io/badge/Fast2SMS-SMS-blue.svg)](https://www.fast2sms.com/)');
content = content.replace(/- Twilio IVR helpline for voice bookings/g, '- Fast2SMS integration for SMS alerts');
content = content.replace(/- SMS confirmations \(Twilio\)/g, '- SMS confirmations (Fast2SMS)');
content = content.replace(/│Twilio IVR    │/g, '│Fast2SMS API  │');
content = content.replace(/Twilio SDK                - Voice\/SMS/g, 'Fast2SMS                  - SMS API');
content = content.replace(/Twilio                    - Voice & SMS/g, 'Fast2SMS                  - SMS');
content = content.replace(/- Twilio Account \(for IVR & SMS\)/g, '- Fast2SMS API Key (for SMS)');

const twilioEnvRegex = /# Twilio\nTWILIO_ACCOUNT_SID=your_account_sid\nTWILIO_AUTH_TOKEN=your_auth_token\nTWILIO_PHONE_NUMBER=\+1234567890\nTWILIO_IVR_NUMBER=\+1234567890/g;
content = content.replace(twilioEnvRegex, '# Fast2SMS\nFAST2SMS_API_KEY=your_fast2sms_api_key');

content = content.replace(/Twilio incoming call webhook/g, 'Incoming call webhook (Deprecated)');
content = content.replace(/- Twilio for Voice & SMS APIs/g, '- Fast2SMS for SMS APIs');

fs.writeFileSync(readmePath, content, 'utf8');
console.log('Updated README.md');
