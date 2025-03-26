# CulinaryCorner Backend API

A robust and feature-rich backend for the CulinaryCorner recipe sharing platform, built with Node.js, Express, and MongoDB.

## 🌐 Live Demo

- **API:** [CulinaryCorner API](https://culinarycornerapi.onrender.com/)

## 🛠️ Technology Stack

- **Node.js & Express.js**: Fast, unopinionated web framework
- **MongoDB & Mongoose**: NoSQL database with robust ODM
- **JWT Authentication**: Secure user authentication with token blacklisting
- **Cloudinary**: Cloud image storage with optimizations and transformations
- **Express Validator**: Input validation and sanitization
- **Bcrypt**: Secure password hashing
- **Nodemailer**: Email delivery for verification and password reset
- **Helmet**: Security headers for enhanced protection
- **Rate Limiting**: Protection against brute force attacks

## ✨ Key Features

### Authentication & User Management
- Complete authentication flow (register, login, logout)
- Email verification for new accounts
- Password reset with secure tokens
- User profile management with image uploads
- Account deletion with cascading cleanup

### Recipe System
- Create, read, update, and delete recipes
- Multiple image uploads with optimizations
- Rich recipe metadata (prep time, difficulty, servings)
- Intelligent filtering and searching
- Pagination with customizable limits

### Social Features
- Like/unlike recipes
- Save recipes to favorites
- Comment on recipes
- Comment moderation by recipe owners

### Performance & Security
- In-memory caching for trending recipes
- Request rate limiting for API protection
- Input validation with custom error messages
- Comprehensive error handling
- Token blacklisting for secure logout
- MongoDB indexing for query optimization

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | Logout (blacklist token) |
| GET | `/api/auth/verify-email/:token` | Verify email address |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/verify-token` | Verify JWT token validity |

### Recipe Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | Get all recipes with filtering |
| GET | `/api/recipes/:id` | Get recipe by ID |
| POST | `/api/recipes` | Create a new recipe |
| PUT | `/api/recipes/:id` | Update a recipe |
| DELETE | `/api/recipes/:id` | Delete a recipe |
| GET | `/api/recipes/trending` | Get trending recipes |
| GET | `/api/recipes/users/:id` | Get user's recipes |
| GET | `/api/recipes/users/favorites` | Get current user's favorites |
| POST | `/api/recipes/:id/like` | Toggle like status |
| POST | `/api/recipes/:id/favorite` | Toggle favorite status |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile/:id` | Get user profile |
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update user profile |
| PUT | `/api/users/profile-picture` | Update profile picture |
| DELETE | `/api/users/profile-picture` | Reset profile picture |
| PUT | `/api/users/change-password` | Change password |
| DELETE | `/api/users/account` | Delete user account |
| GET | `/api/users/stats/:id` | Get user stats |

### Comment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/recipe/:id` | Get comments for a recipe |
| POST | `/api/comments/recipe/:id` | Add comment to recipe |
| PUT | `/api/comments/:id` | Update a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

### Config Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/config` | Get app configuration |

## 🔒 Security Measures

- **Password Security**: Bcrypt hashing with salt rounds
- **Token Management**: JWT tokens with blacklisting for logout
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Custom error classes with sanitized output in production
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Helmet integration for HTTP header security
- **MongoDB Indexing**: Proper indexes to prevent injection attacks
- **Environment Variables**: Sensitive configuration stored in .env files

## 🚀 Performance Optimizations

- **Cloudinary Transformations**: Automatic image optimization and resizing
- **In-Memory Caching**: Caching of trending recipes and frequently accessed data
- **Database Indexing**: Strategic indexes for common query patterns
- **Pagination**: All list endpoints support pagination to limit response size
- **Lean Queries**: Mongoose lean() for faster document retrieval
- **Selective Population**: Only load required fields for better performance
- **Token Cleanup**: Automatic cleanup of expired blacklisted tokens

## 📁 Project Structure

```
Backend/
├── config/               # Configuration files
│   ├── default.js        # Default app configuration
│   ├── db.js             # Database connection
│   └── cloudinary.js     # Cloudinary configuration
├── controllers/          # Request handlers
├── middleware/           # Express middleware
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Central error handling
│   └── upload.js         # File upload handling
├── models/               # Mongoose models
│   ├── User.js           # User model
│   ├── Recipe.js         # Recipe model
│   ├── Comment.js        # Comment model
│   └── BlacklistedToken.js # Token blacklist
├── routes/               # API routes
├── services/             # Business logic
│   ├── authService.js    # Authentication logic
│   ├── recipeService.js  # Recipe operations
│   ├── userService.js    # User operations
│   ├── commentService.js # Comment operations
│   ├── imageService.js   # Image handling
│   └── emailService.js   # Email sending
├── utils/                # Utility functions
│   ├── validation.js     # Input validation
│   ├── errorMessages.js  # Centralized error messages
│   ├── cache.js          # In-memory caching
│   └── cloudinary.js     # Cloudinary helpers
├── .env                  # Environment variables
├── server.js             # Application entry point
└── package.json          # Dependencies
```

## ⚙️ Environment Variables

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
EMAIL_HOST=your_email_host
EMAIL_PORT=465
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_password
EMAIL_FROM_NAME=CulinaryCorner
EMAIL_FROM_ADDRESS=noreply@culinarycorner.com
FRONTEND_URL=https://your-frontend-url.com
```

## 🔧 Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/Mihail-Avramov/FinalReactProjectSoftUni.git
cd FinalReactProjectSoftUni/Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
- Create a .env file based on the template above

4. **Start the development server**
```bash
npm run dev
```

5. **Start the production server**
```bash
npm start
```

## 📋 API Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "pagination": { /* pagination data if applicable */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Error message",
    "fields": { /* validation errors by field */ }
  }
}
```

## 👨‍💻 Developers

### Mihail Avramov
[![GitHub](https://img.shields.io/badge/GitHub-Mihail--Avramov-181717?style=flat&logo=github)](https://github.com/Mihail-Avramov)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mihail%20Avramov-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/mihailavramov/)

## 📄 License

MIT License