import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import api from '../api/client';
import './Header.scss';

export default function Header() {
  const { user } = useAppSelector((s) => s.auth);
  const theme = useAppSelector((s) => s.theme);
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_err) {}
    dispatch(logout());
  };

  return (
    <header className="header">
      <Link to={user ? '/wishlist' : '/'} className="header__logo">
        Мои вишлисты
      </Link>
      <div className="header__right">
        {isLanding ? (
          <>
            <button
              type="button"
              className="header__theme"
              onClick={() => dispatch(toggleTheme())}
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              aria-label="Переключить тему"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to={user ? '/wishlist' : '/login'} className="header__auth-link header__auth-link--primary">
              Войти
            </Link>
          </>
        ) : user ? (
          <>
            <span className="header__user-wrap">
              <span className="header__user-icon" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 14a4 4 0 0 0 4-4 4 4 0 0 0-4-4 4 4 0 0 0-4 4 4 4 0 0 0 4 4z" />
                  <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </span>
              <span className="header__user">{user?.displayName || user?.email}</span>
            </span>
            <button
              type="button"
              className="header__theme"
              onClick={() => dispatch(toggleTheme())}
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              aria-label="Переключить тему"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button type="button" className="header__logout" onClick={handleLogout}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="header__theme"
              onClick={() => dispatch(toggleTheme())}
              title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              aria-label="Переключить тему"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/login" className="header__auth-link">
              Войти
            </Link>
            <Link to="/register" className="header__auth-link header__auth-link--primary">
              Регистрация
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
