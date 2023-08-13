const express = require('express');
const router = express.Router();
const check = require('../middlewares/auth.js');
const multer = require('multer');
const {
  validateUserRegister,
  validateUserLogIn,
  validateGetAvatar,
  validateId,
  validatePageNumber,
  validateUserUpdate,
} = require('../middlewares/validators/user.js');

// multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/avatars/');
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar-' + Date.now() + '-' + file.originalname);
  },
});

const uploads = multer({ storage });

const userController = require('../controllers/user.js');

// defining routes
router.post('/register', validateUserRegister(), userController.register);
router.post('/login', validateUserLogIn(), userController.login);
router.get('/profile/:id', check.auth, validateId(), userController.profile);
router.get(
  '/list/:page?',
  check.auth,
  validatePageNumber(),
  userController.list
);
router.put('/update', check.auth, validateUserUpdate(), userController.update);
router.put(
  '/upload',
  [check.auth, uploads.single('image')],
  userController.upload
);
router.get(
  '/avatar/:image',
  check.auth,
  validateGetAvatar(),
  userController.avatar
);
router.get('/counters/:id', check.auth, validateId(), userController.counters);

// exportar router
module.exports = router;
