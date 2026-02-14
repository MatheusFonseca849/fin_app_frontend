'use client'

import { Box, Card, Grid, IconButton, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useState } from "react"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { monthlyBalance, mockExpenses, mockIncome } from "@/app/mock/expenses"


const HistoryPage = () => {

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const rows = [
        ...mockExpenses.map((e) => ({ date: e.date, description: e.description, amount: e.amount, type: 'Despesa' as const })),
        ...mockIncome.map((i) => ({ date: i.date, description: i.description, amount: i.amount, type: 'Receita' as const })),
    ].sort((a, b) => b.date.localeCompare(a.date))

    return (
        <div>
            <Grid container >
                <Grid size={6} sx={{ p: 2 }} spacing={2}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="h4" sx={{ marginBottom: 2}}>Despesas x Receitas</Typography>
                    <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={monthlyBalance}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="despesas" name="Despesas" fill="#fb6c1b" />
                        <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#1fcf25" strokeWidth={2} />
                    </ComposedChart>
                    </ResponsiveContainer>
                </Card>
                </Grid>
                <Grid size={6} sx={{ p: 2 }}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Histórico de Saldo</Typography>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={monthlyBalance}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#1fcf25" fill="#f1fded" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
            </Grid>
            <Grid container>
                <Grid size={12} sx={{ p: 2 }} spacing={2}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h4" sx={{ marginBottom: 2}}>Transações</Typography>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead sx={{ '& .MuiTableCell-head': { backgroundColor: '#63885a', color: 'white' } }}>
                                    <TableRow>
                                        <TableCell><Typography variant="h6">Data</Typography></TableCell>
                                        <TableCell><Typography variant="h6">Descrição</Typography></TableCell>
                                        <TableCell><Typography variant="h6">Valor</Typography></TableCell>
                                        <TableCell><Typography variant="h6">Tipo</Typography></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(row.date + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                                            <TableCell>{row.description}</TableCell>
                                            <TableCell sx={{ color: row.type === 'Despesa' ? 'error.main' : 'success.main' }}>
                                                {row.type === 'Despesa' ? '- ' : '+ '}R$ {row.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell>{row.type}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 2 }}>
                            <IconButton
                                onClick={() => setPage((p) => p - 1)}
                                disabled={page === 0}
                                sx={{ border: '1px solid', borderColor: 'divider' }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="body2">
                                {page + 1} de {Math.ceil(rows.length / rowsPerPage)}
                            </Typography>
                            <IconButton
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= Math.ceil(rows.length / rowsPerPage) - 1}
                                sx={{ border: '1px solid', borderColor: 'divider' }}
                            >
                                <ArrowForwardIcon />
                            </IconButton>
                            <Select
                                value={rowsPerPage}
                                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
                                size="small"
                                sx={{ ml: 2 }}
                            >
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                            </Select>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </div>
    )
}

export default HistoryPage