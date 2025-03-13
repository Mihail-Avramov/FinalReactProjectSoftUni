# CulinaryCorner

A full-stack recipe sharing platform where users can discover, create, and share recipes with a community of food enthusiasts.

## 🍲 Overview

CulinaryCorner allows users to:
- Browse and search for recipes
- Create and share their own recipes with images
- Save favorite recipes for later
- Comment on recipes
- Manage their personal profile

## 🚀 Tech Stack

### Frontend
- React 19 with Vite
- React Router for navigation
- Context API for state management
- CSS Modules for styling
- Axios for API communication

### Backend
- Express.js
- MongoDB Atlas
- JWT authentication
- Cloudinary for image storage

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/culinary-corner.git
cd culinary-corner
```

2. Install dependencies for both frontend and backend
```bash
npm run install:all
```

3. Create .env files:

In the Backend folder:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

In the Frontend folder:
```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_UPLOAD_PRESET=culinary_corner
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

4. Start the application
```bash
# Start both simultaneously
npm start

# The backend will run on http://localhost:5000
# The frontend will run on http://localhost:5173
```

## 📁 Project Structure

```
CulinaryCorner/
├── Backend/            # Express.js server
├── Frontend/           # Vite + React application
├── .gitignore          # Git ignore file
├── package.json        # Root package.json
└── README.md           # Project documentation
```

## 🌟 Features

### Public Features
- Browse recipes catalog
- View recipe details
- Search recipes
- User registration/login

### Private Features
- Create/edit/delete recipes
- Save favorite recipes
- Comment on recipes
- Like recipes
- Personal profile management

## 👨‍💻 Developers

- Martin Avramov (@mavramov)

## 📄 License

MIT License



