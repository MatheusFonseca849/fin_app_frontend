'use client'

import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface PaletteColor {
    hover?: string
  }
  interface SimplePaletteColorOptions {
    hover?: string
  }
}

const theme = createTheme({
  palette: {
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
      default: '#ffffff',
      paper: '#ffffff',
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
          color: '#63885a',
          backgroundColor: '#def8d6',
          '&:hover': {
            borderColor: '#4e6d48',
            backgroundColor: '#c8eebe',
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
})

export default theme
