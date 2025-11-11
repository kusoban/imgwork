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
 * Calculate crop coordinates based on position
 * @param {number} imgWidth - Original image width
 * @param {number} imgHeight - Original image height
 * @param {number} cropWidth - Desired crop width
 * @param {number} cropHeight - Desired crop height
 * @param {string} position - Position where to crop from
 * @returns {object} Crop coordinates {left, top}
 */
function calculateCropCoordinates(imgWidth, imgHeight, cropWidth, cropHeight, position) {
  let left = 0;
  let top = 0;
  
  switch (position) {
    case 'center':
    case 'centre':
      left = Math.max(0, Math.floor((imgWidth - cropWidth) / 2));
      top = Math.max(0, Math.floor((imgHeight - cropHeight) / 2));
      break;
    case 'top':
    case 'north':
      left = Math.max(0, Math.floor((imgWidth - cropWidth) / 2));
      top = 0;
      break;
    case 'bottom':
    case 'south':
      left = Math.max(0, Math.floor((imgWidth - cropWidth) / 2));
      top = Math.max(0, imgHeight - cropHeight);
      break;
    case 'left':
    case 'west':
      left = 0;
      top = Math.max(0, Math.floor((imgHeight - cropHeight) / 2));
      break;
    case 'right':
    case 'east':
      left = Math.max(0, imgWidth - cropWidth);
      top = Math.max(0, Math.floor((imgHeight - cropHeight) / 2));
      break;
    case 'top-left':
    case 'northwest':
      left = 0;
      top = 0;
      break;
    case 'top-right':
    case 'northeast':
      left = Math.max(0, imgWidth - cropWidth);
      top = 0;
      break;
    case 'bottom-left':
    case 'southwest':
      left = 0;
      top = Math.max(0, imgHeight - cropHeight);
      break;
    case 'bottom-right':
    case 'southeast':
      left = Math.max(0, imgWidth - cropWidth);
      top = Math.max(0, imgHeight - cropHeight);
      break;
    default:
      // Default to center
      left = Math.max(0, Math.floor((imgWidth - cropWidth) / 2));
      top = Math.max(0, Math.floor((imgHeight - cropHeight) / 2));
  }
  
  return { left, top };
}

/**
 * Crop image to specific dimensions
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to output image
 * @param {object} options - Crop options
 */
async function cropImage(inputPath, outputPath, options) {
  const { width, height, position = 'center' } = options;
  
  // Validate that at least one dimension is provided
  if (!width && !height) {
    throw new Error('At least one of --w (width) or --h (height) must be specified for cropping');
  }
  
  // Validate position
  const pos = position.toLowerCase();
  if (!POSITION_MAP[pos]) {
    throw new Error(`Invalid position: ${position}. Valid positions: ${Object.keys(POSITION_MAP).join(', ')}`);
  }
  
  // Get image metadata to determine original dimensions
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const imgWidth = metadata.width;
  const imgHeight = metadata.height;
  
  // Parse dimensions (can be numbers or keywords like "half", "quarter", "third")
  let cropWidth = parseDimension(width, imgWidth);
  let cropHeight = parseDimension(height, imgHeight);
  
  // Calculate missing dimension while maintaining aspect ratio
  if (cropWidth && !cropHeight) {
    // Only width provided: calculate height proportionally
    const aspectRatio = imgHeight / imgWidth;
    cropHeight = Math.floor(cropWidth * aspectRatio);
  } else if (cropHeight && !cropWidth) {
    // Only height provided: calculate width proportionally
    const aspectRatio = imgWidth / imgHeight;
    cropWidth = Math.floor(cropHeight * aspectRatio);
  }
  
  // Validate that crop dimensions don't exceed image dimensions
  if (cropWidth > imgWidth) {
    throw new Error(`Crop width (${cropWidth}) exceeds image width (${imgWidth})`);
  }
  if (cropHeight > imgHeight) {
    throw new Error(`Crop height (${cropHeight}) exceeds image height (${imgHeight})`);
  }
  
  // Calculate crop coordinates based on position
  const { left, top } = calculateCropCoordinates(
    imgWidth,
    imgHeight,
    cropWidth,
    cropHeight,
    POSITION_MAP[pos]
  );
  
  // Crop the image using extract (no resizing, pure crop)
  await sharp(inputPath)
    .extract({
      left: left,
      top: top,
      width: cropWidth,
      height: cropHeight
    })
    .toFile(outputPath);
}

module.exports = {
  cropImage,
  POSITION_MAP
};

