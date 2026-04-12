import { Delete, Edit } from "@mui/icons-material"
import { Box, Button, Card, Typography } from "@mui/material"

interface CategoryCardProps {
    id: string
    name: string
    type: string
    color: string
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
}

const CategoryCard = ({ id, name, type, color, onEdit, onDelete }: CategoryCardProps) => {
    return (
        <Card variant="outlined" sx={{ padding: 2, width: '100%', maxWidth: '250px', borderWidth: '8px 2px 2px 2px', borderColor: `${color || '#D9D9D9'}` }}>
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2">{type}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <Button size="small" onClick={() => onEdit?.(id)}><Edit /></Button>
                <Button size="small" onClick={() => onDelete?.(id)} color="error"><Delete /></Button>
            </Box>
        </Card>
    )
}

export default CategoryCard