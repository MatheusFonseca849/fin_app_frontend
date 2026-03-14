'use client';

import Header from "@/app/components/Header";
import FabMenu from "@/app/components/FabMenu";
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { CircularProgress, Box } from "@mui/material";

const MainLayout = ({children}: {children: React.ReactNode}) => {
    const { isLoading, isAuthenticated } = useRequireAuth({ redirectTo: '/login' });

    if (isLoading || !isAuthenticated) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <Header />
            {children}
            <FabMenu />
        </div>
    )
}

export default MainLayout