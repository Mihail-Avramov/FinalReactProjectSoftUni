import React, { useState } from 'react';
import styles from './Contact.module.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Тук бихме добавили истинска логика за изпращане на имейл
    // За демонстрационни цели просто симулираме успешно изпращане
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Благодарим за съобщението! Ще се свържем с вас скоро.'
    });
    
    // Изчистваме формата след успешно изпращане
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.pageHeader}>
        <h1>Свържете се с нас</h1>
        <div className={styles.headerDivider}></div>
      </div>
      
      <div className={styles.contactContainer}>
        <div className={styles.contactInfo}>
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div>
              <h3>Адрес</h3>
              <p>бул. България 58, София 1404</p>
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div>
              <h3>Телефон</h3>
              <p>+359 2 123 4567</p>
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <div className={styles.infoIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div>
              <h3>Имейл</h3>
              <p>info@culinarycorner.com</p>
            </div>
          </div>
          
          <div className={styles.hours}>
            <h3>Работно време за контакти</h3>
            <p>Понеделник - Петък: 9:00 - 17:00</p>
            <p>Събота - Неделя: Затворено</p>
          </div>
        </div>
        
        <div className={styles.contactForm}>
          <h2>Изпратете съобщение</h2>
          
          {formStatus.submitted && (
            <div className={formStatus.success ? styles.successMessage : styles.errorMessage}>
              {formStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Име</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Вашето име" 
                required 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Имейл</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Вашият имейл" 
                required 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="subject">Относно</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                value={formData.subject} 
                onChange={handleChange} 
                placeholder="Тема на съобщението" 
                required 
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="message">Съобщение</label>
              <textarea 
                id="message" 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Вашето съобщение" 
                rows="6" 
                required 
              ></textarea>
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Изпрати съобщение
            </button>
          </form>
        </div>
      </div>
      
      <div className={styles.mapContainer}>
        <h2>Намерете ни</h2>
        <div className={styles.map}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2933.1124771822857!2d23.3081320766055!3d42.679301671441556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40aa85cb55555555%3A0x7073d67dd30b0ef8!2sBulgaria%20Blvd%2058%2C%201404%20Sofia!5e0!3m2!1sen!2sbg!4v1616149562836!5m2!1sen!2sbg" 
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy"
            title="Карта до офиса на CulinaryCorner"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default Contact;