import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store';
import { setUserFromStorage, logout } from './store/slices/authSlice';
import type { AuthUser } from './api/auth';
import api from './api/client';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WishlistEdit from './pages/WishlistEdit';
import PublicWishlist from './pages/PublicWishlist';

function App() {
  const { loaded } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onLogout = () => dispatch(logout());
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [dispatch]);

  useEffect(() => {
    if (loaded) return;
    api
      .get('/auth/me')
      .then((r) => r.data)
      .then((user: AuthUser) => dispatch(setUserFromStorage(user)))
      .catch(() => dispatch(setUserFromStorage(null)));
  }, [loaded, dispatch]);

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/w/:token" element={<PublicWishlist />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="wishlist/:id" element={<WishlistEdit />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
