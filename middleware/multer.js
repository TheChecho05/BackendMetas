import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({}); // temporal, no guardamos local
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Solo imágenes (png, jpg, jpeg)'));
  }
};

export const upload = multer({ storage, fileFilter });
