import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import ImageUpload from '../../components/common/ImageUpload';
import Alert from '../../components/common/Alert';
import LoadingOverlay from '../../components/common/LoadingOverlay/LoadingOverlay';
import SEO from '../../components/common/SEO';
import { useConfig } from '../../hooks/api/useConfig';
import { useRecipes } from '../../hooks/api/useRecipes';
import { validateImage } from '../../utils/imageOptimization';
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
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
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
  
  // Обработчик на промяна на полетата
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Изчистване на грешка при въвеждане
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };
  
  // Управление на съставките
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = value;
    
    setFormData(prevData => ({
      ...prevData,
      ingredients: updatedIngredients
    }));
    
    // Изчистване на грешки
    if (formErrors.ingredients) {
      setFormErrors(prevErrors => ({ ...prevErrors, ingredients: null }));
    }
  };
  
  const addIngredient = () => {
    setFormData(prevData => ({
      ...prevData,
      ingredients: [...prevData.ingredients, '']
    }));
  };
  
  const removeIngredient = (index) => {
    if (formData.ingredients.length === 1) return;
    
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    
    setFormData(prevData => ({
      ...prevData,
      ingredients: updatedIngredients
    }));
  };
  
  // Управление на стъпките
  const handleStepChange = (index, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = value;
    
    setFormData(prevData => ({
      ...prevData,
      steps: updatedSteps
    }));
    
    // Изчистване на грешки
    if (formErrors.steps) {
      setFormErrors(prevErrors => ({ ...prevErrors, steps: null }));
    }
  };
  
  const addStep = () => {
    setFormData(prevData => ({
      ...prevData,
      steps: [...prevData.steps, '']
    }));
  };
  
  const removeStep = (index) => {
    if (formData.steps.length === 1) return;
    
    const updatedSteps = [...formData.steps];
    updatedSteps.splice(index, 1);
    
    setFormData(prevData => ({
      ...prevData,
      steps: updatedSteps
    }));
  };
  
  // Управление на изображението
  const handleImageChange = (file) => {
    if (!file) {
      setImageFile(null);
      setPreviewImage(null);
      setFormErrors(prev => ({ ...prev, image: null }));
      return;
    }
    
    // Валидация на изображението
    const validation = validateImage(file);
    if (!validation.valid) {
      setFormErrors(prev => ({ ...prev, image: validation.error }));
      return;
    }
    
    // Изчистване на грешка при валидно изображение
    setFormErrors(prev => ({ ...prev, image: null }));
    setImageFile(file);
    
    // Създаване на URL за преглед
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
  };
  
  // Валидация на формата
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Заглавието е задължително';
    if (!formData.category) errors.category = 'Категорията е задължителна';
    if (!formData.difficulty) errors.difficulty = 'Сложността е задължителна';
    
    const prepTime = parseInt(formData.preparationTime);
    if (isNaN(prepTime) || prepTime <= 0) {
      errors.preparationTime = 'Въведете валидно време за приготвяне';
    }
    
    const servings = parseInt(formData.servings);
    if (isNaN(servings) || servings <= 0) {
      errors.servings = 'Въведете валиден брой порции';
    }
    
    if (!formData.description.trim()) errors.description = 'Описанието е задължително';
    
    // Проверка за празни съставки
    const hasEmptyIngredients = formData.ingredients.some(ingredient => !ingredient.trim());
    if (hasEmptyIngredients) errors.ingredients = 'Всички съставки трябва да са попълнени';
    
    // Проверка за празни стъпки
    const hasEmptySteps = formData.steps.some(step => !step.trim());
    if (hasEmptySteps) errors.steps = 'Всички стъпки трябва да са попълнени';
    
    // Изображение не е задължително (засега)
    
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
    
    // Добавяне на изображение, ако има
    if (imageFile) {
      apiFormData.append('images', imageFile);
    }
    
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
    
    setImageFile(null);
    setPreviewImage(null);
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
                placeholder="Въведете заглавие"
                error={formErrors.title}
                required
              />
              
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label">
                      Категория<span className="required-mark">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
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
                    <label className="form-label">
                      Сложност<span className="required-mark">*</span>
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
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
                    placeholder="Въведете брой порции"
                    error={formErrors.servings}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Описание<span className="required-mark">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                  placeholder="Въведете кратко описание на рецептата"
                  rows="4"
                  required
                />
                {formErrors.description && <div className="form-error">{formErrors.description}</div>}
              </div>
            </div>
            
            <div className="form-section">
              <h2>Изображение</h2>
              <ImageUpload
                label="Снимка на ястието"
                onChange={handleImageChange}
                currentImage={previewImage}
                error={formErrors.image}
              />
            </div>
            
            <div className="form-section">
              <h2>Съставки</h2>
              {formData.ingredients.map((ingredient, index) => (
                <div className="input-with-action" key={`ingredient-${index}`}>
                  <FormInput
                    name={`ingredient-${index}`}
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder={`Съставка ${index + 1}`}
                  />
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
                    <div className="step-input">
                      <div className="form-group">
                        <textarea
                          name={`step-${index}`}
                          value={step}
                          onChange={(e) => handleStepChange(index, e.target.value)}
                          className="form-control"
                          placeholder={`Стъпка ${index + 1}`}
                          rows="2"
                        />
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

export default CreateRecipePage;