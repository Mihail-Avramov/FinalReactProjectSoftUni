import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/api/useAuth';
import { useRecipes } from '../../hooks/api/useRecipes';
import RecipeApi from '../../api/recipeApi';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingOverlay from '../../components/common/LoadingOverlay/LoadingOverlay';
import SEO from '../../components/common/SEO';
import './CreateRecipe.css';

const DeleteRecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useRecipeActions } = useRecipes();
  const { deleteRecipe } = useRecipeActions();
  
  // Състояния
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  
  // Зареждане на данни за рецептата
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const fetchedRecipe = await RecipeApi.getById(id);
        
        setRecipe(fetchedRecipe);
        setError(null);
      } catch (err) {
        console.error('Грешка при зареждане на рецептата', err);
        setError('Неуспешно зареждане на рецептата. Моля, опитайте отново.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id, navigate, user?._id]);
  
  // Обработчик за изтриване
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteRecipe(id);
      
      // При успех пренасочваме към списъка с рецепти
      navigate('/my-recipes', { 
        state: { 
          success: 'Рецептата беше изтрита успешно.' 
        } 
      });
    } catch (err) {
      console.error('Грешка при изтриване на рецептата', err);
      setError('Неуспешно изтриване на рецептата. Моля, опитайте отново.');
      setDeleting(false);
    }
  };
  
  // Отказ от изтриване
  const handleCancel = () => {
    navigate(`/recipes/${id}`);
  };
  
  return (
    <div className="delete-recipe-page">
      <SEO 
        title="Изтриване на рецепта"
        description="Потвърдете изтриването на рецепта"
        noindex={true}
      />
      
      <div className="container">
        <LoadingOverlay active={loading || deleting} message={loading ? "Зареждане..." : "Изтриване на рецептата..."}>
          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {recipe && !loading && (
            <div className="delete-confirmation-card">
              <div className="delete-confirmation-header">
                <h1>Изтриване на рецепта</h1>
                <p className="text-danger">Внимание: Това действие е необратимо!</p>
              </div>
              
              <div className="recipe-summary">
                <h2>{recipe.title}</h2>
                
                {recipe.images && recipe.images.length > 0 && (
                  <div className="recipe-image">
                    <img src={recipe.images[0].url} alt={recipe.title} />
                  </div>
                )}
                
                <div className="recipe-details">
                  <p><strong>Категория:</strong> {recipe.categoryLabel}</p>
                  <p><strong>Сложност:</strong> {recipe.difficultyLabel}</p>
                  <p><strong>Време за приготвяне:</strong> {recipe.preparationTime} минути</p>
                  <p><strong>Брой съставки:</strong> {recipe.ingredients.length}</p>
                  <p><strong>Създадена на:</strong> {new Date(recipe.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="delete-actions">
                <p className="delete-warning">
                  Сигурни ли сте, че искате да изтриете тази рецепта? 
                  Това действие не може да бъде отменено и всички данни за рецептата 
                  ще бъдат безвъзвратно загубени.
                </p>
                
                <div className="delete-buttons">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleCancel}
                  >
                    Отказ
                  </Button>
                  <Button 
                    type="button" 
                    variant="danger" 
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    Изтрий рецептата
                  </Button>
                </div>
              </div>
            </div>
          )}
        </LoadingOverlay>
      </div>
    </div>
  );
};

export default DeleteRecipePage;