const fs = require('fs');
const path = require('path');

/**
 * Supported image extensions
 */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.tif'];

/**
 * Check if a file is an image based on extension
 */
function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Recursively find all image files in a directory
 */
function findImagesInDirectory(dirPath) {
  const images = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively search subdirectories
        images.push(...findImagesInDirectory(fullPath));
      } else if (entry.isFile() && isImageFile(fullPath)) {
        images.push(path.resolve(fullPath));
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}: ${error.message}`);
  }
  
  return images;
}

/**
 * Find all images from an array of file/folder paths
 * @param {string[]} paths - Array of file or directory paths
 * @returns {string[]} Array of absolute image file paths
 */
function findImages(paths) {
  const images = [];
  
  for (const inputPath of paths) {
    const absolutePath = path.resolve(inputPath);
    
    if (!fs.existsSync(absolutePath)) {
      console.error(`Error: Path does not exist: ${inputPath}`);
      continue;
    }
    
    const stat = fs.statSync(absolutePath);
    
    if (stat.isDirectory()) {
      images.push(...findImagesInDirectory(absolutePath));
    } else if (stat.isFile() && isImageFile(absolutePath)) {
      images.push(absolutePath);
    } else {
      console.warn(`Skipping non-image file: ${inputPath}`);
    }
  }
  
  return images;
}

module.exports = {
  findImages,
  isImageFile,
  IMAGE_EXTENSIONS
};

