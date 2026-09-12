const multer = require('multer');
const path = require('path');

// Gunakan Memory Storage karena file akan diteruskan/diunggah ke Supabase Storage secara langsung
const storage = multer.memoryStorage();

// Daftar MIME type yang sah untuk lampiran surat & arsip
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

// Daftar ekstensi file yang diizinkan
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

// Filter file ketat: validasi MIME type dan ekstensi file
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    const error = new Error('Format file tidak didukung! Hanya menerima file PDF, JPG, JPEG, PNG, DOC, dan DOCX.');
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maksimal 10 MB per file
    files: 1, // Maksimal 1 file per upload request
  },
  fileFilter: fileFilter,
});

module.exports = upload;
