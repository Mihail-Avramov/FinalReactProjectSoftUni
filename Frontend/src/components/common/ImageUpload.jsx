import React, { useRef, useState } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ label, onChange, currentImage, className, error }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  // Generate a unique ID for the input field
  const inputId = `image-upload-${Math.random().toString(36).substring(2, 9)}`;
  
  const handleClick = () => {
    fileInputRef.current.click();
  };
  
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className={`image-upload-container ${className || ''}`}>
      {label && <label htmlFor={inputId} className="image-upload-label">{label}</label>}
      
      <div 
        className={`image-upload-area ${dragActive ? 'active' : ''} ${currentImage ? 'has-image' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          id={inputId}
          ref={fileInputRef}
          type="file" 
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          style={{ display: 'none' }}
          aria-labelledby={label ? undefined : "upload-instructions"}
        />
        
        {currentImage ? (
          <div className="image-preview">
            <img src={currentImage} alt="Preview" />
            <button className="remove-image-btn" onClick={handleRemove} type="button">
              <i className="fa fa-times"></i>
            </button>
          </div>
        ) : (
          <div className="upload-placeholder">
            <i className="fa fa-cloud-upload-alt"></i>
            <p id="upload-instructions">Плъзнете и пуснете изображение тук или кликнете за да изберете</p>
            <span>Формати: JPG, PNG, WebP</span>
            <span>Максимален размер: 5 MB</span>
          </div>
        )}
      </div>
      
      {error && <div className="image-upload-error" id="upload-error">{error}</div>}
    </div>
  );
};

export default ImageUpload;