import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/api/useAuth';
import UserAvatar from '../user/UserAvatar/UserAvatar';
import CommentApi from '../../api/commentApi';
import styles from './CommentSection.module.css';

const CommentSection = ({ comments = [], recipeId, commentCount = 0, onCommentAdded }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/recipes/${recipeId}`, message: 'Влезте в профила си, за да коментирате' } });
      return;
    }
    
    if (!newComment.trim()) {
      setError('Моля, въведете коментар.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await CommentApi.create(recipeId, { content: newComment });
      setNewComment('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      setError(err.message || 'Възникна грешка при публикуването на коментара.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Използваме commentCount от API вместо дължината на масива с коментари
  const totalComments = commentCount || comments?.length || 0;
  const hasMoreComments = commentCount > comments?.length;

  return (
    <section className={styles.commentSection}>
      <h2 className={styles.sectionHeading}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
        </svg>
        Коментари ({totalComments})
      </h2>

      <div className={styles.commentForm}>
        {isAuthenticated ? (
          <>
            <UserAvatar src={user?.profilePicture} alt={user?.username} size="medium" />
            <form onSubmit={handleSubmitComment} className={styles.form}>
              <div className={styles.inputWrapper}>
                <textarea
                  className={styles.commentInput}
                  placeholder="Добавете вашия коментар..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={500}
                />
                {error && <p className={styles.errorMessage}>{error}</p>}
              </div>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? 'Изпращане...' : 'Публикувай'}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.loginPrompt}>
            <p>За да коментирате, моля <Link to="/login">влезте в профила си</Link> или <Link to="/register">се регистрирайте</Link>.</p>
          </div>
        )}
      </div>

      <div className={styles.commentsList}>
        {comments && comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <div key={comment._id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <Link to={`/profile/${comment.author?._id}`} className={styles.commentAuthor}>
                    <UserAvatar src={comment.author?.profilePicture} alt={comment.author?.username} size="small" />
                    <span className={styles.authorName}>{comment.author?.username || 'Анонимен'}</span>
                  </Link>
                  <span className={styles.commentDate}>{formatDate(comment.createdAt)}</span>
                </div>
                <div className={styles.commentContent}>
                  {comment.content}
                </div>
              </div>
            ))}
            
            {hasMoreComments && (
              <div className={styles.moreComments}>
                <Link to={`/recipes/${recipeId}/comments`} className={styles.viewAllLink}>
                  Вижте всички {totalComments} коментара
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyComments}>
            <p>Все още няма коментари. Бъдете първият, който ще коментира!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommentSection;