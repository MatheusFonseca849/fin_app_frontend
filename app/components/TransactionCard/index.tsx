import { Delete, Edit } from "@mui/icons-material"
import { Box, Button, Card, Typography } from "@mui/material"

const TransactionCard = ({description, amount, category, date, color}: {description: string, amount: number, category: string, date: string, color: string}) => {
    return(
        <Card variant="outlined" sx={{ padding: 2, width: '100%', borderWidth: '8px 2px 2px 2px', borderColor: `${color || '#D9D9D9'}` }}>
            <Typography>Descrição: {description}</Typography>
            <Typography>Categoria: {category}</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>Valor: {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
            <Typography sx={{ color: new Date(date) < new Date() ? 'error.main' : 'text.primary' }}>Vencimento: {new Date(date).toLocaleDateString()}</Typography>
            <Box>
                <Button><Edit /></Button>
                <Button><Delete /></Button>
            </Box>
        </Card>
    )
}

export default TransactionCard