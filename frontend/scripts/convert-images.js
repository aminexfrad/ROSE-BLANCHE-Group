const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Converting images to WebP for better performance...');

const publicDir = path.join(__dirname, '../public');
const imageExtensions = ['.jpg', '.jpeg', '.png'];

function convertImages() {
  try {
    // Check if sharp is installed
    try {
      require('sharp');
    } catch (error) {
      console.log('📦 Installing sharp for image conversion...');
      execSync('npm install sharp', { stdio: 'inherit' });
    }

    const sharp = require('sharp');
    
    function processImage(filePath) {
      const ext = path.extname(filePath).toLowerCase();
      if (!imageExtensions.includes(ext)) return;

      console.log(`🔄 Converting: ${path.basename(filePath)}`);
      
      const outputPath = filePath.replace(ext, '.webp');
      
      sharp(filePath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath)
        .then(() => {
          console.log(`✅ Converted: ${path.basename(outputPath)}`);
          
          // Get file sizes for comparison
          const originalSize = fs.statSync(filePath).size;
          const webpSize = fs.statSync(outputPath).size;
          const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
          
          console.log(`📊 Size reduction: ${savings}% (${(originalSize/1024).toFixed(1)}KB → ${(webpSize/1024).toFixed(1)}KB)`);
        })
        .catch(err => {
          console.error(`❌ Error converting ${path.basename(filePath)}:`, err.message);
        });
    }

    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else {
          processImage(filePath);
        }
      });
    }

    walkDir(publicDir);
    
    console.log('✅ Image conversion complete!');
    console.log('💡 Consider updating image references to use .webp files');
    
  } catch (error) {
    console.error('❌ Error during image conversion:', error.message);
  }
}

convertImages(); 