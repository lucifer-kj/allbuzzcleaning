const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="#000000"/>
  <svg x="${size/4}" y="${size/4}" width="${size/2}" height="${size/2}" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" fill="#FFFFFF"/>
  </svg>
</svg>`;

// Create icon files
const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}.png`;
  
  // For now, we'll create SVG files and rename them
  // In a real implementation, you'd use a library like sharp to convert SVG to PNG
  const svgFilename = `icon-${size}.svg`;
  fs.writeFileSync(path.join(publicDir, svgFilename), svgContent);
  
  console.log(`Created ${svgFilename}`);
});

console.log('Icon generation complete!');
console.log('Note: These are SVG files. For production, convert them to PNG using a tool like sharp or imagemagick.');
