import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { setAuth } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { authApi } from '../api/auth';
import './Auth.scss';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const theme = useAppSelector((s) => s.theme);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register(email, password, displayName || undefined);
      dispatch(setAuth({ user: data.user }));
      navigate(redirect);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(msg === 'USER_EXISTS' ? 'Такой email уже зарегистрирован' : msg || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg" aria-hidden>
        <span className="auth-page__blob auth-page__blob--1" />
        <span className="auth-page__blob auth-page__blob--2" />
        <span className="auth-page__blob auth-page__blob--3" />
        <span className="auth-page__blob auth-page__blob--4" />
        <span className="auth-page__blob auth-page__blob--5" />
        <span className="auth-page__blob auth-page__blob--6" />
        <span className="auth-page__blob auth-page__blob--7" />
        <span className="auth-page__blob auth-page__blob--8" />
        <span className="auth-page__blob auth-page__blob--9" />
        <span className="auth-page__blob auth-page__blob--10" />
        <span className="auth-page__blob auth-page__blob--11" />
        <span className="auth-page__blob auth-page__blob--12" />
        <span className="auth-page__blob auth-page__blob--13" />
        <span className="auth-page__blob auth-page__blob--14" />
        <span className="auth-page__blob auth-page__blob--15" />
        <span className="auth-page__blob auth-page__blob--16" />
        <span className="auth-page__blob auth-page__blob--17" />
        <span className="auth-page__blob auth-page__blob--18" />
        <span className="auth-page__blob auth-page__blob--19" />
        <span className="auth-page__blob auth-page__blob--20" />
        <span className="auth-page__blob auth-page__blob--21" />
        <span className="auth-page__blob auth-page__blob--22" />
        <span className="auth-page__blob auth-page__blob--23" />
        <span className="auth-page__blob auth-page__blob--24" />
        <span className="auth-page__blob auth-page__blob--25" />
        <span className="auth-page__blob auth-page__blob--26" />
        <span className="auth-page__blob auth-page__blob--27" />
        <span className="auth-page__blob auth-page__blob--28" />
        <span className="auth-page__blob auth-page__blob--29" />
        <span className="auth-page__blob auth-page__blob--30" />
        <span className="auth-page__blob auth-page__blob--31" />
        <span className="auth-page__blob auth-page__blob--32" />
        <span className="auth-page__blob auth-page__blob--33" />
        <span className="auth-page__blob auth-page__blob--34" />
        <span className="auth-page__blob auth-page__blob--35" />
        <span className="auth-page__blob auth-page__blob--36" />
        <span className="auth-page__blob auth-page__blob--37" />
        <span className="auth-page__blob auth-page__blob--38" />
        <span className="auth-page__blob auth-page__blob--39" />
        <span className="auth-page__blob auth-page__blob--40" />
      </div>
      <header className="auth-header">
        <h1 className="auth-heading">Создайте ваш список желаний</h1>
        <button
          type="button"
          className="auth-theme"
          onClick={() => dispatch(toggleTheme())}
          title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
          aria-label="Переключить тему"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      <div className="auth-card">
        <h1 className="auth-title">Регистрация</h1>
        <form onSubmit={submit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="auth-input"
          />
          <input
            type="text"
            placeholder="Имя (необязательно)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Пароль (минимум 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            required
            minLength={6}
            autoComplete="new-password"
            className="auth-input"
          />
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
          {error && <p className="auth-error" role="alert">{error}</p>}
        </form>
        <p className="auth-footer">
          Уже есть аккаунт? <Link to={redirect !== '/' ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}>Войти</Link>
        </p>
      </div>
    </div>
  );
}
