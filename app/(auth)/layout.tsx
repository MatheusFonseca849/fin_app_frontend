'use client';

import { Grid, CircularProgress } from "@mui/material";
import { useRedirectAuth } from '@/lib/hooks/useRedirectAuth';
import { useEffect, useState } from 'react';

const Layout = ({children}: {children: React.ReactNode}) => {
    const { isLoading, isAuthenticated } = useRedirectAuth({ redirectTo: '/main' });
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (!isLoading) setInitialLoading(false);
    }, [isLoading]);

    return (
        <Grid container spacing={2} sx={{ backgroundColor: '#f9f9f9', height: '100dvh' }} direction="row">
            <Grid size={6} sx={{ backgroundColor: '#1fcf25' }}>
                
            </Grid>
            <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initialLoading || isAuthenticated ? (
                    <CircularProgress />
                ) : (
                    children
                )}
            </Grid>
        </Grid>
    )
}

export default Layout