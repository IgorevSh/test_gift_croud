import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import Header from './Header';
import './Layout.scss';

export default function Layout() {
  const { token, loaded } = useAppSelector((s) => s.auth);

  if (!loaded) return <div className="layout-loading">Загрузка...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="layout">
      <Header />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
