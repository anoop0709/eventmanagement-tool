import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get decoration catalog (folders and images)
// @route   GET /api/catalog/decorations
// @access  Private
export const getDecorationCatalog = async (req, res) => {
  try {
    const decorationsPath = path.resolve(__dirname, '../../../client/public/images/decorations');
    
    // Check if directory exists
    if (!fs.existsSync(decorationsPath)) {
      return res.status(404).json({ message: 'Decorations directory not found' });
    }

    // Read all folders in decorations directory
    const folders = fs.readdirSync(decorationsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // For each folder, get all images
    const catalog = folders.map(folderName => {
      const folderPath = path.join(decorationsPath, folderName);
      const images = fs.readdirSync(folderPath)
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext);
        })
        .map(fileName => ({
          name: fileName,
          url: `/images/decorations/${folderName}/${fileName}`,
        }));

      return {
        category: folderName,
        images,
        count: images.length,
      };
    });

    res.json(catalog);
  } catch (error) {
    logger.error('Error reading decoration catalog:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload decoration image
// @route   POST /api/catalog/decorations/upload
// @access  Private/Admin
export const uploadDecorationImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const category = req.body.category || 'modern';
    
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const name = path.basename(req.file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const fileName = `${name}-${uniqueSuffix}${ext}`;
    
    // Define paths
    const decorationsPath = path.resolve(__dirname, '../../../client/public/images/decorations');
    const categoryPath = path.join(decorationsPath, category);
    const filePath = path.join(categoryPath, fileName);
    
    // Create category directory if it doesn't exist
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
    }
    
    // Write file from memory to disk
    fs.writeFileSync(filePath, req.file.buffer);
    
    const fileUrl = `/images/decorations/${category}/${fileName}`;

    logger.info(`Image uploaded successfully: ${fileUrl}`);

    res.status(201).json({
      message: 'Image uploaded successfully',
      file: {
        name: fileName,
        url: fileUrl,
        category: category,
      }
    });
  } catch (error) {
    logger.error('Error uploading decoration image:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a decoration image
// @route   DELETE /api/catalog/decorations/:category/:filename
// @access  Private/Admin
export const deleteDecorationImage = async (req, res) => {
  try {
    const { category, filename } = req.params;
    if (!category || !filename) {
      return res.status(400).json({ message: 'Category and filename required' });
    }

    const decorationsPath = path.resolve(__dirname, '../../../client/public/images/decorations');
    const filePath = path.join(decorationsPath, category, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }
    fs.unlinkSync(filePath);
    logger.info(`Image deleted: /images/decorations/${category}/${filename}`);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    logger.error('Error deleting decoration image:', error);
    res.status(500).json({ message: error.message });
  }
};
