const sharp = require('sharp');

/**
 * Position mapping to sharp's gravity/position values
 */
const POSITION_MAP = {
  'center': 'centre',
  'top': 'north',
  'bottom': 'south',
  'left': 'west',
  'right': 'east',
  'top-left': 'northwest',
  'top-right': 'northeast',
  'bottom-left': 'southwest',
  'bottom-right': 'southeast'
};

/**
 * Crop image to specific dimensions
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to output image
 * @param {object} options - Crop options
 */
async function cropImage(inputPath, outputPath, options) {
  const { width, height, position = 'center' } = options;
  
  // Validate required dimensions
  if (!width || !height) {
    throw new Error('Both --w (width) and --h (height) are required for cropping');
  }
  
  // Parse dimensions to integers
  const w = parseInt(width, 10);
  const h = parseInt(height, 10);
  
  // Validate dimensions
  if (isNaN(w) || w <= 0) {
    throw new Error('Width must be a positive number');
  }
  if (isNaN(h) || h <= 0) {
    throw new Error('Height must be a positive number');
  }
  
  // Validate and map position
  const pos = position.toLowerCase();
  if (!POSITION_MAP[pos]) {
    throw new Error(`Invalid position: ${position}. Valid positions: ${Object.keys(POSITION_MAP).join(', ')}`);
  }
  
  // Build sharp pipeline
  const pipeline = sharp(inputPath).resize(w, h, {
    fit: 'cover',
    position: POSITION_MAP[pos]
  });
  
  // Save the output
  await pipeline.toFile(outputPath);
}

module.exports = {
  cropImage,
  POSITION_MAP
};

