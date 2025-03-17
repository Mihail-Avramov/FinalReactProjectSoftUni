# CulinaryCorner - Recipe Sharing Platform

## Overview
A social platform for sharing and discovering recipes, with features for user interaction and recipe management.

## Features

### Public Area
- Browse recipes catalog
- View recipe details
- Search recipes
- User registration/login

### Private Area
- Create/edit/delete own recipes
- Save favorite recipes
- Comment on recipes
- Like recipes
- Personal profile management

## Technical Implementation

### Core Features
1. User Authentication
   - Register/Login/Logout
   - Profile management
   
2. Recipe Management
   - CRUD operations for recipes
   - Image upload
   - Categories
   
3. Social Features
   - Comments
   - Likes
   - Save to favorites

### Tech Stack
- Frontend: Vite + React 19 (without TypeScript)
- Backend: Express.js
- Database: MongoDB Atlas
- Authentication: JWT tokens
- Storage: Cloudinary
- State Management: Context API
- Routing: React Router
- Styling: CSS Modules

### Backend Implementation
1. Data Models
   - User Schema
   - Recipe Schema
   - Comment Schema

2. Express API Services
   - Authentication
     - JWT-based auth system
     - Password hashing with bcrypt
   - RESTful Endpoints
     - User management
     - Recipe CRUD operations
     - Comments and likes functionality
   - Data Validation
     - Input validation with express-validator
     - Error handling middleware

3. MongoDB Integration
   - Mongoose ORM
   - MongoDB Atlas cloud hosting
   - Relationship handling between collections
   - Indexing for search performance

4. Cloudinary Integration
   - Image upload and optimization
   - Secure asset management
   - Transformation options for responsive images

### API Structure

1. Authentication Routes
   - POST /api/auth/register - Регистрация на нов потребител с опционална профилна снимка
   - POST /api/auth/login - Вход в системата с email и парола

2. User Routes
   - GET /api/users/profile/:id - Публичен профил на потребител
   - GET /api/users/stats/:id - Публична статистика за потребител
   - GET /api/users/profile - Профил на текущия потребител (защитен)
   - GET /api/users/stats - Статистика за текущия потребител (защитен)
   - PUT /api/users/profile - Редактиране на профилна информация (защитен)
   - PUT /api/users/profile-picture - Качване на нова профилна снимка (защитен)
   - PUT /api/users/change-password - Промяна на парола (защитен)
   - DELETE /api/users/account - Изтриване на акаунт (защитен)
   - DELETE /api/users/profile-picture - Премахване на профилна снимка (защитен)

3. Recipe Routes
   - GET /api/recipes - Списък с рецепти с филтриране и пагинация
   - GET /api/recipes/:id - Детайли за конкретна рецепта
   - POST /api/recipes - Създаване на нова рецепта (защитен)
   - PUT /api/recipes/:id - Редактиране на рецепта (защитен, собственик)
   - DELETE /api/recipes/:id - Изтриване на рецепта (защитен, собственик)
   
   - GET /api/recipes/trending - Популярни рецепти
   - GET /api/recipes/users/ - Рецепти на текущия потребител (защитен)
   - GET /api/recipes/users/:id - Рецепти на конкретен потребител
   - GET /api/recipes/users/favorites - Любими рецепти на текущия потребител (защитен)
   
   - POST /api/recipes/:id/like - Харесване/отхаресване на рецепта (защитен)
   - POST /api/recipes/:id/favorite - Добавяне/премахване от любими (защитен)

4. Comment Routes
   - POST /api/comments/recipe/:id - Създаване на коментар към рецепта (защитен)
   - GET /api/comments/recipe/:id - Коментари към рецепта (защитен)
   - PUT /api/comments/:id - Редактиране на коментар (защитен)
   - DELETE /api/comments/:id - Изтриване на коментар (защитен)

5. Configuration Routes
   - GET /api/config - Системна конфигурация и референтни данни

### Frontend Architecture
1. Component Structure
   - Layout components (Header, Footer, Container)
   - Auth components (Login, Register, PasswordChange)
   - User components (Profile, Statistics, ProfileEditor)
   - Recipe components (RecipeCard, RecipeDetail, RecipeForm, RecipeList)
   - Social interaction components (Like, Favorite, CommentSection, CommentForm)
   - UI components (Modals, Alerts, Loading, Pagination, Filters)
   - Configuration components (SystemSettings, ReferenceData)

2. State Management
   - Auth context (user authentication, permissions)
   - Recipe context (recipes, favorites, user recipes)
   - Comment context (comments for current recipe)
   - Config context (system configuration, reference data)
   - UI context (loading states, notifications)
   - Form handling (validation, submission, file uploads)

3. API Integration
   - Custom hooks for data fetching (useRecipes, useComments, useUser, useConfig)
   - API service modules aligned with backend routes:
     - authService (login, register)
     - userService (profile, stats)
     - recipeService (CRUD, likes, favorites)
     - commentService (CRUD)
     - configService (system configuration)
   - Request interceptors for authentication and error handling
   - Loading/error states with centralized management
   - File upload handling with progress tracking

### React-Specific Implementation Details
1. Component Architecture
   - Functional components with hooks for stateful logic
   - Pure components for presentational elements
   - Component composition for feature-rich UIs (e.g., RecipeDetail composing Comments, LikeButton)
   - Custom hooks for shared behaviors (usePagination, useForm, useFileUpload)
   - Context providers for global state segments

2. Form Implementation
   - Controlled inputs with state binding
   - Form validation with error handling
   - Synthetic events for form submissions and user interactions

3. Routing Structure (Minimum 5 routes)
   - Home page (/) with trending recipes
   - Recipe catalog (/recipes) with filters and pagination
   - Recipe details (/recipes/:id) with comments section
   - Recipe management:
     - Create recipe (/recipes/create)
     - Edit recipe (/recipes/:id/edit)
   - User sections:
     - Own profile (/profile)
     - Profile editor (/profile/edit)
     - Password change (/profile/change-password)
     - Favorite recipes (/profile/favorites)
     - My recipes (/profile/recipes)
   - Other user profiles (/users/:id) with their recipes
   - Authentication:
     - Login (/login)
     - Register (/register)

4. Route Guards
   - AuthGuard HOC for protecting private routes (profile, create/edit recipe)
   - OwnerGuard for resource-specific operations:
     - Recipe editing/deletion (only recipe author)
     - Comment editing/deletion (only comment author or recipe owner)
   - Permission-based component rendering and conditional UI
   - Redirection logic:
     - Unauthenticated users → login page
     - Unauthorized users → error page or home
   - Route-specific context providers (e.g., RecipeProvider for recipe routes)

5. Version Control Strategy
   - Feature-based branching
   - Meaningful commit messages
   - Regular commits across development period (minimum 3+ days)

### Development Environment
- Concurrently for running frontend and backend
- Nodemon for auto-restarting server
- Dotenv for environment variables
- ESLint and Prettier for code formatting
- Git for version control

### Deployment
- Frontend: Vercel/Netlify
- Backend: Render/Railway
- Database: MongoDB Atlas
- Media: Cloudinary

### Bonus Features
- Recipe search with filters
- Share recipes on social media
- Print recipe feature
- Nutritional information calculation

### Project Timeline
1. Setup & Configuration (1 week)
   - Create project repositories
   - Configure development environment
   - Set up MongoDB Atlas

2. Backend Development (1 week)
   - Implement authentication
   - Create data models
   - Develop API endpoints

3. Frontend Development (1 week)
   - Build UI components
   - Implement state management
   - Connect to API

4. Testing & Refinement (1 week)
   - End-to-end testing
   - Bug fixes
   - Performance optimization

5. Deployment & Documentation (2 days)
   - Deploy to production
   - Write documentation
   - Final review