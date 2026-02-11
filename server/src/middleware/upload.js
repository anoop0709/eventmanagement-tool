import multer from 'multer';
import path from 'path';

// Configure storage - use memory storage (no temp files)
const decorationStorage = multer.memoryStorage();

// File filter - only allow images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, svg, webp)'));
  }
};

// Multer upload instance for decorations
export const uploadDecoration = multer({
  storage: decorationStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('image');
