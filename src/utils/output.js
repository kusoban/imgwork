const fs = require('fs');
const path = require('path');

/**
 * Determine the output path based on inputs and options
 * @param {string[]} inputs - Array of input file/folder paths
 * @param {string|null} outOption - The --out option value, if provided
 * @returns {object} { outputBase: string, isDirectory: boolean, isSingleFile: boolean }
 */
function resolveOutputPath(inputs, outOption) {
  // If --out is provided, use it
  if (outOption) {
    let outputPath = outOption;
    
    // Handle relative paths (like ./export) - resolve relative to the first input's parent
    if (outputPath.startsWith('./') || outputPath.startsWith('../')) {
      const firstInputAbsolute = path.resolve(inputs[0]);
      const firstInputStat = fs.existsSync(firstInputAbsolute) ? fs.statSync(firstInputAbsolute) : null;
      
      if (firstInputStat && firstInputStat.isDirectory()) {
        // Input is a directory, resolve relative to its parent
        outputPath = path.resolve(path.dirname(firstInputAbsolute), outputPath);
      } else {
        // Input is a file, resolve relative to its parent directory
        outputPath = path.resolve(path.dirname(firstInputAbsolute), outputPath);
      }
    } else {
      // Absolute path or simple name
      outputPath = path.resolve(outputPath);
    }
    
    return {
      outputBase: outputPath,
      isDirectory: true,
      isSingleFile: false
    };
  }
  
  // Auto-generate output path based on inputs
  if (inputs.length === 1) {
    const inputPath = path.resolve(inputs[0]);
    const stat = fs.existsSync(inputPath) ? fs.statSync(inputPath) : null;
    
    if (stat && stat.isDirectory()) {
      // Single folder: folder/ → folder-imgwork/
      return {
        outputBase: inputPath + '-imgwork',
        isDirectory: true,
        isSingleFile: false
      };
    } else {
      // Single file: file.jpg → file-imgwork.jpg
      const dir = path.dirname(inputPath);
      const ext = path.extname(inputPath);
      const basename = path.basename(inputPath, ext);
      return {
        outputBase: path.join(dir, `${basename}-imgwork${ext}`),
        isDirectory: false,
        isSingleFile: true
      };
    }
  } else {
    // Multiple files: create imgwork-output/ in current directory
    return {
      outputBase: path.resolve(process.cwd(), 'imgwork-output'),
      isDirectory: true,
      isSingleFile: false
    };
  }
}

/**
 * Get the output file path for a given input file
 * @param {string} inputFile - Absolute path to input file
 * @param {string[]} allInputs - All input paths (to determine base for directory structure)
 * @param {object} outputInfo - Output info from resolveOutputPath
 * @param {string|null} newExtension - New extension if converting format (e.g., '.webp')
 * @returns {string} Absolute path for output file
 */
function getOutputFilePath(inputFile, allInputs, outputInfo, newExtension = null) {
  const { outputBase, isDirectory, isSingleFile } = outputInfo;
  
  if (isSingleFile) {
    // Single file output: just use the output base, potentially with new extension
    if (newExtension) {
      const ext = path.extname(outputBase);
      return outputBase.replace(new RegExp(ext + '$'), newExtension);
    }
    return outputBase;
  }
  
  // Directory output: maintain structure
  const ext = newExtension || path.extname(inputFile);
  const basename = path.basename(inputFile, path.extname(inputFile));
  
  // Determine base directory for maintaining structure
  let baseDir = null;
  
  // Find which input path this file belongs to
  for (const input of allInputs) {
    const inputAbsolute = path.resolve(input);
    if (inputFile.startsWith(inputAbsolute)) {
      const stat = fs.existsSync(inputAbsolute) ? fs.statSync(inputAbsolute) : null;
      if (stat && stat.isDirectory()) {
        baseDir = inputAbsolute;
      } else {
        // File input - no subdirectory structure
        baseDir = path.dirname(inputAbsolute);
      }
      break;
    }
  }
  
  if (!baseDir) {
    // Fallback: use file's directory
    baseDir = path.dirname(inputFile);
  }
  
  // Calculate relative path from base directory
  const relativePath = path.relative(baseDir, path.dirname(inputFile));
  
  // Build output path
  const outputDir = path.join(outputBase, relativePath);
  return path.join(outputDir, basename + ext);
}

/**
 * Ensure a directory exists, creating it if necessary
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

module.exports = {
  resolveOutputPath,
  getOutputFilePath,
  ensureDirectoryExists
};

