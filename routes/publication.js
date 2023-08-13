const express = require('express');
const router = express.Router();
const check = require('../middlewares/auth.js');
const {
  validateId,
  validatePageNumber,
  validateSavePublication,
  validateFileName,
} = require('../middlewares/validators/publication.js');

const multer = require('multer');

// multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/publications/');
  },
  filename: (req, file, cb) => {
    cb(null, 'pub-' + Date.now() + '-' + file.originalname);
  },
});

const uploads = multer({ storage });

const publicationController = require('../controllers/publication.js');

// defining routes
router.post(
  '/save',
  check.auth,
  validateSavePublication(),
  publicationController.save
);
router.get(
  '/detail/:id',
  check.auth,
  validateId(),
  publicationController.detail
);
router.delete(
  '/remove/:id',
  check.auth,
  validateId(),
  publicationController.remove
);
router.get(
  '/user/:id/:page?',
  check.auth,
  validateId(),
  validatePageNumber(),
  publicationController.userPublications
);
router.put(
  '/upload/:id',
  check.auth,
  validateId(),
  uploads.single('file0'),
  publicationController.upload
);
router.get(
  '/media/:file',
  check.auth,
  validateFileName(),
  publicationController.media
);
router.get(
  '/feed/:page?',
  check.auth,
  validatePageNumber(),
  publicationController.feed
);

// exportar router

module.exports = router;
