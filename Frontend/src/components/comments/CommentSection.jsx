import React, { useState } from 'react';
import { useComment } from '../../hooks/api/useComment';
import { useAuth } from '../../hooks/api/useAuth';
import UserAvatar from '../user/UserAvatar/UserAvatar';
import Pagination from '../common/Pagination';
import Alert from '../common/Alert';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal from '../common/ConfirmModal';
import styles from './CommentSection.module.css';

const CommentSection = ({ recipeId, recipeOwnerId, onCommentAdded }) => {
  const { isAuthenticated, user } = useAuth();
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editContent, setEditContent] = useState('');
  
  // Състояние за модалния прозорец
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
    type: 'warning'
  });
  
  // Проверка дали текущият потребител е собственик на рецептата
  const isRecipeOwner = isAuthenticated && user && String(user._id) === String(recipeOwnerId);
  
  const {
    comments = [],
    pagination = { 
      totalItems: 0, 
      page: 1, 
      totalPages: 0,
      limit: 5
    },
    loading,
    error,
    editingComment,
    createComment,
    updateComment,
    deleteComment,
    canEditComment,
    startEditing,
    cancelEditing,
    setPage,
  } = useComment(recipeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newCommentContent.trim() === '') return;

    const result = await createComment(newCommentContent);
    if (result) {
      setNewCommentContent('');
      if (onCommentAdded) onCommentAdded();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingComment || editContent.trim() === '') return;

    const success = await updateComment(editingComment._id, editContent);
    if (success) {
      cancelEditing();
    }
  };

  const handleStartEdit = (comment) => {
    startEditing(comment);
    setEditContent(comment.content);
  };
  
  // Функция за отваряне на модал за потвърждение на изтриване
  const openDeleteConfirmation = (commentId, isCommentAuthor, authorName) => {
    const isModeration = isRecipeOwner && !isCommentAuthor;
    
    let config = {
      onConfirm: () => deleteComment(commentId),
      confirmText: 'Изтрий',
      type: isModeration ? 'warning' : 'danger'
    };
    
    if (isModeration) {
      config.title = 'Модериране на коментар';
      config.message = `Като автор на рецептата имате право да модерирате коментарите. Сигурни ли сте, че искате да изтриете коментара на ${authorName || 'този потребител'}?`;
      config.confirmText = 'Модерирай';
    } else {
      config.title = 'Изтриване на коментар';
      config.message = 'Сигурни ли сте, че искате да изтриете този коментар? Това действие не може да бъде отменено.';
    }
    
    setModalConfig(config);
    setModalOpen(true);
  };

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.commentsTitle}>
        Коментари ({pagination?.totalItems ?? 0})
      </h3>
      
      {error && <Alert type="error">{error}</Alert>}
      
      {/* Съобщение за модераторски права */}
      {isRecipeOwner && comments.length > 0 && (
        <div className={styles.moderationNote}>
          <i className="fas fa-shield-alt"></i>
          <span>Като собственик на рецептата, имате право да модерирате коментарите.</span>
        </div>
      )}
      
      {/* Форма за нов коментар - само за логнати потребители */}
      {isAuthenticated ? (
        <div className={styles.commentForm}>
          <UserAvatar 
            src={user?.profilePicture} 
            alt={user?.username}
            size="small" 
          />
          <form onSubmit={handleSubmit}>
            <textarea
              id="new-comment"
              name="commentContent"
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder="Напишете коментар..."
              maxLength={500}
              required
            />
            <button 
              type="submit" 
              disabled={loading || newCommentContent.trim() === ''}
            >
              {loading ? 'Изпращане...' : 'Коментирай'}
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.commentLoginPrompt}>
          <p>Трябва да <a href="/login">влезете в профила си</a>, за да можете да коментирате.</p>
        </div>
      )}
      
      {/* Списък с коментари */}
      {loading && comments.length === 0 ? (
        <LoadingSpinner size="small" message="Зареждане на коментари..." />
      ) : (
        <div className={styles.commentsList}>
          {comments.length === 0 ? (
            <p className={styles.noComments}>Все още няма коментари. Бъдете първият, който ще коментира!</p>
          ) : (
            <>
              {comments.map(comment => {
                // Проверка дали потребителят е автор на коментара
                const isCommentAuthor = isAuthenticated && user && String(user._id) === String(comment.author?._id);
                const authorName = comment.author?.firstName && comment.author?.lastName
                  ? `${comment.author.firstName} ${comment.author.lastName}`
                  : comment.author?.username || 'Анонимен';
                
                return (
                  <div key={comment._id} className={styles.commentItem}>
                    <div className={styles.commentHeader}>
                      <UserAvatar 
                        src={comment.author?.profilePicture} 
                        alt={comment.author?.username}
                        size="small" 
                      />
                      <div className={styles.commentMeta}>
                        <div className={styles.commentAuthor}>
                          {authorName}
                          {isCommentAuthor && <span className={styles.authorBadge}>Автор</span>}
                        </div>
                        <div className={styles.commentDate}>
                          {new Date(comment.createdAt).toLocaleDateString('bg-BG', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {editingComment && editingComment._id === comment._id ? (
                      <form onSubmit={handleUpdate}>
                        <textarea
                          id={`edit-comment-${comment._id}`}
                          name={`edit-comment-${comment._id}`}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          maxLength={500}
                          required
                          autoFocus
                        />
                        <div className={styles.commentActions}>
                          <button type="submit" disabled={loading || editContent.trim() === ''}>
                            Запази промените
                          </button>
                          <button type="button" onClick={cancelEditing}>
                            Отказ
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className={styles.commentContent}>{comment.content}</div>
                        
                        <div className={styles.commentActions}>
                          {canEditComment(comment) && (
                            <button 
                              onClick={() => handleStartEdit(comment)}
                              className={styles.actionButton}
                              title="Редактирай коментара"
                            >
                              <i className="fas fa-edit"></i> Редактирай
                            </button>
                          )}
                          
                          {/* Показваме бутон за изтриване ако е собственик на коментара ИЛИ собственик на рецептата */}
                          {(isCommentAuthor || isRecipeOwner) && (
                            <button 
                              onClick={() => openDeleteConfirmation(comment._id, isCommentAuthor, authorName)}
                              className={`${styles.actionButton} ${isRecipeOwner && !isCommentAuthor ? styles.moderationButton : ''}`}
                              title={isRecipeOwner && !isCommentAuthor ? "Модерирай този коментар" : "Изтрий коментара"}
                            >
                              <i className={`fas ${isRecipeOwner && !isCommentAuthor ? 'fa-shield-alt' : 'fa-trash'}`}></i> 
                              {isRecipeOwner && !isCommentAuthor ? 'Модерирай' : 'Изтрий'}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </>
          )}
          
          {/* Пагинация */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages} 
              onPageChange={setPage} 
            />
          )}
        </div>
      )}
      
      {/* Модален прозорец за потвърждение */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        type={modalConfig.type}
      />
    </div>
  );
};

export default CommentSection;