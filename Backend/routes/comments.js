const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { commentValidation, idParamValidation } = require('../utils/validation');

router.use(protect);

router.post(
  '/recipe/:id',
  idParamValidation,
  commentValidation,
  commentController.createComment
);

router.get('/recipe/:id', idParamValidation, commentController.getRecipeComments);

router.put(
  '/:id',
  idParamValidation,
  commentValidation,
  commentController.updateComment
);

router.delete('/:id', idParamValidation, commentController.deleteComment);

module.exports = router;