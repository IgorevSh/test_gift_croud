import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import type { WishlistDto } from '../api/wishlists';
import { fetchMyWishlists, createWishlist } from '../store/slices/wishlistsSlice';
import './Dashboard.scss';

export default function Dashboard() {
  const { list, loading, error } = useAppSelector((s) => s.wishlists);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMyWishlists());
  }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || creating) return;
    setCreating(true);
    try {
      const result = await dispatch(createWishlist({ title: title.trim() })).unwrap();
      setTitle('');
      navigate(`/wishlist/${result.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dashboard">
      <form onSubmit={handleCreate} className="dashboard__create">
        <input
          type="text"
          placeholder="Название списка (день рождения, Новый год...)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="dashboard__input"
        />
        <button type="submit" className="dashboard__btn" disabled={creating || !title.trim()}>
          {creating ? 'Создаём...' : 'Создать'}
        </button>
      </form>

      {error && <p className="dashboard__error">{error}</p>}

      {loading && !list.length ? (
        <div className="dashboard__loading">Загрузка...</div>
      ) : (
        <ul className="dashboard__list">
          {list.map((w: WishlistDto) => (
            <li key={w.id} className="dashboard__item">
              <Link to={`/wishlist/${w.id}`} className="dashboard__link">
                <span className="dashboard__name">{w.title}</span>
                {w.description && (
                  <span className="dashboard__desc">{w.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && !list.length && (
        <p className="dashboard__empty">Пока нет списков. Создайте первый!</p>
      )}
    </div>
  );
}
