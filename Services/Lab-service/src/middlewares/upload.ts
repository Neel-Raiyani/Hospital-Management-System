import type { Express, Request } from 'express';
import type { FileFilterCallback } from 'multer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = `uploads/reports`;
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const userId = req.user?.userId;
        cb(null, userId + '-' + Date.now() + path.extname(file.originalname));
    },
});

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    const allowed = ['application/pdf'];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

export default upload;
