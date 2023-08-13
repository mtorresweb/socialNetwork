const express = require('express');
const router = express.Router();
const followController = require('../controllers/follow.js');
const check = require('../middlewares/auth.js');
const {
  validateId,
  validatePageNumber,
  validateSaveFollow,
} = require('../middlewares/validators/follow.js');

// defining routes
router.post('/save', check.auth, validateSaveFollow(), followController.save);
router.delete(
  '/unfollow/:id',
  check.auth,
  validateId(),
  followController.unfollow
);
router.get(
  '/following/:id?/:page?',
  check.auth,
  validateId(),
  validatePageNumber(),
  followController.following
);

// export router
module.exports = router;
