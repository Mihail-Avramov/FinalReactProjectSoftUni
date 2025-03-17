const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');
const { AppError } = require('../middleware/errorHandler');
const errorMessages = require('../utils/errorMessages');

const commentService = {
  /**
   * Create a new comment
   */
  async createComment(recipeId, userId, content) {
    try {
      // Първо проверяваме дали рецептата съществува
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        throw new AppError(errorMessages.recipe.notFound, 404);
      }
      
      // Създаваме коментара
      const comment = await Comment.create({
        content,
        author: userId,
        recipe: recipeId
      });
      
      // Връщаме коментара с информация за автора
      return await Comment.findById(comment._id)
        .populate('author', 'username firstName lastName profilePicture');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  },

  /**
   * Get comments for a recipe with pagination
   */
  async getCommentsByRecipeId(recipeId, pagination) {
    try {
      // Проверка дали рецептата съществува
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        throw new AppError(errorMessages.recipe.notFound, 404);
      }
      
      const { page, limit, sort } = pagination;
      const skip = (page - 1) * limit;
      
      // Заявка за коментари
      const comments = await Comment.find({ recipe: recipeId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username firstName lastName profilePicture');
      
      // Общ брой коментари за пагинация
      const totalComments = await Comment.countDocuments({ recipe: recipeId });
      
      return {
        comments,
        pagination: {
          page,
          limit,
          totalItems: totalComments,
          totalPages: Math.ceil(totalComments / limit)
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  },

  /**
   * Update a comment (only the author can update)
   */
  async updateComment(commentId, userId, content) {
    try {
      // Намираме коментара
      const comment = await Comment.findById(commentId);
      
      // Проверки
      if (!comment) {
        throw new AppError(errorMessages.comment.notFound, 404);
      }
      
      // Проверява дали потребителят е автор на коментара
      if (comment.author.toString() !== userId.toString()) {
        throw new AppError(errorMessages.comment.unauthorized, 403);
      }
      
      // Обновяване на коментара
      comment.content = content;
      await comment.save();
      
      // Връщане на обновения коментар с информация за автора
      return await Comment.findById(commentId)
        .populate('author', 'username firstName lastName profilePicture');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  },

  /**
   * Delete a comment (author or recipe owner can delete)
   */
  async deleteComment(commentId, userId) {
    try {
      // Намиране на коментара с информация за рецептата
      const comment = await Comment.findById(commentId);
      
      if (!comment) {
        throw new AppError(errorMessages.comment.notFound, 404);
      }
      
      // Намиране на рецептата за проверка на собственика
      const recipe = await Recipe.findById(comment.recipe);
      
      // Проверка на правата:
      // 1. Потребителят е автор на коментара
      // 2. Потребителят е собственик на рецептата
      const isCommentAuthor = comment.author.toString() === userId.toString();
      const isRecipeOwner = recipe && recipe.author.toString() === userId.toString();
      
      if (!isCommentAuthor && !isRecipeOwner) {
        throw new AppError(errorMessages.comment.unauthorized, 403);
      }
      
      // Изтриване на коментара
      await Comment.findByIdAndDelete(commentId);
      
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  }
};

module.exports = commentService;