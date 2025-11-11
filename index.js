#!/usr/bin/env node

const { Command } = require('commander');
const { findImages } = require('./src/utils/files');
const { resolveOutputPath } = require('./src/utils/output');
const { processImages } = require('./src/processor');
const { convertImage, getExtensionForFormat, SUPPORTED_FORMATS } = require('./src/commands/convert');
const { resizeImage } = require('./src/commands/resize');
const { cropImage } = require('./src/commands/crop');
const { optimizeImage } = require('./src/commands/optimize');

const program = new Command();

program
  .name('img-magic')
  .description('A powerful CLI tool for image manipulation using sharp')
  .version('1.0.0');

// Convert subcommand
program
  .command('convert')
  .description('Convert images to a different format')
  .argument('<files...>', 'image files or directories to convert')
  .requiredOption('--to <format>', `output format (${SUPPORTED_FORMATS.join(', ')})`)
  .option('--quality <number>', 'quality for lossy formats (1-100)', '80')
  .option('--out <path>', 'output directory or file path')
  .addHelpText('after', `
Examples:
  $ img-magic convert images/ --to webp --out webp_images/
  $ img-magic convert image1.png image2.jpg --to jpeg
  $ img-magic convert photo.jpg --to png --quality 90
  `)
  .action(async (files, options) => {
    try {
      const format = options.to;
      const quality = parseInt(options.quality, 10);
      
      // Find all images
      const images = findImages(files);
      if (images.length === 0) {
        console.error('No images found to process.');
        process.exit(1);
      }
      
      // Resolve output path
      const outputInfo = resolveOutputPath(files, options.out || null);
      
      // Process images
      const newExtension = getExtensionForFormat(format);
      await processImages(images, files, outputInfo, convertImage, {
        format,
        quality,
        newExtension
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Resize subcommand
program
  .command('resize')
  .description('Resize images while maintaining aspect ratio')
  .argument('<files...>', 'image files or directories to resize')
  .option('--w <width>', 'target width in pixels')
  .option('--h <height>', 'target height in pixels')
  .option('--out <path>', 'output directory or file path')
  .addHelpText('after', `
Examples:
  $ img-magic resize images/ --w 1200
  $ img-magic resize logo.png --h 500
  $ img-magic resize photo.jpg --w 800 --h 600
  `)
  .action(async (files, options) => {
    try {
      // Validate at least one dimension is provided
      if (!options.w && !options.h) {
        console.error('Error: At least one of --w (width) or --h (height) must be specified');
        process.exit(1);
      }
      
      // Find all images
      const images = findImages(files);
      if (images.length === 0) {
        console.error('No images found to process.');
        process.exit(1);
      }
      
      // Resolve output path
      const outputInfo = resolveOutputPath(files, options.out || null);
      
      // Process images
      await processImages(images, files, outputInfo, resizeImage, {
        width: options.w,
        height: options.h
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Crop subcommand
program
  .command('crop')
  .description('Crop images to specific dimensions')
  .argument('<files...>', 'image files or directories to crop')
  .requiredOption('--w <width>', 'crop width in pixels')
  .requiredOption('--h <height>', 'crop height in pixels')
  .option('--pos <position>', 'anchor point for crop (center, top, bottom, left, right, top-left, top-right, bottom-left, bottom-right)', 'center')
  .option('--out <path>', 'output directory or file path')
  .addHelpText('after', `
Examples:
  $ img-magic crop photos/ --w 800 --h 600 --pos top
  $ img-magic crop banner.jpg --w 400 --h 400 --pos center
  $ img-magic crop image.png --w 1200 --h 630 --pos top-left
  `)
  .action(async (files, options) => {
    try {
      // Find all images
      const images = findImages(files);
      if (images.length === 0) {
        console.error('No images found to process.');
        process.exit(1);
      }
      
      // Resolve output path
      const outputInfo = resolveOutputPath(files, options.out || null);
      
      // Process images
      await processImages(images, files, outputInfo, cropImage, {
        width: options.w,
        height: options.h,
        position: options.pos
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Optimize subcommand
program
  .command('optimize')
  .description('Optimize images to reduce file size')
  .argument('<files...>', 'image files or directories to optimize')
  .option('--quality <number>', 'target quality for optimization (1-100)')
  .option('--lossless', 'apply lossless optimizations instead')
  .option('--out <path>', 'output directory or file path')
  .addHelpText('after', `
Examples:
  $ img-magic optimize images/ --quality 70
  $ img-magic optimize logos/ --lossless
  $ img-magic optimize photo.jpg --quality 85 --out optimized/
  `)
  .action(async (files, options) => {
    try {
      // Validate that either quality or lossless is provided
      if (!options.quality && !options.lossless) {
        console.error('Error: Either --quality <number> or --lossless flag must be specified');
        process.exit(1);
      }
      
      // Find all images
      const images = findImages(files);
      if (images.length === 0) {
        console.error('No images found to process.');
        process.exit(1);
      }
      
      // Resolve output path
      const outputInfo = resolveOutputPath(files, options.out || null);
      
      // Process images
      await processImages(images, files, outputInfo, optimizeImage, {
        quality: options.quality,
        lossless: options.lossless
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

