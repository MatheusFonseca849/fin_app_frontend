import CategoryCard from "@/app/components/CategoryCard"
import { Box, Button, Divider, Typography } from "@mui/material"

const CategoriesPage = () => {
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" fontWeight={600}>Categorias</Typography>
            <Button variant="contained">Adicionar Categoria</Button>
            </Box>
            <Divider />
            <Box>
                <Typography variant="h5" sx={{mt: 2}}>Receitas</Typography>
                <Divider sx={{ mb: 2 }}/>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <CategoryCard name="Salário" type="Receita" color="#1fcf25" />
                    <CategoryCard name="Freelance" type="Receita" color="#1fcf25" />
                    <CategoryCard name="Outros" type="Receita" color="#1fcf25" />
                </Box>
            </Box>
            
            <Box>
                <Typography variant="h5" sx={{mt: 2}}>Despesas</Typography>
                <Divider sx={{ mb: 2 }}/>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <CategoryCard name="Aluguel" type="Despesa" color="#fb6c1b" />
                    <CategoryCard name="Almoço" type="Despesa" color="#fb6c1b" />
                    <CategoryCard name="Outros" type="Despesa" color="#fb6c1b" />
                </Box>
            </Box>
        </Box>
    )
}

export default CategoriesPage