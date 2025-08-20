/* eslint-disable no-useless-escape */
import path from 'path';
import multer from 'multer';

/* -------------------------------------------------------------------------- */
/*                                   Multer                                   */
/* -------------------------------------------------------------------------- */

const storage = multer.memoryStorage();
const upload = multer({
  storage,
});


const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents');
  },

  filename: (req, file, cb) => {
    const fileNameCheck = file.originalname.replace(
      /[-&\/\\#.,+()$~%'":*?<>{} ]/g,
      ''
    );
    cb(
      null,
      `${fileNameCheck}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});


const uploadDocument = multer({
  storage: documentStorage,
});

function uploadFiles(folder) {
  const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },

    filename: (req, file, cb) => {
      const fileNameCheck = file.originalname.replace(
        /[-&\/\\#.,+()$~%'":*?<>{} ]/g,
        ''
      );
      cb(
        null,
        `${fileNameCheck}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

  return multer({ storage: Storage });
}

const excelFilter = function (req, file, cb) {
  const allowedTypes = [".xls", ".xlsx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return cb(new Error("Only Excel files are allowed (.xls, .xlsx)"), false);
  }
  cb(null, true);
};

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: excelFilter,
});

export { upload, uploadDocument, uploadFiles, uploadExcel };
