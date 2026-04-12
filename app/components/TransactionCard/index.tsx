import { CheckCircle, Delete, Edit } from "@mui/icons-material"
import { Box, Button, Card, Typography } from "@mui/material"

interface TransactionCardProps {
    id: string
    description: string
    amount: number
    category: string
    date: string
    color: string
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
    onMarkPaid?: (id: string) => void
}

const TransactionCard = ({ id, description, amount, category, date, color, onEdit, onDelete, onMarkPaid }: TransactionCardProps) => {
    return(
        <Card variant="outlined" sx={{ padding: 2, width: '100%', borderWidth: '8px 2px 2px 2px', borderColor: `${color || '#D9D9D9'}` }}>
            <Typography>Descrição: {description}</Typography>
            <Typography>Categoria: {category}</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>Valor: {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
            <Typography sx={{ color: new Date(date) < new Date() ? 'error.main' : 'text.primary' }}>Vencimento: {new Date(date).toLocaleDateString()}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button onClick={() => onEdit?.(id)}><Edit /></Button>
                <Button onClick={() => onDelete?.(id)} color="error"><Delete /></Button>
                {onMarkPaid && (
                    <Button onClick={() => onMarkPaid(id)} color="success" variant="outlined" size="small" startIcon={<CheckCircle />} sx={{ ml: 'auto', textTransform: 'none' }}>
                        Confirmar Pagamento
                    </Button>
                )}
            </Box>
        </Card>
    )
}

export default TransactionCard