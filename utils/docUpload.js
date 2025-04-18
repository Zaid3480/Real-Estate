import multer from 'multer';
import path from 'path';

// Configure storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Append original file extension
    }
});

// File filter to allow PDF, DOC/DOCX, images, and CSV files
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'text/csv',
        'application/vnd.ms-excel'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.csv', '.xls'];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC/DOCX, images, and CSV files are allowed'), false);
    }
};

// Multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

// Export different middleware for single and multiple uploads
export const uploadSingle = upload.single("document"); // For single file upload
export const uploadMultiple = upload.fields([
    { name: "ComplianceDocument", maxCount: 50 }, 
    { name: "MandatoryTrainings", maxCount: 50 },
    { name: "csvFile", maxCount: 1 } // Allow one CSV file upload
]); 

export default upload;
