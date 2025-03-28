import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppInitializer from './components/common/AppInitializer/AppInitializer';
import { AuthProvider } from './hooks/api/AuthProvider';
import { RequireAuth, RequireGuest } from './components/auth/ProtectedRoutes';
import { RequireAuthor } from './components/auth/RequireAuthor';
import Layout from './components/layout/Layout';

// Основни страници
import Home from './pages/Home/Home';
import About from './pages/static/About';
import Terms from './pages/static/Terms';
import Privacy from './pages/static/Privacy';
import Contact from './pages/static/Contact';
import FAQ from './pages/static/FAQ';
import NotFound from './pages/static/NotFound';

// Автентикационни страници
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Потребителски страници
import ProfilePage from './pages/user/ProfilePage';
import UserRecipesPage from './pages/user/UserRecipesPage';
import ProfileEditPage from './pages/user/ProfileEditPage';
import PasswordChangePage from './pages/user/PasswordChangePage';
import DeleteAccountPage from './pages/user/DeleteAccountPage';

// Страници за рецепти
import RecipesPage from './pages/recipes/RecipesPage';
import RecipeDetailPage from './pages/recipes/RecipeDetailPage';
import CreateRecipePage from './pages/recipes/CreateRecipePage';
import EditRecipePage from './pages/recipes/EditRecipePage';
import DeleteRecipePage from './pages/recipes/DeleteRecipePage';
import MyRecipesPage from './pages/recipes/MyRecipesPage';
import MyFavoritesPage from './pages/recipes/MyFavoritesPage';

function App() {
  
  return (
    <AppInitializer>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Публични маршрути */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            
            {/* Маршрути само за гости */}
            <Route path="/login" element={
              <RequireGuest>
                <LoginPage />
              </RequireGuest>
            } />
            <Route path="/register" element={
              <RequireGuest>
                <RegisterPage />
              </RequireGuest>
            } />
            <Route path="/forgot-password" element={
              <RequireGuest>
                <ForgotPasswordPage />
              </RequireGuest>
            } />
            <Route path="/reset-password/:token" element={
              <RequireGuest>
                <ResetPasswordPage />
              </RequireGuest>
              } />
            <Route path="/verify-email/:token" element={
              <RequireGuest>
                <VerifyEmailPage />
              </RequireGuest>
              } />
            
            {/* Защитени маршрути само за влезли потребители */}
            <Route path="/profile" element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            } />
            <Route path="/profile/edit" element={
              <RequireAuth>
                <ProfileEditPage />
              </RequireAuth>
            } />
            <Route path="/account/change-password" element={
              <RequireAuth>
                <PasswordChangePage />
              </RequireAuth>
            } />
            <Route path="/account/delete" element={
              <RequireAuth>
                <DeleteAccountPage />
              </RequireAuth>
            } />

            {/* Защитени маршрути за рецепти */}
            <Route path="/recipes/create" element={
              <RequireAuth>
                <CreateRecipePage />
              </RequireAuth>
            } />
            <Route path="/recipes/:id/edit" element={
              <RequireAuth>
                <RequireAuthor action="edit">
                  <EditRecipePage />
                </RequireAuthor>
              </RequireAuth>
            } />

            <Route path="/recipes/:id/delete" element={
              <RequireAuth>
                <RequireAuthor action="delete">
                  <DeleteRecipePage />
                </RequireAuthor>
              </RequireAuth>
            } />
            <Route path="/my-recipes" element={
              <RequireAuth>
                <MyRecipesPage />
              </RequireAuth>
            } />
            <Route path="/my-favorites" element={
              <RequireAuth>
                <MyFavoritesPage />
              </RequireAuth>
            } />
            
            {/* Маршрути за профил - публично достъпен профил с id параметър */}
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/profile/:userId/recipes" element={<UserRecipesPage />} />
            
            {/* Страница за грешка */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </AppInitializer>
  );
}

export default App;