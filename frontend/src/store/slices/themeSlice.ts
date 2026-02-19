import { createSlice } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

const stored: Theme = (localStorage.getItem('theme') as Theme) || 'light';
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', stored);
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: stored,
  reducers: {
    toggle: (state) => {
      const next: Theme = state === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    },
  },
});

export const { toggle: toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
