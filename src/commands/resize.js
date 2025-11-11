const sharp = require('sharp');

/**
 * Parse dimension value (can be number or keyword like "half", "quarter", "third")
 * @param {string|number} value - Dimension value
 * @param {number} originalSize - Original image dimension
 * @returns {number|null} Parsed dimension or null
 */
function parseDimension(value, originalSize) {
  if (!value) return null;
  
  const strValue = String(value).toLowerCase().trim();
  
  // Handle keyword values
  switch (strValue) {
    case 'half':
      return Math.floor(originalSize / 2);
    case 'quarter':
      return Math.floor(originalSize / 4);
    case 'third':
      return Math.floor(originalSize / 3);
    default:
      // Try to parse as number
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0) {
        throw new Error(`Invalid dimension value: ${value}. Use a positive number or keywords: half, quarter, third`);
      }
      return num;
  }
}

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
  
  // Get image metadata to determine original dimensions (needed for keywords)
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const imgWidth = metadata.width;
  const imgHeight = metadata.height;
  
  // Parse dimensions (can be numbers or keywords like "half", "quarter", "third")
  const w = parseDimension(width, imgWidth);
  const h = parseDimension(height, imgHeight);
  
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

