import multer from 'multer';
import path from 'path';

// Configure storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Keep original extension
    }
});

// Updated file filter: Allow images, PDFs, DOCs, CSVs, and VIDEOS
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        // Images
        'image/png',
        'image/jpeg',
        'image/jpg',
        // PDFs and Docs
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // CSVs and Excels
        'text/csv',
        'application/vnd.ms-excel',
        // Videos
        'video/mp4',
        'video/quicktime',
        'video/x-matroska', // .mkv
        'video/x-msvideo', // .avi
    ];

    const allowedExtensions = [
        '.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.csv', '.xls',
        '.mp4', '.mov', '.mkv', '.avi'
    ];

    const fileExtension = path.extname(file.originalname).toLowerCase();
    console.log("File extension:", fileExtension);
    console.log("File type:", file.mimetype);

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {

        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC/DOCX, images, CSV, and video files are allowed'), false);
    }
};

// Multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Increase limit: 50MB (for videos)
});

// Export different middleware
export const uploadSingle = upload.single("document"); // For single file upload

export const uploadPropertyImages = upload.array('images', 10); 
export const uploadPropertyVideos = upload.array('videos', 5);

export const uploadPropertyMedia = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
]);

export default upload;
