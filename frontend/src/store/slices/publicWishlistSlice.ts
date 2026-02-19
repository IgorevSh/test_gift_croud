import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { WishlistDto } from '../../api/wishlists';
import { publicWishlistApi } from '../../api/wishlists';

interface PublicWishlistState {
  wishlist: WishlistDto | null;
  isOwner: boolean;
  found: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: PublicWishlistState = {
  wishlist: null,
  isOwner: false,
  found: false,
  loading: false,
  error: null,
};

export const fetchPublicWishlist = createAsyncThunk(
  'publicWishlist/fetch',
  async (token: string) => {
    const { data } = await publicWishlistApi.getByToken(token);
    return data;
  }
);

const publicWishlistSlice = createSlice({
  name: 'publicWishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: { payload: WishlistDto | null }) => {
      state.wishlist = action.payload;
    },
    clear: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicWishlist.fulfilled, (state, action) => {
        state.found = action.payload.found;
        state.isOwner = action.payload.isOwner ?? false;
        state.wishlist = action.payload.wishlist ?? null;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPublicWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicWishlist.rejected, (state, action) => {
        state.loading = false;
        state.found = false;
        state.wishlist = null;
        state.error = action.error.message || 'Ошибка загрузки';
      });
  },
});

export const { setWishlist, clear: clearPublicWishlist } = publicWishlistSlice.actions;
export default publicWishlistSlice.reducer;
