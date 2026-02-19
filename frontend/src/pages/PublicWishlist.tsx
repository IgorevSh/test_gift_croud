import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPublicWishlist, setWishlist, clearPublicWishlist } from '../store/slices/publicWishlistSlice';
import { publicWishlistApi } from '../api/wishlists';
import { wishlistsApi } from '../api/wishlists';
import { io } from 'socket.io-client';
import type { WishlistItemDto } from '../api/wishlists';
import './PublicWishlist.scss';

const SOCKET_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export default function PublicWishlist() {
  const { token } = useParams<{ token: string }>();
  const dispatch = useAppDispatch();
  const { wishlist, found, isOwner, loading, error } = useAppSelector((s) => s.publicWishlist);
  const hasAuth = !!useAppSelector((s) => s.auth.token);
  const currentUserId = useAppSelector((s) => s.auth.user?.id) ?? null;
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (!token || !hasAuth) return;
    dispatch(fetchPublicWishlist(token));
  }, [token, hasAuth, dispatch]);

  useEffect(() => {
    if (!hasAuth && token) dispatch(clearPublicWishlist());
  }, [hasAuth, token, dispatch]);

  useEffect(() => {
    if (!token || !hasAuth) return;
    const socket = io(SOCKET_URL, { path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.emit('joinWishlist', { shareToken: token });
    socket.on('wishlistUpdate', () => {
      publicWishlistApi.getByToken(token!).then((r) => {
        if (r.data.found && r.data.wishlist) dispatch(setWishlist(r.data.wishlist));
      });
    });
    return () => {
      socket.off('wishlistUpdate');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, hasAuth, dispatch]);

  const isGuest = !hasAuth;
  const items = wishlist?.items ?? [];
  const isEmpty = found && items.length === 0;
  const showSkeletons = isGuest || isEmpty;

  const totalItems = items.length;
  const filledItems = totalItems
    ? items.filter((i) => {
        const target = parseFloat(i.targetAmount || i.price || '0') || 0;
        const contrib = Number(i.contributedTotal) || 0;
        const reserved = i.isReserved ?? false;
        if (target > 0) return contrib >= target;
        return reserved;
      }).length
    : 0;
  const overallProgressPercent = totalItems > 0 ? (filledItems / totalItems) * 100 : 0;

  if (!token) return <div className="public-wishlist__error">Нет ссылки</div>;
  if (hasAuth && loading && !wishlist) return <div className="public-wishlist__loading">Загрузка...</div>;
  if (hasAuth && error) return <div className="public-wishlist__error">Ошибка загрузки</div>;
  if (hasAuth && found === false && !loading) return <div className="public-wishlist__error">Список не найден</div>;

  const loginUrl = token ? `/login?redirect=${encodeURIComponent(`/w/${token}`)}` : '/login';

  return (
    <div className="public-wishlist">
      <header className="public-wishlist__header">
        <Link to="/" className="public-wishlist__header-logo">
          Вишлист
        </Link>
        {wishlist?.ownerDisplayName && (
          <span className="public-wishlist__header-author">
            Собирает: {wishlist.ownerDisplayName}
          </span>
        )}
      </header>
      {isGuest && (
        <div className="public-wishlist__overlay" aria-hidden>
          <div className="public-wishlist__overlay-inner">
            <p>Вы просматриваете вишлист по ссылке.</p>
            <p>Войдите в аккаунт, чтобы резервировать подарки или участвовать в сборе.</p>
            <Link to={loginUrl} className="public-wishlist__overlay-btn">
              Войти в аккаунт
            </Link>
          </div>
        </div>
      )}

      <div className="public-wishlist__content">
        <h1 className="public-wishlist__title">{wishlist?.title ?? '—'}</h1>
        {wishlist?.description && (
          <p className="public-wishlist__desc">{wishlist.description}</p>
        )}

        {!showSkeletons && !isOwner && totalItems > 0 && (
          <div className="public-wishlist__overall-progress">
            <div className="public-wishlist__overall-progress-bar">
              <div
                className="public-wishlist__overall-progress-fill"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
            <span className="public-wishlist__overall-progress-text">
              Выполнено пунктов: {filledItems} из {totalItems}
            </span>
          </div>
        )}

        <div className="public-wishlist__list-scroll">
          {showSkeletons ? (
            <div className="public-wishlist__skeleton">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : (
            <ul className="public-wishlist__items">
              {items.map((item: WishlistItemDto) => (
                <PublicItemCard
                  key={item.id}
                  item={item}
                  isOwner={isOwner}
                  isGuest={isGuest}
                  currentUserId={currentUserId}
                  shareToken={token}
                  onUpdate={() => {
                    if (token) {
                      publicWishlistApi.getByToken(token).then((r) => {
                        if (r.data.found && r.data.wishlist) dispatch(setWishlist(r.data.wishlist));
                      });
                    }
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function PublicItemCard({
  item,
  isOwner,
  isGuest,
  currentUserId,
  onUpdate,
}: {
  item: WishlistItemDto;
  isOwner: boolean;
  isGuest: boolean;
  currentUserId: string | null;
  shareToken: string;
  onUpdate: () => void;
}) {
  const [reserving, setReserving] = useState(false);
  const [cancellingReservation, setCancellingReservation] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [contributeAmount, setContributeAmount] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [error, setError] = useState('');

  const isReserved = item.isReserved ?? !!item.reservation;
  const targetNum = parseFloat(item.targetAmount || item.price || '0') || 0;
  const contributed = item.contributedTotal ?? 0;
  const currencySym = item.currency === 'USD' ? '$' : '₽';
  const currencyLabel = item.currency === 'USD' ? 'в долларах' : 'в рублях';
  const contributions = item.contributions ?? [];
  const myContribution =
    item.myContribution != null
      ? { id: item.myContribution.id, amount: item.myContribution.amount }
      : currentUserId
        ? contributions.find((c) => (c.userId ?? (c as { user_id?: string }).user_id) === currentUserId) ?? null
        : null;
  const hasTarget = targetNum > 0;
  const canJoin = hasTarget;
  const showProgressOrJoin = !isOwner && hasTarget;

  const handleReserve = async () => {
    setError('');
    setReserving(true);
    try {
      await wishlistsApi.reserve(item.id);
      onUpdate();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Не удалось зарезервировать');
    } finally {
      setReserving(false);
    }
  };

  const handleCancelReservation = async () => {
    setError('');
    setCancellingReservation(true);
    try {
      await wishlistsApi.cancelReservation(item.id);
      onUpdate();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Не удалось отменить резервацию');
    } finally {
      setCancellingReservation(false);
    }
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeAmount.trim() || contributing) return;
    const amount = contributeAmount.trim();
    const numAmount = parseFloat(amount);
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      setError('Введите положительную сумму');
      return;
    }
    setError('');
    setContributing(true);
    try {
      if (myContribution) {
        await wishlistsApi.updateContribution(item.id, amount);
      } else {
        await wishlistsApi.contribute(item.id, amount);
      }
      setContributeAmount('');
      setShowJoinForm(false);
      onUpdate();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Не удалось внести вклад');
    } finally {
      setContributing(false);
    }
  };

  const handleRemoveContribution = async () => {
    if (!myContribution || contributing) return;
    setError('');
    setContributing(true);
    try {
      await wishlistsApi.removeContribution(item.id);
      setShowJoinForm(false);
      onUpdate();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Не удалось отказаться');
    } finally {
      setContributing(false);
    }
  };

  return (
    <li className="public-card">
      {item.imageUrl && (
        <div className="public-card__img-wrap">
          <img src={item.imageUrl} alt="" className="public-card__img" />
        </div>
      )}
      <div className="public-card__body">
        <span className="public-card__title">{item.title}</span>
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="public-card__link">
            Ссылка на товар
          </a>
        )}
        {item.price != null && !hasTarget && (
          <span className="public-card__price">
            {item.price} {currencySym}
          </span>
        )}

        {showProgressOrJoin && (
          <>
            <div className="public-card__progress">
              <div className="public-card__progress-bar">
                <div
                  className="public-card__progress-fill"
                  style={{ width: `${Math.min(100, (contributed / targetNum) * 100)}%` }}
                />
              </div>
              <span className="public-card__progress-text">
                Собрано {contributed} из {targetNum} {currencySym}
              </span>
              {item.minContribution && (
                <span className="public-card__min">
                  Мин. взнос: {item.minContribution} {currencySym}
                </span>
              )}
            </div>
            {contributions.length > 0 && (
              <div className="public-card__participants">
                <span className="public-card__participants-title">Участники:</span>
                <ul className="public-card__participants-list">
                  {[...contributions]
                    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
                    .map((c) => (
                      <li key={c.id}>
                        {c.displayName ?? 'Участник'}: {c.amount} {currencySym}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </>
        )}

        {!hasTarget && isReserved && item.reservation && (
          <div className="public-card__participants">
            <span className="public-card__participants-title">Участники:</span>
            <ul className="public-card__participants-list">
              <li>{item.reservation.displayName ?? 'Участник'}</li>
            </ul>
          </div>
        )}

        {!isOwner && !isGuest && (
          <div className="public-card__actions">
            {!hasTarget && (
              <>
                {!isReserved && (
                  <button
                    type="button"
                    className="public-card__btn public-card__btn--reserve"
                    onClick={handleReserve}
                    disabled={reserving}
                  >
                    {reserving ? '...' : 'Зарезервировать'}
                  </button>
                )}
                {isReserved && (
                  <div className="public-card__reserved-row">
                    <span className="public-card__reserved">Зарезервировано</span>
                    {item.reservation?.isCurrentUser && (
                      <button
                        type="button"
                        className="public-card__btn public-card__btn--cancel-reserve"
                        onClick={handleCancelReservation}
                        disabled={cancellingReservation}
                      >
                        {cancellingReservation ? '...' : 'Отменить'}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
            {hasTarget && canJoin && (
              <div className="public-card__join">
                {!myContribution && !showJoinForm && (
                  <button
                    type="button"
                    className="public-card__btn public-card__btn--join"
                    onClick={() => setShowJoinForm(true)}
                  >
                    Присоединиться к желанию
                  </button>
                )}
                {(myContribution || showJoinForm) && (
                  <>
                    {myContribution && !showJoinForm && (
                      <div className="public-card__my-contribution">
                        <span>Вы вносите: {myContribution.amount} {currencySym}</span>
                        <div className="public-card__my-contribution-actions">
                          <button
                            type="button"
                            className="public-card__btn public-card__btn--edit-contrib"
                            onClick={() => {
                              setContributeAmount(myContribution.amount);
                              setShowJoinForm(true);
                            }}
                          >
                            Изменить
                          </button>
                          <button
                            type="button"
                            className="public-card__btn public-card__btn--opt-out"
                            onClick={handleRemoveContribution}
                            disabled={contributing}
                          >
                            Отменить
                          </button>
                        </div>
                      </div>
                    )}
                    {showJoinForm && (
                      <form onSubmit={handleContributeSubmit} className="public-card__contribute">
                        <label className="public-card__contribute-label">
                          Сумма ({currencyLabel})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={contributeAmount}
                          onChange={(e) => setContributeAmount(e.target.value)}
                          className="public-card__input"
                        />
                        <div className="public-card__my-contribution-actions">
                          <button
                            type="submit"
                            className="public-card__btn public-card__btn--edit-contrib"
                            disabled={contributing || !contributeAmount.trim()}
                          >
                            {contributing ? '...' : myContribution ? 'Сохранить' : 'Внести'}
                          </button>
                          {myContribution && (
                            <span className="public-card__btn public-card__btn--opt-out public-card__opt-out-placeholder" aria-hidden>
                              Отменить
                            </span>
                          )}
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {error && <p className="public-card__error">{error}</p>}
      </div>
    </li>
  );
}
