import api from './client';

export type ItemCurrency = 'RUB' | 'USD';

export interface ContributionDto {
  id: string;
  amount: string;
  userId?: string;
  displayName?: string;
}

export interface WishlistItemDto {
  id: string;
  wishlistId: string;
  title: string;
  link: string | null;
  price: string | null;
  currency: string | null;
  targetAmount: string | null;
  minContribution: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isReserved?: boolean;
  contributedTotal?: number;
  reservations?: { id: string; isCurrentUser?: boolean; displayName?: string }[];
  contributions?: ContributionDto[];
  myContribution?: { id: string; amount: string } | null;
}

export interface WishlistDto {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  shareToken: string;
  items?: WishlistItemDto[];
  ownerDisplayName?: string;
}

export const wishlistsApi = {
  getMy: () => api.get<WishlistDto[]>('/wishlists'),
  getOne: (id: string) => api.get<WishlistDto>(`/wishlists/${id}`),
  create: (title: string, description?: string) =>
    api.post<WishlistDto>('/wishlists', { title, description }),
  update: (id: string, data: { title?: string; description?: string | null }) =>
    api.put<WishlistDto>(`/wishlists/${id}`, data),
  delete: (id: string) => api.delete(`/wishlists/${id}`),

  addItem: (wishlistId: string, data: Partial<WishlistItemDto>) =>
    api.post<WishlistItemDto>(`/wishlists/${wishlistId}/items`, data),
  updateItem: (itemId: string, data: Partial<WishlistItemDto>) =>
    api.put<WishlistItemDto>(`/wishlists/items/${itemId}`, data),
  deleteItem: (itemId: string) => api.delete(`/wishlists/items/${itemId}`),

  reserve: (itemId: string, note?: string) =>
    api.post(`/wishlists/items/${itemId}/reserve`, { note }),
  cancelReservation: (itemId: string) =>
    api.delete(`/wishlists/items/${itemId}/reserve`),
  contribute: (itemId: string, amount: string) =>
    api.post(`/wishlists/items/${itemId}/contribute`, { amount }),
  updateContribution: (itemId: string, amount: string) =>
    api.put(`/wishlists/items/${itemId}/contribute`, { amount }),
  removeContribution: (itemId: string) =>
    api.delete(`/wishlists/items/${itemId}/contribute`),
};

export const publicWishlistApi = {
  getByToken: (token: string) =>
    api.get<{ found: boolean; isOwner?: boolean; wishlist?: WishlistDto }>(`/w/${token}`),
};
