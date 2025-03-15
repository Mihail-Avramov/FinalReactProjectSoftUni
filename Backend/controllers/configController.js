const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment');
const defaultConfig = require('../config/default');

const configController = {
  async getAppConfig(req, res, next) {
    try {
      const config = {
        // Системна информация
        system: {
          name: defaultConfig.app.name,
          version: defaultConfig.app.version,
          description: defaultConfig.app.description
        },
        
        // Настройки за рецепти
        recipe: {
          // Съществуващи изброявания от схемата
          categories: Recipe.schema.path('category').enumValues,
          difficulties: Recipe.schema.path('difficulty').enumValues,
          
          // Ограничения от валидациите
          limits: {
            title: {
              maxLength: defaultConfig.recipe.maxTitleLength
            },
            description: {
              maxLength: defaultConfig.recipe.maxDescriptionLength
            },
            ingredients: {
              maxCount: defaultConfig.recipe.maxIngredientsCount
            },
            instructions: {
              maxCount: defaultConfig.recipe.maxInstructionsCount
            },
            images: {
              maxCount: defaultConfig.recipe.maxImagesCount,
              allowedFormats: defaultConfig.upload.images.allowedFormats,
              maxSize: defaultConfig.upload.images.maxSize
            },
            preparationTime: {
              min: 1
            },
            servings: {
              min: 1
            }
          },
          
          // Предварително зададени филтри за рецепти
          filters: {
            preparationTime: [
              { value: '15', label: 'До 15 минути' },
              { value: '30', label: 'До 30 минути' },
              { value: '60', label: 'До 1 час' },
              { value: '120', label: 'До 2 часа' },
              { value: '120+', label: 'Над 2 часа' }
            ],
            
            servings: [
              { value: '1-2', label: '1-2 порции' },
              { value: '3-4', label: '3-4 порции' },
              { value: '5-8', label: '5-8 порции' },
              { value: '9+', label: 'Над 8 порции' }
            ]
          },
          
          // Опции за сортиране
          sortOptions: [
            { value: 'createdAt', label: 'Най-нови', direction: 'desc' },
            { value: 'likes', label: 'Най-харесвани', direction: 'desc' },
            { value: 'preparationTime', label: 'Най-бързи за готвене', direction: 'asc' },
            { value: 'title', label: 'По азбучен ред', direction: 'asc' }
          ],
          
          // Изображения и миниатюри
          imageFormats: {
            card: "500x500",
            thumbnail: "200x200",
            full: "1000x1000"
          }
        },
        
        // Настройки за потребители
        user: {
          validation: {
            username: {
              minLength: 3,
              pattern: /^[a-zA-Z0-9_]+$/,
              patternDescription: "Може да съдържа само букви, цифри и долна черта"
            },
            password: {
              minLength: 6
            },
            bio: {
              maxLength: 200
            }
          },
          defaultProfilePicture: defaultConfig.user.defaultProfilePicture
        },
        
        // Настройки за коментари
        comment: {
          maxLength: 500
        },
        
        // Настройки за отговор от API-то
        api: {
          pagination: {
            defaultLimit: defaultConfig.api.pagination.defaultLimit,
            maxLimit: defaultConfig.api.pagination.maxLimit
          },
          imageResolutions: {
            thumbnail: 200,
            card: 500,
            full: 1000
          }
        },
        
        // Локализация и езикови настройки
        localization: {
          // Локализирани стойности за категории
          categories: {
            breakfast: 'Закуска',
            lunch: 'Обяд',
            dinner: 'Вечеря',
            dessert: 'Десерт',
            snack: 'Закуска',
            beverage: 'Напитка',
            other: 'Друго'
          },
          
          // Локализирани стойности за трудност
          difficulties: {
            easy: 'Лесно',
            medium: 'Средно',
            hard: 'Трудно'
          }
        }
      };
      
      res.status(200).json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = configController;