'use client'

import { Card, Grid, List, ListItem, Typography } from "@mui/material"
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis } from "recharts"
import { expensesByCategory } from "@/app/mock/expenses"
import TransactionCard from "@/app/components/TransactionCard"
import { mockExpenses } from "@/app/mock/expenses"

const Dashboard = () => {

    return (
        <div>
            <Grid container direction="row">
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Saldo Total</Typography>
                        <Typography variant="h4">R$ 0,00</Typography>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Próximas Despesas</Typography>
                        <List>
                            {mockExpenses.filter((e) => !e.isPaid).slice(0, 4).map((expense) => (
                                <ListItem key={expense.id}>
                                    <TransactionCard description={expense.description} amount={expense.amount} category={expense.category} date={expense.date} color={expense.color} />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Grid>
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Total em despesas no mês:</Typography>
                        <Typography variant="h4">R$ 0,00</Typography>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ textAlign: 'left', width: '100%' }}>Despesas por Categoria</Typography>
                        <ResponsiveContainer width="100%" height={450}>
                            <PieChart width={400} height={400}>
                                <Pie data={expensesByCategory} dataKey="value" nameKey="name" />
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
                <Grid size={4}>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h6">Total em receitas no mês:</Typography>
                        <Typography variant="h4">R$ 0,00</Typography>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ textAlign: 'left', width: '100%' }}>Despesas por Categoria</Typography>
                        <ResponsiveContainer width="100%" height={450}>
                            <BarChart width={400} height={400} data={expensesByCategory} layout="vertical">
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={100} />
                                <Bar dataKey="value" name="value" />
                                <Tooltip />
                                {/* <Legend /> */}
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card variant="outlined" sx={{ padding: 2, m: 2 }}>
                        <Typography variant="h5">Balanço do mês</Typography>
                        <Typography variant="h3">R$ 0,00</Typography>
                    </Card>
                </Grid>
                
            </Grid>
        </div>
    )
}

export default Dashboard