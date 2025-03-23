import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRecipes } from '../../hooks/api/useRecipes';
import { useAuth } from '../../hooks/api/useAuth';
import { getCategoryLabel, getCategoryIcon, getDifficultyLabel } from '../../utils/recipeHelpers';
import SEO from '../../components/common/SEO';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import ImageGallery from '../../components/recipe/ImageGallery/ImageGallery';
import CommentSection from '../../components/comments/CommentSection';
import UserAvatar from '../../components/user/UserAvatar/UserAvatar';
import styles from './RecipeDetailPage.module.css';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { useRecipe, useRecipeActions } = useRecipes();
  const { data: recipe, loading, error, refresh } = useRecipe(id);
  const { toggleLike, toggleFavorite } = useRecipeActions();
  
  const [actionStatus, setActionStatus] = useState({
    isLiked: false,
    isFavorite: false,
    likesCount: 0,
    processingLike: false,
    processingFavorite: false,
  });

  // Състояния за акордионите
  const [accordionState, setAccordionState] = useState({
    ingredients: true,  // По подразбиране отворен
    instructions: true  // По подразбиране отворен
  });

  // Функция за превключване на акордионите
  const toggleAccordion = (section) => {
    setAccordionState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    if (recipe) {
      setActionStatus({
        isLiked: recipe.isLiked,
        isFavorite: recipe.isFavorite,
        likesCount: recipe.likesCount || 0,
        processingLike: false,
        processingFavorite: false,
      });
    }
  }, [recipe]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/recipes/${id}`, message: 'Влезте в профила си, за да харесате рецепти' } });
      return;
    }
    
    setActionStatus(prev => ({ ...prev, processingLike: true }));
    
    try {
      await toggleLike(id);
      setActionStatus(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
        processingLike: false,
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      setActionStatus(prev => ({ ...prev, processingLike: false }));
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/recipes/${id}`, message: 'Влезте в профила си, за да добавите рецепти в любими' } });
      return;
    }
    
    setActionStatus(prev => ({ ...prev, processingFavorite: true }));
    
    try {
      await toggleFavorite(id);
      setActionStatus(prev => ({
        ...prev,
        isFavorite: !prev.isFavorite,
        processingFavorite: false,
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setActionStatus(prev => ({ ...prev, processingFavorite: false }));
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Линк към рецептата копиран в клипборда!');
        })
        .catch(err => {
          console.error('Грешка при копиране на URL:', err);
        });
    }
  };

  if (loading) return <LoadingSpinner message="Зареждане на рецепта..." />;
  if (error) return <Alert type="error" message={error} />;
  if (!recipe) return <Alert type="warning" message="Рецептата не е намерена" />;

  const categoryLabel = getCategoryLabel(recipe.category);
  const difficultyLabel = getDifficultyLabel(recipe.difficulty);
  
  const isOwner = isAuthenticated && user && recipe.author && user._id === recipe.author._id;

  return (
    <div className={styles.recipePage}>
      <SEO 
        title={recipe.title}
        description={recipe.description} 
        image={recipe.images && recipe.images.length > 0 ? recipe.images[0].url : '/images/no-image-1000.webp'}
        keywords={`рецепта, ${recipe.title}, ${categoryLabel}, готвене`}
      />
      
      <div className="container">
        {/* Заглавна секция */}
        <header className={styles.recipeHeader}>
          <div className={styles.recipeHeaderTop}>
            <div className={styles.recipeTitleSection}>
              <div className={styles.categoryBadge}>
                <span className={styles.categoryIcon}>
                  {getCategoryIcon(recipe.category)}
                </span>
                <span className={styles.categoryLabel}>{categoryLabel}</span>
              </div>
              <h1 className={styles.recipeTitle}>{recipe.title}</h1>
            </div>
            
            <div className={styles.recipeActions}>
              <button 
                className={`${styles.actionButton} ${actionStatus.isLiked ? styles.actionActive : ''}`}
                onClick={handleToggleLike}
                disabled={actionStatus.processingLike}
                title={actionStatus.isLiked ? 'Премахни харесването' : 'Харесай рецептата'}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span className={styles.actionCount}>{actionStatus.likesCount}</span>
              </button>
              
              <button 
                className={`${styles.actionButton} ${actionStatus.isFavorite ? styles.actionActive : ''}`}
                onClick={handleToggleFavorite}
                disabled={actionStatus.processingFavorite}
                title={actionStatus.isFavorite ? 'Премахни от любими' : 'Добави в любими'}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
              </button>
              
              <button 
                className={styles.actionButton}
                onClick={handleShareClick}
                title="Сподели рецептата"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
              
              {isOwner && (
                <Link 
                  to={`/recipes/edit/${recipe._id}`}
                  className={styles.editButton}
                  title="Редактирай рецептата"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </Link>
              )}
            </div>
          </div>
          
          <div className={styles.recipeAuthor}>
            <Link to={`/profile/${recipe.author?._id}`} className={styles.authorLink}>
              <UserAvatar 
                src={recipe.author?.profilePicture} 
                alt={recipe.author?.username}
                size="medium"
              />
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>
                  {recipe.author?.firstName && recipe.author?.lastName
                    ? `${recipe.author.firstName} ${recipe.author.lastName}`
                    : recipe.author?.username || 'Анонимен'}
                </span>
                <span className={styles.authorUsername}>
                  @{recipe.author?.username || 'anonymous'}
                </span>
              </div>
            </Link>
            <div className={styles.recipeDate}>
              {new Date(recipe.createdAt).toLocaleDateString('bg-BG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </header>

        <div className={styles.recipeContent}>
          {/* Галерия и информация за рецептата в един ред */}
          <div className={styles.recipeTopSection}>
            {/* Галерия със снимки */}
            <div className={styles.recipeImageContainer}>
              <div className={styles.recipeImageGallery}>
                <ImageGallery images={recipe.images} />
              </div>
            </div>

            {/* Информация за рецептата (описание и мета данни) */}
            <div className={styles.recipeInfoContainer}>
              <div className={styles.recipeDescription}>
                <div className={styles.sectionHeading}>Описание</div>
                <p>{recipe.description}</p>
              </div>

              <div className={styles.recipeMeta}>
                <div className={styles.metaItem}>
                  <div className={styles.metaIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Приготвяне</span>
                    <span className={styles.metaValue}>{recipe.preparationTime} мин</span>
                  </div>
                </div>
                
                <div className={styles.metaItem}>
                  <div className={styles.metaIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="7" r="4"></circle>
                      <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"></path>
                    </svg>
                  </div>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Порции</span>
                    <span className={styles.metaValue}>{recipe.servings}</span>
                  </div>
                </div>
                
                <div className={styles.metaItem}>
                  <div className={styles.metaIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7"/>
                      <path d="M15 7h6v6"/>
                    </svg>
                  </div>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Трудност</span>
                    <span className={styles.metaValue}>{difficultyLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.recipeDirectionsContainer}>
              {/* Акордион за съставки */}
              <div className={styles.accordionSection}>
                <button 
                  className={styles.accordionHeader}
                  onClick={() => toggleAccordion('ingredients')}
                  aria-expanded={accordionState.ingredients}
                >
                  <div className={styles.accordionTitle}>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                    <span>Съставки</span>
                  </div>
                  <div className={styles.accordionIcon}>
                    {accordionState.ingredients ? (
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                </button>
                
                <div 
                  className={`${styles.accordionContent} ${accordionState.ingredients ? styles.accordionOpen : ''}`}
                >
                  <ul className={styles.ingredientsList}>
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className={styles.ingredientItem}>
                        <span className={styles.checkboxCircle}></span>
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              
            </div>
          </div>
          
          <div className={styles.recipeDirectionsContainer}>
              {/* Акордион за инструкции */}
              <div className={styles.accordionSection}>
                <button 
                  className={styles.accordionHeader}
                  onClick={() => toggleAccordion('instructions')}
                  aria-expanded={accordionState.instructions}
                >
                  <div className={styles.accordionTitle}>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z"/>
                    </svg>
                    <span>Начин на приготвяне</span>
                  </div>
                  <div className={styles.accordionIcon}>
                    {accordionState.instructions ? (
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                      </svg>
                    )}
                  </div>
                </button>
                
                <div 
                  className={`${styles.accordionContent} ${accordionState.instructions ? styles.accordionOpen : ''}`}
                >
                  <ol className={styles.instructionsList}>
                    {recipe.instructions.map((step, index) => (
                      <li key={index} className={styles.instructionItem}>
                        <span className={styles.stepNumber}>{index + 1}</span>
                        <span className={styles.stepText}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            
          </div>
          
          {/* Секция с коментари */}
          <CommentSection 
            comments={recipe.comments} 
            recipeId={recipe._id}
            commentCount={recipe.commentCount}
            onCommentAdded={refresh}
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;