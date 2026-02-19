import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import wishlistsReducer from './slices/wishlistsSlice';
import publicWishlistReducer from './slices/publicWishlistSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlists: wishlistsReducer,
    publicWishlist: publicWishlistReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export { useAppDispatch, useAppSelector } from './hooks';
