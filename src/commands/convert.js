const sharp = require('sharp');
const path = require('path');

/**
 * Supported output formats
 */
const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'tiff'];

/**
 * Convert image to a different format
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to output image
 * @param {object} options - Conversion options
 */
async function convertImage(inputPath, outputPath, options) {
  const { format, quality } = options;
  
  // Validate format
  if (!SUPPORTED_FORMATS.includes(format.toLowerCase())) {
    throw new Error(`Unsupported format: ${format}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
  }
  
  // Normalize jpeg/jpg
  const normalizedFormat = format.toLowerCase() === 'jpg' ? 'jpeg' : format.toLowerCase();
  
  // Build sharp pipeline
  let pipeline = sharp(inputPath);
  
  // Apply format conversion with quality setting
  const formatOptions = {};
  if (quality !== undefined && (normalizedFormat === 'jpeg' || normalizedFormat === 'webp')) {
    formatOptions.quality = quality;
  }
  
  pipeline = pipeline.toFormat(normalizedFormat, formatOptions);
  
  // Save the output
  await pipeline.toFile(outputPath);
}

/**
 * Get the appropriate file extension for the output format
 */
function getExtensionForFormat(format) {
  const normalized = format.toLowerCase();
  return normalized === 'jpeg' || normalized === 'jpg' ? '.jpg' : `.${normalized}`;
}

module.exports = {
  convertImage,
  getExtensionForFormat,
  SUPPORTED_FORMATS
};

