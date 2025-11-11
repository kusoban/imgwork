# img-magic

A powerful Node.js command-line interface (CLI) tool for image manipulation using the sharp library. Process images with format conversion, resizing, cropping, and optimization capabilities.

## Features

- **Format Conversion**: Convert images between JPEG, PNG, WEBP, GIF, and TIFF formats
- **Resizing**: Scale images while maintaining aspect ratio
- **Cropping**: Crop images to specific dimensions with flexible positioning
- **Optimization**: Reduce file sizes with quality or lossless compression
- **Batch Processing**: Process multiple files or entire directories recursively
- **Smart Output**: Automatic output path generation with customizable options

## Installation

### Local Installation

```bash
npm install
```

### Global Installation

```bash
npm install -g
```

After global installation, you can use the `img-magic` command from anywhere.

## Usage

### General Syntax

```bash
img-magic <command> <files...> [options]
```

- `<command>`: One of `convert`, `resize`, `crop`, or `optimize`
- `<files...>`: One or more image files or directories (directories are processed recursively)
- `[options]`: Command-specific options

### Output Behavior

By default, img-magic automatically generates output paths based on your inputs:

- **Single folder**: `images/` → `images-imgwork/`
- **Single file**: `photo.jpg` → `photo-imgwork.jpg`
- **Multiple files**: Creates `imgwork-output/` in the current directory

Use the `--out <path>` option to specify a custom output location:
- Absolute paths: `/path/to/output`
- Relative paths: `./export` (relative to the target's parent directory)

The tool preserves the original directory structure within the output folder.

## Commands

### convert

Convert images to a different format.

**Syntax:**
```bash
img-magic convert <files...> --to <format> [--quality <number>] [--out <path>]
```

**Options:**
- `--to <format>` (required): Output format (`jpeg`, `png`, `webp`, `tiff`)
- `--quality <number>`: Quality for lossy formats (1-100, default: 80)
- `--out <path>`: Custom output directory or file path

**Examples:**
```bash
# Convert entire directory to WebP
img-magic convert images/ --to webp

# Convert multiple files to JPEG with custom output
img-magic convert image1.png image2.png --to jpeg --out converted/

# Convert single file with high quality
img-magic convert photo.png --to webp --quality 95
```

### resize

Resize images while maintaining aspect ratio.

**Syntax:**
```bash
img-magic resize <files...> [--w <width>] [--h <height>] [--out <path>]
```

**Options:**
- `--w <width>`: Target width in pixels
- `--h <height>`: Target height in pixels
- `--out <path>`: Custom output directory or file path

**Behavior:**
- If only width is provided, height scales proportionally
- If only height is provided, width scales proportionally
- If both are provided, image fits within the box while maintaining aspect ratio

**Examples:**
```bash
# Resize to 1200px width (height scales automatically)
img-magic resize images/ --w 1200

# Resize to 500px height (width scales automatically)
img-magic resize logo.png --h 500

# Fit within 800x600 box
img-magic resize photo.jpg --w 800 --h 600
```

### crop

Crop images to specific dimensions with flexible positioning.

**Syntax:**
```bash
img-magic crop <files...> --w <width> --h <height> [--pos <position>] [--out <path>]
```

**Options:**
- `--w <width>` (required): Crop width in pixels
- `--h <height>` (required): Crop height in pixels
- `--pos <position>`: Anchor point for crop (default: `center`)
- `--out <path>`: Custom output directory or file path

**Valid Positions:**
- `center` (default)
- `top`, `bottom`, `left`, `right`
- `top-left`, `top-right`, `bottom-left`, `bottom-right`

**Examples:**
```bash
# Crop all photos to 800x600, anchored at top
img-magic crop photos/ --w 800 --h 600 --pos top

# Crop to square from center
img-magic crop banner.jpg --w 400 --h 400

# Social media banner crop
img-magic crop image.png --w 1200 --h 630 --pos top-left
```

### optimize

Reduce image file sizes with quality-based or lossless optimization.

**Syntax:**
```bash
img-magic optimize <files...> [--quality <number> | --lossless] [--out <path>]
```

**Options:**
- `--quality <number>`: Target quality (1-100) for lossy optimization
- `--lossless`: Apply lossless optimizations (metadata stripping, compression)
- `--out <path>`: Custom output directory or file path

**Note:** You must specify either `--quality` or `--lossless`, but not both.

**Examples:**
```bash
# Optimize with quality setting
img-magic optimize images/ --quality 70

# Lossless optimization for logos
img-magic optimize logos/ --lossless

# Optimize single file with custom output
img-magic optimize photo.jpg --quality 85 --out optimized/
```

## Supported Formats

img-magic processes the following image formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)
- TIFF (.tiff, .tif)

## Help

Get help for any command:

```bash
img-magic --help
img-magic convert --help
img-magic resize --help
img-magic crop --help
img-magic optimize --help
```

## Examples

### Batch Processing Workflow

```bash
# 1. Convert all images in a folder to WebP
img-magic convert photos/ --to webp --out photos-webp/

# 2. Resize the converted images to 1920px width
img-magic resize photos-webp/ --w 1920 --out photos-resized/

# 3. Optimize the resized images
img-magic optimize photos-resized/ --quality 85 --out photos-final/
```

### Quick Single File Operations

```bash
# Convert and optimize in one go
img-magic convert photo.jpg --to webp --quality 90

# Resize for web
img-magic resize large-image.png --w 1200

# Create thumbnail
img-magic crop avatar.jpg --w 200 --h 200 --pos center
```

## Error Handling

- The tool continues processing even if individual files fail
- Errors are reported at the end with a summary
- Original files are never modified
- Exit code 1 is returned if any errors occur

## Technical Details

- **Image Processing**: Built on [sharp](https://sharp.pixelplumbing.com/), a high-performance Node.js image library
- **CLI Framework**: Uses [commander](https://github.com/tj/commander.js/) for robust argument parsing
- **Recursive Processing**: Automatically discovers images in nested directories
- **Progress Tracking**: Shows real-time progress with file counts
- **Error Recovery**: Collects and reports errors without stopping the batch

## License

MIT

