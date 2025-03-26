# CulinaryCorner Frontend

A modern, responsive frontend for the CulinaryCorner recipe sharing platform built with React 19 and Vite. This application provides a beautiful and intuitive user interface for exploring, creating, and interacting with recipes.

## 🌐 Live Demo

- **Frontend:** [CulinaryCorner](https://culinarycorner.onrender.com/)

## 🌟 Features

### User Experience
- **Responsive Design**: Optimized for all device sizes
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Interactive UI**: Smooth animations and transitions
- **Loading States**: Skeleton loaders and spinners for improved UX
- **Form Validation**: Comprehensive client-side validation with instant feedback

### Recipe Management
- **Browse & Search**: Explore recipes with advanced filtering and sorting
- **Recipe Creation**: Step-by-step recipe creation with image uploads
- **Rich Media**: Support for multiple images per recipe with gallery view
- **Social Interactions**: Like recipes and save to favorites
- **Comments**: Discuss recipes with other users

### User Management
- **Authentication**: Secure login/register with email verification
- **User Profiles**: Personalized profiles with stats and recipe collections
- **Account Management**: Update profile, change password, delete account

### Performance & SEO
- **Optimized Loading**: Lazy loading and code splitting
- **SEO Ready**: Dynamic meta tags and structured content
- **Image Optimization**: Responsive images with proper sizing

## 🚀 Tech Stack

- **Core**:
  - React 19 with hooks and functional components
  - Vite for fast development and optimized production builds
  - React Router v7 for navigation

- **State Management**:
  - Context API for global state
  - Custom hooks for data fetching and state management

- **Styling**:
  - CSS Modules for component-scoped styling
  - CSS Variables for theming
  - Responsive design with Flexbox and Grid

- **Networking**:
  - Axios for API communication
  - Interceptors for request/response handling
  - AbortController for cancellable requests

- **Form Handling**:
  - Custom validation
  - Controlled components
  - Error state management

- **Media**:
  - Cloudinary for image uploads and transformations
  - Drag-and-drop file uploads

- **UI Components**:
  - Custom button, form, alert, and modal components
  - Loading skeletons for content placeholders
  - Pagination component for data listing

## 📂 Project Structure

```
Frontend/
├── public/              # Static assets
├── src/
│   ├── api/             # API clients
│   │   ├── apiClient.js # Base Axios configuration
│   │   ├── authApi.js   # Authentication endpoints
│   │   ├── recipeApi.js # Recipe endpoints
│   │   └── ...
│   ├── assets/          # Assets and global styles
│   │   ├── images/      # Images and icons
│   │   └── styles/      # Global CSS
│   ├── components/      # Reusable components
│   │   ├── auth/        # Authentication components
│   │   ├── common/      # Common UI components
│   │   ├── layout/      # Layout components
│   │   ├── recipe/      # Recipe-related components
│   │   └── user/        # User-related components
│   ├── hooks/           # Custom React hooks
│   │   ├── api/         # API-related hooks
│   │   └── ...
│   ├── pages/           # Page components
│   │   ├── auth/        # Auth pages
│   │   ├── home/        # Home page
│   │   ├── recipes/     # Recipe pages
│   │   ├── static/      # Static pages
│   │   └── user/        # User pages
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Root App component
│   └── main.jsx         # Entry point
├── .env                 # Environment variables
├── index.html           # HTML template
└── vite.config.js       # Vite configuration
```

## 📋 Key Components

### Core Components
- **Layout**: Main layout with header and footer
- **SEO**: Component for managing dynamic meta tags
- **Button**: Customizable button component with variants
- **Alert**: Notification component for success/error messages
- **LoadingSpinner**: Loading indicator
- **Pagination**: Pagination for data listings

### Recipe Components
- **RecipeCard**: Displays recipe in card format
- **RecipeList**: List of recipe cards with skeleton loading
- **RecipeFilters**: Advanced filtering and sorting
- **ImageGallery**: Gallery for displaying recipe images
- **ImageCarousel**: Carousel for recipe images

### User Components
- **UserAvatar**: User profile picture component
- **ProfileHeader**: User profile header
- **ProfileStats**: User statistics component
- **ProfileForm**: Form for updating profile information

### Form Components
- **FormInput**: Reusable input component with validation
- **BulkImageUpload**: Multi-image upload with preview
- **ConfirmModal**: Confirmation dialog component

## 🌐 API Integration

The frontend communicates with the CulinaryCorner API using custom hooks:

- **useAuth**: Authentication state and actions
- **useRecipes**: Fetching and managing recipes
- **useProfile**: User profile management
- **useComment**: Comment creation and management
- **useConfig**: Site configuration and localization

## 🎨 Styling System

- **CSS Custom Properties**: Theme variables for consistent styling
- **CSS Modules**: Scoped styling for components
- **Global Styles**: Base styles and utility classes
- **Dark Mode Support**: Dark mode via media query

## 🚦 Routing Structure

- **Public Routes**:
  - `/` - Home page with trending recipes
  - `/recipes` - Browse all recipes
  - `/recipes/:id` - View recipe details
  - `/login`, `/register` - Authentication pages
  - `/about`, `/contact`, etc. - Static pages

- **Protected Routes**:
  - `/profile` - User profile
  - `/profile/edit` - Edit profile
  - `/recipes/create` - Create new recipe
  - `/recipes/:id/edit` - Edit recipe
  - `/my-recipes` - User's recipes
  - `/my-favorites` - User's favorite recipes

## 🛠️ Setup and Development

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/culinary-corner.git
cd culinary-corner/Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a .env file in the Frontend directory with the following:

```
VITE_API_URL=https://api.culinarycorner.com/api
VITE_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your-cloud-name/upload
VITE_CLOUDINARY_PRESET=culinary_corner
VITE_APP_NAME=CulinaryCorner
```

### Building for Production
```bash
npm run build
```

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- Mobile: < 576px
- Tablet: 576px - 768px
- Small Desktop: 768px - 992px
- Desktop: > 992px

## 🌙 Dark Mode

Dark mode is automatically applied based on system preferences using CSS media queries.

## 👨‍💻 Developers

### Mihail Avramov
[![GitHub](https://img.shields.io/badge/GitHub-Mihail--Avramov-181717?style=flat&logo=github)](https://github.com/Mihail-Avramov)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mihail%20Avramov-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/mihailavramov/)

## 📄 License

MIT License