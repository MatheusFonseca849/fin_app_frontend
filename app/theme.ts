'use client'

import { createTheme, type PaletteMode } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface PaletteColor {
    hover?: string
  }
  interface SimplePaletteColorOptions {
    hover?: string
  }
}

export function getTheme(mode: PaletteMode) {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#63885a',
      },
      secondary: {
        main: '#1FCF25',
      },
      error: {
        main: '#fa2408',
        light: '#fa2408',
        dark: '#c00000',
        hover: '#ec0e0e'
      },
      grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
      background: {
        default: isLight ? '#ffffff' : '#121212',
        paper: isLight ? '#ffffff' : '#1e1e1e',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          contained: {
            backgroundColor: '#63885a',
            '&:hover': {
              backgroundColor: '#4e6d48',
            },
          },
          outlined: {
            borderColor: '#63885a',
            color: isLight ? '#63885a' : '#8fbf84',
            backgroundColor: isLight ? '#def8d6' : 'rgba(99, 136, 90, 0.15)',
            '&:hover': {
              borderColor: '#4e6d48',
              backgroundColor: isLight ? '#c8eebe' : 'rgba(99, 136, 90, 0.25)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: '#63885a',
          },
        },
      },
    },
  });
}

const theme = getTheme('light');
export default theme
