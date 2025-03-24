import React, { useRef, useState } from 'react';
import Button from '../Button';
import { validateImage } from '../../../utils/imageOptimization';
import './BulkImageUpload.css';

const MAX_FILES = 5;

const BulkImageUpload = ({ label, onChange, currentImages = [], className, error }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };
  
  const processFiles = (newFiles) => {
    // Колко още файлове можем да добавим
    const remainingSlots = MAX_FILES - currentImages.length;
    
    if (remainingSlots <= 0) {
      onChange(currentImages, { error: `Максимален брой изображения достигнат (${MAX_FILES})` });
      return;
    }
    
    // Ограничаваме до позволения брой
    const filesToProcess = newFiles.slice(0, remainingSlots);
    
    // Валидиране на всеки файл
    const validFiles = [];
    let validationError = null;
    
    for (const file of filesToProcess) {
      const validation = validateImage(file);
      if (validation.valid) {
        validFiles.push({
          file,
          preview: URL.createObjectURL(file)
        });
      } else {
        validationError = validation.error;
        break;
      }
    }
    
    if (validationError) {
      onChange(currentImages, { error: validationError });
      return;
    }
    
    // Комбиниране на текущите и новите изображения
    const allImages = [...currentImages, ...validFiles];
    
    // Обратно извикване с всички валидни файлове
    onChange(allImages);
  };
  
  const handleRemove = (indexToRemove) => {
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    onChange(updatedImages);
  };
  
  return (
    <div className={`bulk-image-upload-container ${className || ''}`}>
      {label && <label className="bulk-image-upload-label">{label}</label>}
      
      <div className="bulk-image-counter">
        <span className={currentImages.length >= MAX_FILES ? 'limit-reached' : ''}>
          {currentImages.length} / {MAX_FILES} изображения
        </span>
      </div>
      
      {currentImages.length < MAX_FILES && (
        <div 
          className={`bulk-image-upload-area ${dragActive ? 'active' : ''}`}
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          
          <div className="upload-placeholder">
            <i className="fa fa-cloud-upload-alt"></i>
            <p>Плъзнете и пуснете изображения тук или кликнете за да изберете</p>
            <span>Формати: JPG, PNG, WebP</span>
            <span>Максимален размер: 5 MB на файл</span>
            <span>Максимален брой: {MAX_FILES} изображения</span>
          </div>
        </div>
      )}
      
      {currentImages.length > 0 && (
        <div className="bulk-image-previews">
          {currentImages.map((img, index) => (
            <div className="image-preview-item" key={`preview-${index}`}>
              <img src={img.preview} alt={`Снимка ${index + 1}`} />
              <button className="remove-image-btn" onClick={() => handleRemove(index)} type="button">
                <i className="fa fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {error && <div className="bulk-image-upload-error">{error}</div>}
      
      {currentImages.length > 0 && (
        <div className="clear-images-container">
          <Button 
            type="button" 
            variant="outline-danger" 
            size="small" 
            onClick={() => onChange([])}
          >
            Премахни всички снимки
          </Button>
        </div>
      )}
    </div>
  );
};

export default BulkImageUpload;