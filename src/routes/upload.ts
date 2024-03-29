import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import sanitizeFilename from 'sanitize-filename';

const router = Router();

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename(req, file, callback) {
    callback(
      null,
      sanitizeFilename(path.parse(file.originalname).name) +
        '-' +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 },
  fileFilter(req, file, callback) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return callback(null, true);
    } else {
      callback(new Error('Err: Images Only'));
    }
  },
}).single('myImage');

router.post('/', async (req, res, next) => {
  try {
    upload(req, res, (err: any) => {
      if (err) {
        console.error('FILE UPLOAD', err.message || 'ERROR UPLOADING FILE');
        res.status(400);
        res.send({
          error: {
            message: err.message || 'Error uploading file',
            status: 400,
          },
        });
      } else {
        // console.log(req.file);
        res.status(200);
        res.send({
          filename: req.file.filename,
          size: req.file.size,
          originalName: req.file.originalname,
        });
      }
    });
  } catch (error) {
    next(error);
  }
});

export const FileUploadRouter = router;
