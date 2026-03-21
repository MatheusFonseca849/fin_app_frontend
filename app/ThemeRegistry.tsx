'use client'

import { useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { getTheme } from './theme'
import { useAuth } from '@/lib/contexts/AuthContext'
import { usePreferences } from '@/lib/contexts/PreferencesContext'

const ThemeRegistry = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { themeModeOverride } = usePreferences();
    const mode = themeModeOverride ?? (user?.preferences?.darkMode ? 'dark' : 'light');
    const theme = useMemo(() => getTheme(mode), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}

export default ThemeRegistry
