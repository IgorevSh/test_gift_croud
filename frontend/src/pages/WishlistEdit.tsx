import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchWishlist,
  updateWishlist,
  deleteWishlist,
  addItem,
  updateItem,
  deleteItem,
  setCurrent,
  clearError,
} from '../store/slices/wishlistsSlice';
import type { WishlistItemDto } from '../api/wishlists';
import './WishlistEdit.scss';

const CURRENCIES: { value: 'RUB' | 'USD'; label: string }[] = [
  { value: 'RUB', label: '₽' },
  { value: 'USD', label: '$' },
];

function CurrencySelect({
  value,
  onChange,
  className,
}: {
  value: 'RUB' | 'USD';
  onChange: (v: 'RUB' | 'USD') => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const label = value === 'USD' ? '$' : '₽';

  return (
    <div className={`currency-select-wrap ${open ? 'is-open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className={className}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Валюта"
      >
        <span className="currency-select__label">{label}</span>
        <span className="currency-select__arrow" aria-hidden />
      </button>
      {open && (
        <ul className="currency-dropdown" role="listbox">
          {CURRENCIES.map((c) => (
            <li
              key={c.value}
              role="option"
              aria-selected={value === c.value}
              className="currency-dropdown__option"
              onClick={() => {
                onChange(c.value);
                setOpen(false);
              }}
            >
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function WishlistEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { current, loading, error } = useAppSelector((s) => s.wishlists);
  const dispatch = useAppDispatch();
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [adding, setAdding] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCurrency, setNewItemCurrency] = useState<'RUB' | 'USD'>('RUB');
  const [copyDone, setCopyDone] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchWishlist(id));
    return () => {
      dispatch(setCurrent(null));
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (current) {
      setEditTitle(current.title);
      setEditDesc(current.description || '');
    }
  }, [current?.id, current?.title, current?.description]);

  const notFound = !current && !loading;
  const failed = !current && !!error;

  if (!id) return <div>123</div>;
  if (loading && !current) return <div className="wishlist-edit-loading">Загрузка...</div>;
  if (notFound || failed) {
    return (
      <div className="wishlist-edit wishlist-edit--empty">
        <div className="wishlist-edit__empty">
          <p className="wishlist-edit__empty-text">Такого списка нет или у вас нет к нему доступа.</p>
          <Link to="/" className="wishlist-edit__empty-link">Вернуться к моим спискам</Link>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/w/${current!.shareToken}`;

  const handleSaveMeta = () => {
    dispatch(updateWishlist({ id: current!.id, data: { title: editTitle, description: editDesc || undefined } }));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || adding) return;
    setAdding(true);
    try {
      await dispatch(
        addItem({
          wishlistId: id,
          data: {
            title: newItemTitle.trim(),
            ...(newItemPrice.trim() && {
              price: newItemPrice.trim(),
              currency: newItemCurrency,
            }),
          },
        }),
      ).unwrap();
      setNewItemTitle('');
      setNewItemPrice('');
      dispatch(fetchWishlist(id));
    } finally {
      setAdding(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  const handleDeleteList = () => {
    if (window.confirm('Удалить этот вишлист?')) {
      dispatch(deleteWishlist(id));
      navigate('/');
    }
  };

  return (
    <div className="wishlist-edit">
      <div className="wishlist-edit__meta">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveMeta}
          className="wishlist-edit__title"
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          onBlur={handleSaveMeta}
          placeholder="Описание (необязательно)"
          className="wishlist-edit__desc"
          rows={2}
        />
      </div>

      <div className="wishlist-edit__share">
        <span className="wishlist-edit__share-label">Поделиться ссылкой:</span>
        <div className="wishlist-edit__share-row">
          <input type="text" readOnly value={shareUrl} className="wishlist-edit__share-input" />
          <button
            type="button"
            className="wishlist-edit__share-btn wishlist-edit__share-btn--icon"
            onClick={handleCopyLink}
            title={copyDone ? 'Скопировано!' : 'Копировать ссылку'}
            aria-label={copyDone ? 'Скопировано!' : 'Копировать ссылку'}
          >
            {copyDone ? (
              <span className="wishlist-edit__share-icon" aria-hidden>✓</span>
            ) : (
              <span className="wishlist-edit__share-icon wishlist-edit__share-icon--copy" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleAddItem} className="wishlist-edit__add">
        <input
          type="text"
          placeholder="Добавить желание (название)*"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          className="wishlist-edit__add-input"
        />
        <input
          type="text"
          placeholder="Сумма"
          value={newItemPrice}
          onChange={(e) => setNewItemPrice(e.target.value)}
          className="wishlist-edit__add-input wishlist-edit__add-input--amount"
          inputMode="decimal"
        />
        <CurrencySelect
          value={newItemCurrency}
          onChange={setNewItemCurrency}
          className="wishlist-edit__add-currency"
        />
        <button type="submit" className="wishlist-edit__add-btn" disabled={adding || !newItemTitle.trim()}>
          Добавить
        </button>
      </form>

      {error && (
        <p className="wishlist-edit__error" onClick={() => dispatch(clearError())}>
          {error}
        </p>
      )}

      <ul className="wishlist-edit__items">
        {(current!.items || []).map((item: WishlistItemDto) => (
          <ItemRow
            key={item.id}
            item={item}
            onUpdate={(data) => dispatch(updateItem({ itemId: item.id, data })).then(() => dispatch(fetchWishlist(id)))}
            onDelete={() => dispatch(deleteItem(item.id)).then(() => dispatch(fetchWishlist(id)))}
            isOwner
          />
        ))}
      </ul>

      <div className="wishlist-edit__delete-wrap">
        <button type="button" className="wishlist-edit__delete" onClick={handleDeleteList}>
          Удалить вишлист
        </button>
      </div>
    </div>
  );
}

function ItemRow({
  item,
  onUpdate,
  onDelete,
  isOwner,
}: {
  item: WishlistItemDto;
  onUpdate: (data: Partial<WishlistItemDto>) => void;
  onDelete: () => void;
  isOwner: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [link, setLink] = useState(item.link || '');
  const [price, setPrice] = useState(item.price || '');
  const [currency, setCurrency] = useState<'RUB' | 'USD'>((item.currency as 'RUB' | 'USD') || 'RUB');
  const [imageUrl, setImageUrl] = useState(item.imageUrl || '');

  const isValidUrl = (s: string) => {
    if (!s.trim()) return true;
    try {
      const u = new URL(s.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const [fieldError, setFieldError] = useState('');

  const save = () => {
    const titleVal = title.trim().slice(0, 100);
    if (!titleVal) {
      setFieldError('Введите название');
      return;
    }
    const linkVal = link.trim();
    const imageVal = imageUrl.trim();
    if (linkVal && !isValidUrl(linkVal)) {
      setFieldError('Введите корректную ссылку (например, https://...)');
      return;
    }
    if (imageVal && !isValidUrl(imageVal)) {
      setFieldError('Введите корректный URL картинки (например, https://...)');
      return;
    }
    setFieldError('');
    const priceVal = price.trim();
    onUpdate({
      title: titleVal,
      link: linkVal || null,
      price: priceVal || null,
      currency: priceVal ? currency : null,
      imageUrl: imageVal || undefined,
    });
    setEditing(false);
  };

  const currencySymbol = (c: string | null) => (c === 'USD' ? '$' : '₽');

  return (
    <li className="item-row">
      {item.imageUrl && (
        <div className="item-row__img-wrap">
          <img src={item.imageUrl} alt="" className="item-row__img" />
        </div>
      )}
      <div className="item-row__body">
        {editing ? (
          <div className="item-row__edit-wrap">
            <div
              className="item-row__edit-backdrop"
              aria-hidden
              onClick={() => { setEditing(false); setFieldError(''); }}
            />
            <div className="item-row__edit-panel" onClick={(e) => e.stopPropagation()}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" className="item-row__input item-row__input--title" maxLength={100} />
              <div className="item-row__edit-row">
                <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Ссылка" className="item-row__input" />
                <div className="item-row__price-edit">
                  <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Сумма" className="item-row__input" />
                  <CurrencySelect
                    value={currency}
                    onChange={setCurrency}
                    className="item-row__currency"
                  />
                </div>
              </div>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL картинки" className="item-row__input" />
              {fieldError && <p className="item-row__field-error" role="alert">{fieldError}</p>}
              <div className="item-row__actions item-row__actions--edit">
                <button type="button" className="item-row__save" onClick={save}>Сохранить</button>
                <button type="button" className="item-row__cancel" onClick={() => { setEditing(false); setFieldError(''); }}>Отмена</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="item-row__head">
              <span className="item-row__title" title={item.title}>
                {item.title.length > 100 ? item.title.slice(0, 100) + '…' : item.title}
              </span>
              {isOwner && (
                <div className="item-row__actions">
                  <button type="button" className="item-row__action item-row__action--edit" onClick={() => { setEditing(true); setFieldError(''); }} aria-label="Изменить" title="Изменить">
                    <span aria-hidden>✎</span>
                  </button>
                  <button type="button" className="item-row__action item-row__action--del" onClick={onDelete} aria-label="Удалить" title="Удалить">
                    <span aria-hidden>🗑</span>
                  </button>
                </div>
              )}
            </div>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-row__link">
                Ссылка
              </a>
            )}
            {item.price && (
              <span className="item-row__price">
                {item.price} {currencySymbol(item.currency)}
              </span>
            )}
            {item.targetAmount && (
              <span className="item-row__target">
                Сбор: {item.contributedTotal ?? 0} / {item.targetAmount} {currencySymbol(item.currency)}
              </span>
            )}
          </>
        )}
      </div>
    </li>
  );
}
