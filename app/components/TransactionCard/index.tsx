import { Card, Typography } from "@mui/material"

const TransactionCard = ({description, amount, category, date}: {description: string, amount: number, category: string, date: string}) => {
    return(
        <Card variant="outlined" sx={{ padding: 2, width: '100%' }}>
            <Typography>{description}</Typography>
            <Typography>{amount}</Typography>
            <Typography>{category}</Typography>
            <Typography>{date}</Typography>
        </Card>
    )
}

export default TransactionCard