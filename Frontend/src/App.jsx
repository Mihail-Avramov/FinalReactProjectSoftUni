import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/api/AuthProvider';
import Layout from './components/layout/Layout';
import { RequireAuth, RequireGuest } from './components/auth/ProtectedRoutes';

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
import ProfileEditPage from './pages/user/ProfileEditPage';
//import AccountSettingsPage from './pages/user/AccountSettingsPage';
import PasswordChangePage from './pages/user/PasswordChangePage';
import DeleteAccountPage from './pages/user/DeleteAccountPage';
//import MyRecipesPage from './pages/user/MyRecipesPage';
//import MyFavoritesPage from './pages/user/MyFavoritesPage';

function App() {
  return (
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

          {/* Защитени маршрути само за влезли потребители 
          <Route path="/account/settings" element={
            <RequireAuth>
              <AccountSettingsPage />
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
          } />*/}
          
          {/* Маршрути за профил - публично достъпен профил с id параметър */}
          <Route path="/profile/:userId" element={<ProfilePage />} />
          
          {/* Страница за грешка */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;