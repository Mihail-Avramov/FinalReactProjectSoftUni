const nodemailer = require('nodemailer');
const { AppError } = require('../middleware/errorHandler');

const emailService = {
  /**
   * Send password reset email
   * @param {Object} options - Email options
   * @param {String} options.email - Recipient email
   * @param {String} options.subject - Email subject
   * @param {String} options.message - Email message
   * @param {String} options.resetUrl - Password reset URL
   */
  async sendPasswordResetEmail(options) {
    try {
      // Създаване на транспортер с настройките от променливите на средата
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Дефиниране на опции за имейл
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: options.email,
        subject: options.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Възстановяване на парола</h2>
            <p>Получихме заявка за възстановяване на паролата за вашия акаунт.</p>
            <p>За да създадете нова парола, кликнете на бутона по-долу:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${options.resetUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Възстанови паролата
              </a>
            </div>
            
            <p>Ако не сте заявили възстановяване на паролата, моля игнорирайте този имейл.</p>
            <p>Този линк ще изтече след 30 минути.</p>
            
            <hr style="border: 1px solid #edf2f7; margin: 20px 0;" />
            <p style="color: #718096; font-size: 0.9em;">
              Ако имате проблеми с бутона, копирайте и поставете следния линк в браузъра си:<br>
              <a href="${options.resetUrl}" style="color: #3182ce; word-break: break-all;">${options.resetUrl}</a>
            </p>
          </div>
        `
      };

      // Изпращане на имейла
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending error:', error);
      throw new AppError('Failed to send password reset email', 500);
    }
  },

  /**
   * Send email verification email
   * @param {Object} options - Email options
   * @param {String} options.email - Recipient email
   * @param {String} options.name - Recipient name
   * @param {String} options.verificationUrl - Verification URL
   */
  async sendVerificationEmail(options) {
    try {
      // Създаване на транспортер
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Дефиниране на опции за имейл
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: options.email,
        subject: 'Потвърдете вашия имейл адрес',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4a5568;">Здравейте, ${options.name}!</h2>
            <p>Благодарим, че се регистрирахте в нашето приложение.</p>
            <p>За да активирате вашия акаунт, кликнете на бутона по-долу:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${options.verificationUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Потвърди имейл адреса
              </a>
            </div>
            
            <p>Ако не сте се регистрирали за нашите услуги, моля игнорирайте този имейл.</p>
            <p>Този линк ще изтече след 24 часа.</p>
            
            <hr style="border: 1px solid #edf2f7; margin: 20px 0;" />
            <p style="color: #718096; font-size: 0.9em;">
              Ако имате проблеми с бутона, копирайте и поставете следния линк в браузъра си:<br>
              <a href="${options.verificationUrl}" style="color: #3182ce; word-break: break-all;">${options.verificationUrl}</a>
            </p>
          </div>
        `
      };

      // Изпращане на имейла
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending error:', error);
      throw new AppError('Failed to send verification email', 500);
    }
  }
};

module.exports = emailService;