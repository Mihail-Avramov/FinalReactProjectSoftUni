/**
 * Функция за валидация на изображение по размер
 * 
 * @param {File} imageFile - Файл с изображение за проверка
 * @param {number} maxSizeMB - Максимален позволен размер в MB
 * @returns {boolean} Дали файлът отговаря на ограничението за размер
 */
export const validateImageSize = (imageFile, maxSizeMB = 5) => {
    const fileSizeMB = imageFile.size / (1024 * 1024);
    return fileSizeMB <= maxSizeMB;
  };
  
  /**
   * Функция за проверка на типа на изображение
   * 
   * @param {File} file - Файл за проверка
   * @returns {boolean} Дали файлът е с позволен формат
   */
  export const validateImageFormat = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return allowedTypes.includes(file.type);
  };
  
  /**
   * Извлича разширението на файл от неговото име
   * 
   * @param {string} filename - Името на файла
   * @returns {string} Разширението на файла
   */
  export const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };
  
  /**
   * Валидира изображение по размер и формат
   * 
   * @param {File} file - Файл с изображение
   * @param {Object} options - Опции за валидация
   * @param {number} options.maxSizeMB - Максимален размер в MB
   * @returns {Object} Резултат от валидацията { valid: boolean, error: string }
   */
  export const validateImage = (file, { maxSizeMB = 5 } = {}) => {
    if (!file) {
      return { valid: true, error: null }; // Ако файлът е незадължителен
    }
    
    // Проверка на формата
    if (!validateImageFormat(file)) {
      return { 
        valid: false, 
        error: 'Форматът на файла не е поддържан. Моля, качете JPG, JPEG, PNG или WebP изображение.'
      };
    }
    
    // Проверка на размера
    if (!validateImageSize(file, maxSizeMB)) {
      return { 
        valid: false, 
        error: `Размерът на файла трябва да бъде до ${maxSizeMB}MB.`
      };
    }
    
    return { valid: true, error: null };
  };