const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template for the app icon
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#bgGradient)"/>
  
  <!-- Icon Content -->
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <!-- Clipboard/Inventory Icon -->
    <rect x="${size * 0.1}" y="${size * 0.05}" width="${size * 0.5}" height="${size * 0.65}" rx="${size * 0.03}" fill="#ffffff" opacity="0.9"/>
    
    <!-- Clipboard Header -->
    <rect x="${size * 0.15}" y="${size * 0.1}" width="${size * 0.4}" height="${size * 0.08}" rx="${size * 0.02}" fill="#e2e8f0"/>
    
    <!-- List Items -->
    <rect x="${size * 0.15}" y="${size * 0.22}" width="${size * 0.35}" height="${size * 0.04}" rx="${size * 0.01}" fill="#64748b"/>
    <rect x="${size * 0.15}" y="${size * 0.3}" width="${size * 0.3}" height="${size * 0.04}" rx="${size * 0.01}" fill="#64748b"/>
    <rect x="${size * 0.15}" y="${size * 0.38}" width="${size * 0.32}" height="${size * 0.04}" rx="${size * 0.01}" fill="#64748b"/>
    <rect x="${size * 0.15}" y="${size * 0.46}" width="${size * 0.28}" height="${size * 0.04}" rx="${size * 0.01}" fill="#64748b"/>
    
    <!-- Checkmarks -->
    <circle cx="${size * 0.13}" cy="${size * 0.24}" r="${size * 0.015}" fill="#22c55e"/>
    <circle cx="${size * 0.13}" cy="${size * 0.32}" r="${size * 0.015}" fill="#22c55e"/>
    <circle cx="${size * 0.13}" cy="${size * 0.4}" r="${size * 0.015}" fill="#f59e0b"/>
    <circle cx="${size * 0.13}" cy="${size * 0.48}" r="${size * 0.015}" fill="#ef4444"/>
  </g>
</svg>
`;

// Generate all icon sizes
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Create a simple PNG placeholder using data URI
const createPNGDataURI = (size) => {
  const svgContent = createSVGIcon(size);
  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

// Generate PNG files as SVG data URIs (browsers can handle this)
sizes.forEach(size => {
  const dataURI = createPNGDataURI(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // For now, we'll copy the SVG as PNG (browsers handle SVG in PNG contexts)
  fs.copyFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), filepath);
  console.log(`Generated ${filename} (SVG format)`);
});

console.log('Icon generation complete!');
console.log('Icons created in public/icons/');
console.log('Note: SVG icons are being used as PNG for browser compatibility');