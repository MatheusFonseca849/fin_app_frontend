import { Card, Typography } from "@mui/material"

const CategoryCard = ({name, type, color}: {name: string, type: string, color: string}) => {
    return (
        <Card  variant="outlined" sx={{ padding: 2, width: '100%', maxWidth: '250px', borderWidth: '8px 2px 2px 2px', borderColor: `${color || '#D9D9D9'}` }}>
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body2">{type}</Typography>
        </Card>
    )
}

export default CategoryCard