const multer = require('multer');

// Gunakan Memory Storage karena file akan diteruskan/diunggah ke Supabase Storage, bukan disimpan secara lokal
const storage = multer.memoryStorage();

// Filter file hanya untuk dokumen PDF dan Gambar
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Hanya menerima PDF, JPG, JPEG, dan PNG.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal ukuran file 5 MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
