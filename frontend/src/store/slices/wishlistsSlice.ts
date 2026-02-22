import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { WishlistDto, WishlistItemDto } from '../../api/wishlists';
import { wishlistsApi } from '../../api/wishlists';

interface WishlistsState {
  list: WishlistDto[];
  current: WishlistDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: WishlistsState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

export const fetchMyWishlists = createAsyncThunk(
  'wishlists/fetchMy',
  () => wishlistsApi.getMy().then((r) => r.data)
);

export const fetchWishlist = createAsyncThunk(
  'wishlists/fetchOne',
  (id: string) => wishlistsApi.getOne(id).then((r) => r.data)
);

export const createWishlist = createAsyncThunk(
  'wishlists/create',
  ({ title, description }: { title: string; description?: string }) =>
    wishlistsApi.create(title, description).then((r) => r.data)
);

export const updateWishlist = createAsyncThunk(
  'wishlists/update',
  ({ id, data }: { id: string; data: { title?: string; description?: string | null } }) =>
    wishlistsApi.update(id, data).then((r) => r.data)
);

export const deleteWishlist = createAsyncThunk(
  'wishlists/delete',
  (id: string) => wishlistsApi.delete(id).then(() => id)
);

export const addItem = createAsyncThunk(
  'wishlists/addItem',
  ({ wishlistId, data }: { wishlistId: string; data: Partial<WishlistItemDto> }) =>
    wishlistsApi.addItem(wishlistId, data).then((r) => ({ item: r.data, wishlistId }))
);

export const updateItem = createAsyncThunk(
  'wishlists/updateItem',
  ({ itemId, data }: { itemId: string; data: Partial<WishlistItemDto> }) =>
    wishlistsApi.updateItem(itemId, data).then((r) => r.data)
);

export const deleteItem = createAsyncThunk(
  'wishlists/deleteItem',
  (itemId: string) => wishlistsApi.deleteItem(itemId).then(() => itemId)
);

const wishlistsSlice = createSlice({
  name: 'wishlists',
  initialState,
  reducers: {
    setCurrent: (state, action: { payload: WishlistDto | null }) => {
      state.current = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyWishlists.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchMyWishlists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyWishlists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки';
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.current = action.payload;
        const idx = state.list.findIndex((w) => w.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки';
      })
      .addCase(createWishlist.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(createWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка создания';
      })
      .addCase(updateWishlist.fulfilled, (state, action) => {
        const idx = state.list.findIndex((w) => w.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка обновления';
      })
      .addCase(deleteWishlist.fulfilled, (state, action) => {
        state.list = state.list.filter((w) => w.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка удаления';
      })
      .addCase(addItem.fulfilled, (state, action) => {
        const { item, wishlistId } = action.payload;
        if (state.current?.id === wishlistId) {
          if (!state.current.items) state.current.items = [];
          state.current.items.push(item);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка добавления';
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const item = action.payload;
        if (state.current?.items) {
          const idx = state.current.items.findIndex((i) => i.id === item.id);
          if (idx >= 0) state.current.items[idx] = item;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка обновления';
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        if (state.current?.items) {
          state.current.items = state.current.items.filter((i) => i.id !== action.payload);
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка удаления';
      });
  },
});

export const { setCurrent, clearError } = wishlistsSlice.actions;
export default wishlistsSlice.reducer;
