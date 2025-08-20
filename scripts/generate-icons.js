const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icons/icon-base.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons...');
  
  for (const size of sizes) {
    try {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(svgPath)
        .resize(size, size)
        .png({
          quality: 100,
          compressionLevel: 6
        })
        .toFile(outputPath);
        
      console.log(`✓ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`✗ Error generating ${size}x${size} icon:`, error.message);
    }
  }
  
  console.log('🎉 Icon generation complete!');
}

generateIcons().catch(console.error);