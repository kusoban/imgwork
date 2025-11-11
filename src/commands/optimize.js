const sharp = require('sharp');
const path = require('path');

/**
 * Optimize image file size
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to output image
 * @param {object} options - Optimization options
 */
async function optimizeImage(inputPath, outputPath, options) {
  const { quality, lossless } = options;
  
  // Validate that either quality or lossless is provided
  if (!quality && !lossless) {
    throw new Error('Either --quality <number> or --lossless flag must be specified');
  }
  
  if (quality && lossless) {
    throw new Error('Cannot use both --quality and --lossless. Choose one.');
  }
  
  // Parse and validate quality
  let q = null;
  if (quality) {
    q = parseInt(quality, 10);
    if (isNaN(q) || q < 1 || q > 100) {
      throw new Error('Quality must be a number between 1 and 100');
    }
  }
  
  // Detect input format
  const ext = path.extname(inputPath).toLowerCase();
  let format = null;
  
  if (ext === '.jpg' || ext === '.jpeg') {
    format = 'jpeg';
  } else if (ext === '.png') {
    format = 'png';
  } else if (ext === '.webp') {
    format = 'webp';
  } else if (ext === '.tiff' || ext === '.tif') {
    format = 'tiff';
  } else if (ext === '.gif') {
    format = 'gif';
  }
  
  // Build sharp pipeline
  let pipeline = sharp(inputPath);
  
  if (lossless) {
    // Lossless optimization: strip metadata and apply format-specific lossless compression
    pipeline = pipeline.withMetadata({ orientation: 1 }); // Keep only orientation
    
    if (format === 'png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ lossless: true });
    } else if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: 100, mozjpeg: true });
    } else {
      // For other formats, just strip metadata
      pipeline = pipeline.toFormat(format);
    }
  } else {
    // Quality-based optimization
    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: q, mozjpeg: true });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality: q });
    } else if (format === 'png') {
      // PNG doesn't use quality in the same way, but we can adjust compression
      const compressionLevel = Math.round((100 - q) / 10);
      pipeline = pipeline.png({ compressionLevel: Math.max(0, Math.min(9, compressionLevel)) });
    } else {
      // For formats that don't support quality, just copy
      pipeline = pipeline.toFormat(format);
    }
  }
  
  // Save the output
  await pipeline.toFile(outputPath);
}

module.exports = {
  optimizeImage
};

