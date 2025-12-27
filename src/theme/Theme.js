// src/theme/theme.js
export const commonGradient = {
  colors: ['#9D2828', '#191919'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
};

export const lightTheme = {
  mode: 'light',
  background: '#9D2828',

  card: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#555555',

  sectionTitle: '#000000',
  greetingText: '#FFFFFF',

  menuTitle: '#700101',
};

export const darkTheme = {
  mode: 'dark',
  background: '#9D2828', // biarkan sama

  card: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',

  sectionTitle: '#FFFFFF',
  greetingText: '#FFFFFF',

  menuTitle: '#FFB3B3',
};
