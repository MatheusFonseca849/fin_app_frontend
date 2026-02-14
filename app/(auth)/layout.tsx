import { Grid } from "@mui/material";

const Layout = ({children}: {children: React.ReactNode}) => {
    return (
<Grid container spacing={2} sx={{ backgroundColor: '#f9f9f9', height: '100dvh' }} direction="row">
            <Grid size={6} sx={{ backgroundColor: '#1fcf25' }}>
                
            </Grid>
            <Grid size={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </Grid>
        </Grid>
    )
}

export default Layout