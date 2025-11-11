const fs = require('fs');
const path = require('path');
const { getOutputFilePath, ensureDirectoryExists } = require('./utils/output');

/**
 * Process multiple images with a given processing function
 * @param {string[]} files - Array of absolute file paths to process
 * @param {string[]} inputs - Original input paths
 * @param {object} outputInfo - Output info from resolveOutputPath
 * @param {Function} processFunc - Async function that processes a single image
 * @param {object} options - Additional options for processing
 * @returns {Promise<object>} Summary of processing results
 */
async function processImages(files, inputs, outputInfo, processFunc, options = {}) {
  const results = {
    total: files.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  if (files.length === 0) {
    console.log('No images found to process.');
    return results;
  }
  
  console.log(`Found ${files.length} image(s) to process.\n`);
  
  for (let i = 0; i < files.length; i++) {
    const inputFile = files[i];
    const fileName = path.basename(inputFile);
    
    try {
      console.log(`Processing ${i + 1}/${files.length}: ${fileName}...`);
      
      // Get output path for this file
      const outputPath = getOutputFilePath(inputFile, inputs, outputInfo, options.newExtension || null);
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      ensureDirectoryExists(outputDir);
      
      // Process the image
      await processFunc(inputFile, outputPath, options);
      
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        file: fileName,
        error: error.message
      });
      console.error(`  Error: ${error.message}`);
    }
  }
  
  // Print summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Processing complete!`);
  console.log(`Successfully processed: ${results.successful}/${results.total}`);
  
  if (results.failed > 0) {
    console.log(`Failed: ${results.failed}/${results.total}`);
    console.log(`\nErrors:`);
    results.errors.forEach(err => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
  }
  console.log(`${'='.repeat(50)}`);
  
  return results;
}

module.exports = {
  processImages
};

