const sharp = require('sharp');

/**
 * Resize image with optional width and/or height
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to output image
 * @param {object} options - Resize options
 */
async function resizeImage(inputPath, outputPath, options) {
  const { width, height } = options;
  
  // Validate that at least one dimension is provided
  if (!width && !height) {
    throw new Error('At least one of --w (width) or --h (height) must be specified');
  }
  
  // Parse dimensions to integers
  const w = width ? parseInt(width, 10) : null;
  const h = height ? parseInt(height, 10) : null;
  
  // Validate dimensions
  if (w !== null && (isNaN(w) || w <= 0)) {
    throw new Error('Width must be a positive number');
  }
  if (h !== null && (isNaN(h) || h <= 0)) {
    throw new Error('Height must be a positive number');
  }
  
  // Build sharp pipeline
  let pipeline = sharp(inputPath);
  
  // Apply resize based on provided dimensions
  if (w && h) {
    // Both dimensions: fit within box, maintain aspect ratio
    pipeline = pipeline.resize(w, h, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    });
  } else if (w) {
    // Only width: scale height proportionally
    pipeline = pipeline.resize(w, null);
  } else {
    // Only height: scale width proportionally
    pipeline = pipeline.resize(null, h);
  }
  
  // Save the output
  await pipeline.toFile(outputPath);
}

module.exports = {
  resizeImage
};

