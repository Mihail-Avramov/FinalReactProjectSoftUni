const Recipe = require('../models/Recipe');
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
            // Категории - изброени в categories по-горе
            // Трудност - изброена в difficulties по-горе
            
            // Време за приготвяне
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
            ],
            
            // Добавени реално поддържани филтри
            search: "Текстово търсене по заглавие и описание",
            author: "Филтриране по ID на автора"
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
          validation: {
            content: {
              minLength: 3,
              maxLength: 500
            }
          }
        },
        
        // Настройки за отговор от API-то
        api: {
          pagination: {
            defaultLimit: defaultConfig.api.pagination.defaultLimit,
            maxLimit: defaultConfig.api.pagination.maxLimit,
            pageParameter: "page", // Добавено за яснота
            limitParameter: "limit" // Добавено за яснота
          },
          imageResolutions: {
            thumbnail: 200,
            card: 500,
            full: 1000
          },
          
          // НОВА СЕКЦИЯ: Подробности за поддържаните API заявки
          queries: {
            recipes: {
              filters: {
                category: "Филтриране по категория рецепта",
                difficulty: "Филтриране по ниво на трудност",
                search: "Текстово търсене в заглавие и описание",
                minTime: "Минимално време за приготвяне (в минути)",
                maxTime: "Максимално време за приготвяне (в минути)",
                author: "ID на автора на рецептата"
              },
              sorting: {
                usage: "Добавете '-' преди полето за низходящо сортиране",
                supportedFields: ["createdAt", "likes", "preparationTime", "title"],
                examples: {
                  "sort=-createdAt": "Най-нови първо",
                  "sort=title": "По азбучен ред (възходящо)",
                  "sort=-likes": "Най-харесвани първо"
                }
              }
            },
            comments: {
              sorting: {
                default: "-createdAt",
                supportedFields: ["createdAt"]
              },
              pagination: true
            },
            userRecipes: {
              endpoint: "/recipes/user/:id",
              description: "Получаване на рецепти на конкретен потребител",
              pagination: true,
              sorting: true
            },
            favoriteRecipes: {
              endpoint: "/recipes/favorites",
              description: "Получаване на любими рецепти на текущия потребител",
              pagination: true
            },
            trendingRecipes: {
              endpoint: "/recipes/trending",
              description: "Получаване на популярни рецепти",
              parameters: {
                limit: "Брой рецепти (по подразбиране: 5)"
              }
            }
          },
          
          // НОВА СЕКЦИЯ: Примери за типични заявки
          examples: {
            "Филтриране по категория": "/recipes?category=dessert",
            "Търсене + Филтри": "/recipes?search=пиле&minTime=10&maxTime=30",
            "Филтриране по трудност": "/recipes?difficulty=easy",
            "Сортиране": "/recipes?sort=-likes",
            "Пагинация": "/recipes?page=2&limit=20",
            "Комбинирана заявка": "/recipes?category=dinner&difficulty=medium&sort=-createdAt&page=1&limit=10",
            "Рецепти на потребител": "/recipes/user/[userId]?sort=-createdAt",
            "Популярни рецепти": "/recipes/trending?limit=3",
            "Коментари на рецепта": "/comments/recipe/[recipeId]?page=1&limit=10"
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
            snack: 'Снакс',
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