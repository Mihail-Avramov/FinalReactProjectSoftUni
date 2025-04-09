import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import BulkImageUpload from '../../components/common/BulkImageUpload/BulkImageUpload';
import Alert from '../../components/common/Alert';
import LoadingOverlay from '../../components/common/LoadingOverlay/LoadingOverlay';
import SEO from '../../components/common/SEO';
import { useConfig } from '../../hooks/api/useConfig';
import { useRecipes } from '../../hooks/api/useRecipes';
import './CreateRecipe.css';

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const { data: config } = useConfig();
  const { useRecipeActions } = useRecipes();
  const { createRecipe } = useRecipeActions();
  
  // Референция към формата за ресет
  const formRef = useRef(null);
  
  // Основни състояния
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  
  // Състояние на формата
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    difficulty: '',
    preparationTime: '',
    servings: '',
    description: '',
    ingredients: [''],
    steps: ['']
  });
  
  // Състояние на грешките
  const [formErrors, setFormErrors] = useState({});
  
  // Добавете тези състояния за проследяване на докоснати полета
  const [touchedFields, setTouchedFields] = useState({});

  // Обработчик на промяна на полетата
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Валидиране само ако полето е било докоснато
    if (touchedFields[name] && validators[name]) {
      const error = validators[name](value);
      setFormErrors(prevErrors => ({ 
        ...prevErrors, 
        [name]: error
      }));
    }
  };

  // Добавете обработчик за onBlur събитие
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Маркираме полето като докоснато
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    // Валидираме полето
    if (validators[name]) {
      const error = validators[name](value);
      setFormErrors(prevErrors => ({ 
        ...prevErrors, 
        [name]: error 
      }));
    }
  };

  const handleIngredientFieldBlur = () => {
    setTouchedFields(prev => ({ ...prev, ingredients: true }));
    const error = validators.ingredients(formData.ingredients);
    setFormErrors(prevErrors => ({ ...prevErrors, ingredients: error }));
  };
  
  const handleStepFieldBlur = () => {
    setTouchedFields(prev => ({ ...prev, steps: true }));
    const error = validators.steps(formData.steps);
    setFormErrors(prevErrors => ({ ...prevErrors, steps: error }));
  };
  
  // Управление на съставките
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = value;
    
    setFormData(prevData => ({
      ...prevData,
      ingredients: updatedIngredients
    }));
    
    // Валидиране на съставките ако полето е било докоснато
    if (touchedFields.ingredients) {
      const error = validators.ingredients(updatedIngredients);
      setFormErrors(prevErrors => ({ 
        ...prevErrors, 
        ingredients: error 
      }));
    }
  };
  
  const addIngredient = () => {
    setFormData(prevData => ({
      ...prevData,
      ingredients: [...prevData.ingredients, '']
    }));
    
    // Валидиране ако полето е било докоснато
    if (touchedFields.ingredients) {
      const updatedIngredients = [...formData.ingredients, ''];
      const error = validators.ingredients(updatedIngredients);
      setFormErrors(prevErrors => ({ ...prevErrors, ingredients: error }));
    }
  };
  
  const removeIngredient = (index) => {
    if (formData.ingredients.length === 1) return;
    
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    
    setFormData(prevData => ({
      ...prevData,
      ingredients: updatedIngredients
    }));
    
    // Валидиране ако полето е било докоснато
    if (touchedFields.ingredients) {
      const error = validators.ingredients(updatedIngredients);
      setFormErrors(prevErrors => ({ ...prevErrors, ingredients: error }));
    }
  };
  
  // Управление на стъпките
  const handleStepChange = (index, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = value;
    
    setFormData(prevData => ({
      ...prevData,
      steps: updatedSteps
    }));
    
    // Валидиране на стъпките ако полето е било докоснато
    if (touchedFields.steps) {
      const error = validators.steps(updatedSteps);
      setFormErrors(prevErrors => ({ 
        ...prevErrors, 
        steps: error 
      }));
    }
  };
  
  const addStep = () => {
    setFormData(prevData => ({
      ...prevData,
      steps: [...prevData.steps, '']
    }));
    
    if (touchedFields.steps) {
      const updatedSteps = [...formData.steps, ''];
      const error = validators.steps(updatedSteps);
      setFormErrors(prevErrors => ({ ...prevErrors, steps: error }));
    }
  };
  
  const removeStep = (index) => {
    if (formData.steps.length === 1) return;
    
    const updatedSteps = [...formData.steps];
    updatedSteps.splice(index, 1);
    
    setFormData(prevData => ({
      ...prevData,
      steps: updatedSteps
    }));
    
    if (touchedFields.steps) {
      const error = validators.steps(updatedSteps);
      setFormErrors(prevErrors => ({ ...prevErrors, steps: error }));
    }
  };
  
  // Нов обработчик за множество изображения
  const handleImagesChange = (images, validationInfo) => {
    if (validationInfo?.error) {
      setFormErrors(prev => ({ ...prev, images: validationInfo.error }));
      return;
    }
    
    setImageFiles(images);
    setFormErrors(prev => ({ ...prev, images: null }));
  };
  
  // Подменете validateForm с новата версия
const validateForm = () => {
  // Валидираме всички полета при изпращане
  const errors = {};
  
  // Валидиране на базовите полета
  Object.keys(validators).forEach(field => {
    if (field === 'ingredients' || field === 'steps') {
      const error = validators[field](formData[field]);
      if (error) errors[field] = error;
    } else {
      const error = validators[field](formData[field]);
      if (error) errors[field] = error;
    }
  });
  
  return errors;
};
  
  // Подготовка на FormData за API заявката
  const prepareFormDataForApi = () => {
    const apiFormData = new FormData();
    
    // Добавяне на основните полета
    apiFormData.append('title', formData.title);
    apiFormData.append('category', formData.category);
    apiFormData.append('difficulty', formData.difficulty);
    apiFormData.append('preparationTime', formData.preparationTime);
    apiFormData.append('servings', formData.servings);
    apiFormData.append('description', formData.description);
    
    const cleanIngredients = formData.ingredients.filter(ing => ing.trim());
    cleanIngredients.forEach((ingredient, index) => {
      apiFormData.append(`ingredients[${index}]`, ingredient);
    });
    
    const cleanSteps = formData.steps.filter(step => step.trim());
    cleanSteps.forEach((step, index) => {
      apiFormData.append(`instructions[${index}]`, step);
    });
    
    // Добавяне на множество изображения
    imageFiles.forEach(imageData => {
      apiFormData.append('images', imageData.file);
    });
    
    return apiFormData;
  };
  
  // Изпращане на формата
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидиране на формата
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Scroll към първата грешка
      const firstErrorName = Object.keys(errors)[0];
      const firstErrorElement = document.querySelector(`[name="${firstErrorName}"]`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    try {
      // Показваме зареждане
      setLoading(true);
      setError(null);
      
      // Подготовка на данните за API заявката
      const recipeData = prepareFormDataForApi();
      
      // Изпращане на заявката
      const response = await createRecipe(recipeData);
      
      // Обработка на успех
      setSuccess(true);
      
      // Пренасочване след кратко изчакване
      setTimeout(() => {
        const recipeId = 
          (response && (response._id || response.id)) ||
          (response?.data && (response.data._id || response.data.id));
          
        if (recipeId) {
          navigate(`/recipes/${recipeId}`);
        } else {
          navigate('/recipes');
        }
      }, 1500);
      
    } catch (err) {
      // Обработка на грешка
      console.error('Грешка при създаване на рецепта', err);
      setError(err.response?.data?.message || 'Възникна грешка при създаване на рецептата');
      
      // Scroll до грешката
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } finally {
      setLoading(false);
    }
  };
  
  // Изчистване на формата
  const handleReset = () => {
    setFormData({
      title: '',
      category: '',
      difficulty: '',
      preparationTime: '',
      servings: '',
      description: '',
      ingredients: [''],
      steps: ['']
    });
    
    setImageFiles([]);
    setFormErrors({});
    setError(null);
    
    // Нулиране на формата за чисто състояние
    if (formRef.current) {
      formRef.current.reset();
    }
  };
  
  return (
    <div className="create-recipe-page">
      <SEO 
        title="Създаване на рецепта"
        description="Създайте нова рецепта и я споделете с общността"
        keywords="рецепта, създаване, готвене, кулинария"
      />
      
      <div className="create-recipe-container">
        <div className="create-recipe-header">
          <h1>Създаване на рецепта</h1>
          <p>Споделете любимата си рецепта с нашата общност</p>
        </div>
        
        {error && (
          <Alert type="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert type="success">
            Рецептата е създадена успешно! Пренасочване...
          </Alert>
        )}
        
        <LoadingOverlay active={loading} message="Създаване на рецепта...">
          <form ref={formRef} onSubmit={handleSubmit} className="create-recipe-form">
            <div className="form-section">
              <h2>Основна информация</h2>
              
              <FormInput
                label="Заглавие на рецептата"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Въведете заглавие"
                error={formErrors.title}
                required
                maxLength={100}
                characterCounter={true}
              />
              
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="category-select">
                      Категория<span className="required-mark">*</span>
                    </label>
                    <select
                      id="category-select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${formErrors.category ? 'is-invalid' : ''}`}
                      required
                    >
                      <option value="">Изберете категория</option>
                      {config?.localization?.categories && Object.entries(config.localization.categories).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {formErrors.category && <div className="form-error">{formErrors.category}</div>}
                  </div>
                </div>
                
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label" htmlFor="difficulty-select">
                      Сложност<span className="required-mark">*</span>
                    </label>
                    <select
                      id="difficulty-select"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`form-control ${formErrors.difficulty ? 'is-invalid' : ''}`}
                      required
                    >
                      <option value="">Изберете сложност</option>
                      {config?.localization?.difficulties && Object.entries(config.localization.difficulties).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    {formErrors.difficulty && <div className="form-error">{formErrors.difficulty}</div>}
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-col">
                  <FormInput
                    label="Време за приготвяне (минути)"
                    name="preparationTime"
                    type="number"
                    min="1"
                    value={formData.preparationTime}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Въведете минути"
                    error={formErrors.preparationTime}
                    required
                  />
                </div>
                
                <div className="form-col">
                  <FormInput
                    label="Брой порции"
                    name="servings"
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Въведете брой порции"
                    error={formErrors.servings}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="description-textarea">
                  Описание<span className="required-mark">*</span>
                </label>
                <textarea
                  id="description-textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                  placeholder="Въведете кратко описание на рецептата"
                  rows="4"
                  required
                  maxLength={500}
                />
                <div className="form-text-counter">
                  <span className={formData.description.length > 450 ? 'text-warning' : ''}>
                    {formData.description.length}/{500}
                  </span>
                </div>
                {formErrors.description && <div className="form-error">{formErrors.description}</div>}
              </div>
            </div>
            
            <div className="form-section">
              <h2>Изображения</h2>
              <BulkImageUpload
                id="recipe-images"
                label="Снимки на ястието (до 5 снимки)"
                onChange={handleImagesChange}
                currentImages={imageFiles}
                error={formErrors.images}
              />
            </div>
            
            <div className="form-section">
              <h2>Съставки</h2>
              {formData.ingredients.map((ingredient, index) => (
                <div className="input-with-action" key={`ingredient-${index}`}>
                  <div className="ingredient-input-container" style={{ position: 'relative', width: '100%' }}>
                    <FormInput
                      name={`ingredient-${index}`}
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      onBlur={handleIngredientFieldBlur}
                      placeholder={`Съставка ${index + 1}`}
                      maxLength={200} // Добавяме ограничение за въвеждане
                    />
                    <div className="form-text-counter" style={{ position: 'absolute', right: '10px', bottom: '-20px' }}>
                      <span className={ingredient.length > 180 ? 'text-warning' : ''}>
                        {ingredient.length}/200
                      </span>
                    </div>
                  </div>
                  <div className="input-actions">
                    <button type="button" className="action-btn delete-btn" onClick={() => removeIngredient(index)}>
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              
              {formErrors.ingredients && <div className="form-error ingredient-error">{formErrors.ingredients}</div>}
              
              <div className="form-action-buttons">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="small" 
                  onClick={addIngredient} 
                  className="add-item-btn"
                >
                  <i className="fa fa-plus"></i> Добави съставка
                </Button>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Стъпки за приготвяне</h2>
              {formData.steps.map((step, index) => (
                <div className="input-with-action" key={`step-${index}`}>
                  <div className="step-container">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-input" style={{ position: 'relative', width: '100%' }}>
                      <div className="form-group">
                        <textarea
                          name={`step-${index}`}
                          value={step}
                          onChange={(e) => handleStepChange(index, e.target.value)}
                          onBlur={handleStepFieldBlur}
                          className="form-control"
                          placeholder={`Стъпка ${index + 1}`}
                          rows="2"
                          maxLength={500} // Добавяме ограничение за въвеждане
                        />
                        <div className="form-text-counter" style={{ position: 'absolute', right: '10px', bottom: '-20px' }}>
                          <span className={step.length > 450 ? 'text-warning' : ''}>
                            {step.length}/500
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="input-actions">
                      <button type="button" className="action-btn delete-btn" onClick={() => removeStep(index)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {formErrors.steps && <div className="form-error step-error">{formErrors.steps}</div>}
              
              <div className="form-action-buttons">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="small" 
                  onClick={addStep} 
                  className="add-item-btn"
                >
                  <i className="fa fa-plus"></i> Добави стъпка
                </Button>
              </div>
            </div>
            
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={handleReset}>
                Изчисти
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                Създай рецепта
              </Button>
            </div>
          </form>
        </LoadingOverlay>
      </div>
    </div>
  );
};

// Валидатори за отделни полета
const validators = {
  title: (value) => {
    if (!value?.trim()) return 'Заглавието е задължително';
    if (value.length > 100) return 'Заглавието не може да надвишава 100 символа';
    return null;
  },
  
  description: (value) => {
    if (!value?.trim()) return 'Описанието е задължително';
    if (value.length > 500) return 'Описанието не може да надвишава 500 символа';
    return null;
  },
  
  category: (value) => {
    if (!value) return 'Категорията е задължителна';
    return null;
  },
  
  difficulty: (value) => {
    if (!value) return 'Сложността е задължителна';
    return null;
  },
  
  preparationTime: (value) => {
    const time = parseInt(value);
    if (!value || isNaN(time)) return 'Времето за приготвяне е задължително';
    if (time < 1) return 'Времето трябва да бъде поне 1 минута';
    if (time > 10000) return 'Времето не може да надвишава 10000 минути';
    return null;
  },
  
  servings: (value) => {
    const servings = parseInt(value);
    if (!value || isNaN(servings)) return 'Броят порции е задължителен';
    if (servings < 1) return 'Броят порции трябва да бъде поне 1';
    if (servings > 100) return 'Броят порции не може да надвишава 100';
    return null;
  },
  
  ingredients: (ingredients) => {
    if (!ingredients || !ingredients.length) return 'Добавете поне една съставка';
    
    if (ingredients.some(ing => !ing.trim())) {
      return 'Всички съставки трябва да са попълнени';
    }

    const tooLongIngredient = ingredients.find(ing => ing.length > 200);
    if (tooLongIngredient) {
      return `Съставката "${tooLongIngredient.substring(0, 20)}..." надвишава 200 символа`;
    }
    
    if (ingredients.length > 50) {
      return 'Броят съставки не може да надвишава 50';
    }
    
    return null;
  },
  
  steps: (steps) => {
    if (!steps || !steps.length) return 'Добавете поне една стъпка';
    
    if (steps.some(step => !step.trim())) {
      return 'Всички стъпки трябва да са попълнени';
    }

    const tooLongStepIndex = steps.findIndex(step => step.length > 500);
    if (tooLongStepIndex !== -1) {
      return `Стъпка ${tooLongStepIndex + 1} надвишава 500 символа`;
    }
    
    if (steps.length > 30) {
      return 'Броят стъпки не може да надвишава 30';
    }
    
    return null;
  }
};

export default CreateRecipePage;