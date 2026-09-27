const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { from: /#0f172a/gi, to: '#0f141f' }, // Background
  { from: /#1e293b/gi, to: '#293243' }, // Cards/Surfaces
  { from: /#334155/gi, to: '#2f3a4e' }, // Borders
  { from: /#475569/gi, to: '#425576' }, // Secondary Borders
  { from: /#3b82f6/gi, to: '#e86331' }, // Primary Blue -> Copper Orange
  { from: /rgba\(59,\s*130,\s*246,/gi, to: 'rgba(232, 99, 49,' }, // rgba primary
  { from: /#ffffff/gi, to: '#f4f6f8' }, // Main text
  { from: /#f8fafc/gi, to: '#f4f6f8' }, // Main text alt
  { from: /#cbd5e1/gi, to: '#c9d3df' }, // Subtext
  { from: /#94a3b8/gi, to: '#a2b2c7' }, // Muted text
  { from: /#64748b/gi, to: '#748bac' }, // Muted text 2
  { from: /#60a5fa/gi, to: '#f08b65' }, // Light blue text
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated theme in: ${fullPath.replace(srcDir, '')}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Global theme update completed!');
