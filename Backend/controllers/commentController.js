const commentService = require('../services/commentService');
const { AppError } = require('../middleware/errorHandler');
const errorMessages = require('../utils/errorMessages');

const commentController = {
  /**
   * Create a new comment on a recipe
   */
  async createComment(req, res, next) {
    try {
      const recipeId = req.params.id;
      const { content } = req.body;
      const userId = req.user._id;

      const comment = await commentService.createComment(recipeId, userId, content);
      
      res.status(201).json({
        success: true,
        data: comment
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all comments for a specific recipe
   */
  async getRecipeComments(req, res, next) {
    try {
      const recipeId = req.params.id;
      
      // Опции за пагинация
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort || '-createdAt' // По подразбиране: най-новите първо
      };
      
      const result = await commentService.getCommentsByRecipeId(recipeId, pagination);
      
      res.status(200).json({
        success: true,
        data: result.comments,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a comment (only author can update)
   */
  async updateComment(req, res, next) {
    try {
      const commentId = req.params.id;
      const { content } = req.body;
      const userId = req.user._id;
      
      const updatedComment = await commentService.updateComment(commentId, userId, content);
      
      res.status(200).json({
        success: true,
        data: updatedComment
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a comment (author or recipe owner can delete)
   */
  async deleteComment(req, res, next) {
    try {
      const commentId = req.params.id;
      const userId = req.user._id;
      
      await commentService.deleteComment(commentId, userId);
      
      res.status(200).json({
        success: true,
        data: { message: 'Comment deleted successfully' }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = commentController;