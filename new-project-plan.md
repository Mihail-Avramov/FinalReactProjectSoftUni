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
   - Like Schema

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
   - POST /api/auth/register
   - POST /api/auth/login
   - GET /api/auth/me

2. Recipe Routes
   - GET /api/recipes
   - GET /api/recipes/:id
   - POST /api/recipes
   - PUT /api/recipes/:id
   - DELETE /api/recipes/:id
   - GET /api/recipes/user/:userId

3. Social Interaction Routes
   - POST /api/recipes/:id/comments
   - GET /api/recipes/:id/comments
   - POST /api/recipes/:id/like
   - DELETE /api/recipes/:id/like

### Frontend Architecture
1. Component Structure
   - Layout components
   - Auth components
   - Recipe components
   - Social interaction components

2. State Management
   - Auth context
   - Recipe context
   - Form handling

3. API Integration
   - Custom hooks for data fetching
   - Axios for API requests
   - Loading/error states

### React-Specific Implementation Details
1. Component Architecture
   - Functional components with hooks for stateful logic
   - Pure components for presentational elements
   - HOC patterns for shared functionality

2. Form Implementation
   - Controlled inputs with state binding
   - Form validation with error handling
   - Synthetic events for form submissions and user interactions

3. Routing Structure (Minimum 5 routes)
   - Home page (/)
   - Recipe catalog (/recipes)
   - Recipe details (/recipes/:id) [Parametrized]
   - Create/Edit recipe (/recipes/create, /recipes/:id/edit) [Parametrized]
   - User profile (/profile)
   - Authentication pages (/login, /register)

4. Route Guards
   - AuthGuard HOC for protecting private routes
   - Redirect logic for unauthenticated users
   - Permission-based component rendering

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