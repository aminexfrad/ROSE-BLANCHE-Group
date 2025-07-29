const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Optimizing images for better performance...');

const publicDir = path.join(__dirname, '../public');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

function optimizeImages() {
  try {
    // Check if sharp is installed
    try {
      require('sharp');
    } catch (error) {
      console.log('📦 Installing sharp for image optimization...');
      execSync('npm install sharp', { stdio: 'inherit' });
    }

    const sharp = require('sharp');
    
    function processImage(filePath) {
      const ext = path.extname(filePath).toLowerCase();
      if (!imageExtensions.includes(ext)) return;

      console.log(`🔄 Processing: ${path.basename(filePath)}`);
      
      const outputPath = filePath.replace(ext, '.webp');
      
      sharp(filePath)
        .webp({ quality: 85 })
        .toFile(outputPath)
        .then(() => {
          console.log(`✅ Optimized: ${path.basename(outputPath)}`);
        })
        .catch(err => {
          console.error(`❌ Error optimizing ${path.basename(filePath)}:`, err.message);
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
    
    console.log('✅ Image optimization complete!');
    console.log('💡 Consider replacing .jpg/.png files with .webp versions for better performance');
    
  } catch (error) {
    console.error('❌ Error during image optimization:', error.message);
  }
}

optimizeImages(); 