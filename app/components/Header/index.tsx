'use client'

import { AppBar, Avatar, Box, CircularProgress, Divider, IconButton, InputAdornment, TextField, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useCallback, useState } from "react";
import { useTheme } from "@mui/material/styles";
import DrawerMenu from "@/app/components/DrawerMenu";
import UserMenuPopover from "@/app/components/UserMenuPopover";
import { useAuth } from '@/lib/contexts/AuthContext';
import { useDashboard } from '@/lib/contexts/DashboardContext';
import { usersApi } from "@/lib/api";

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface StatItemProps {
    label: string;
    value: string;
    color?: string;
    action?: React.ReactNode;
}

const StatItem = ({ label, value, color, action }: StatItemProps) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                {label}
            </Typography>
            {action}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: color ?? 'inherit', whiteSpace: 'nowrap' }}>
            {value}
        </Typography>
    </Box>
);

const Header = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const { user, patchUser } = useAuth();
    const { data: dashboardData } = useDashboard();
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';

    // Balance editing state
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [balanceInput, setBalanceInput] = useState('');
    const [isSavingBalance, setIsSavingBalance] = useState(false);

    const userBalance = (user?.balance ?? 0) / 100;
    const monthlyDebitExpenses = (dashboardData?.monthlyDebitExpenses ?? 0) / 100;
    const monthlyCreditCardTotal = (dashboardData?.monthlyCreditCardTotal ?? 0) / 100;
    const monthlyExpensesTotal = (dashboardData?.monthlyExpensesTotal ?? 0) / 100;
    const monthlyIncomeTotal = (dashboardData?.monthlyIncome ?? 0) / 100;
    const monthlyBalance = (dashboardData?.monthlyBalance ?? 0) / 100;
    const pendingExpensesTotal = (dashboardData?.pendingExpensesTotal ?? 0) / 100;
    const pendingExpensesCount = dashboardData?.pendingExpensesCount ?? 0;
    const monthlyRecurringExpenses = (dashboardData?.monthlyRecurringExpenses ?? 0) / 100;
    const savingsRate = monthlyIncomeTotal > 0
        ? `${((monthlyBalance / monthlyIncomeTotal) * 100).toFixed(1)}%`
        : monthlyExpensesTotal > 0 ? '-100.0%' : '\u2014';

    const handleEditBalance = useCallback(() => {
        setBalanceInput(userBalance.toFixed(2).replace('.', ','));
        setIsEditingBalance(true);
    }, [userBalance]);

    const handleCancelBalance = useCallback(() => {
        setIsEditingBalance(false);
        setBalanceInput('');
    }, []);

    const handleSaveBalance = useCallback(async () => {
        const parsed = parseFloat(balanceInput.replace(/\./g, '').replace(',', '.'));
        if (isNaN(parsed)) return;
        setIsSavingBalance(true);
        try {
            const { balance } = await usersApi.setBalance(Math.round(parsed * 100));
            patchUser({ balance });
            setIsEditingBalance(false);
        } catch (error) {
            console.error('Failed to update balance:', error);
        } finally {
            setIsSavingBalance(false);
        }
    }, [balanceInput, patchUser]);

    return (
        <>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ gap: 1 }}>
                    <IconButton
                        edge="start"
                        aria-label="menu"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        sx={{ color: isLight ? theme.palette.grey[50] : theme.palette.secondary.main }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Financial stats strip */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', gap: { xs: 0.5, md: 1.5 }, overflow: 'hidden' }}>

                        {/* GROUP 1: Account overview */}
                        {isEditingBalance ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TextField
                                    size="small"
                                    value={balanceInput}
                                    onChange={(e) => setBalanceInput(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                            sx: { color: '#fff', '& .MuiInputAdornment-root': { color: 'rgba(255,255,255,0.7)' } },
                                        },
                                    }}
                                    sx={{ width: 140, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' } }}
                                    disabled={isSavingBalance}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveBalance();
                                        if (e.key === 'Escape') handleCancelBalance();
                                    }}
                                />
                                <IconButton size="small" onClick={handleSaveBalance} disabled={isSavingBalance} sx={{ color: '#fff' }}>
                                    {isSavingBalance ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckIcon fontSize="small" />}
                                </IconButton>
                                <IconButton size="small" onClick={handleCancelBalance} disabled={isSavingBalance} sx={{ color: '#fff' }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ) : (
                            <StatItem
                                label="Saldo Total"
                                value={fmt(userBalance)}
                                action={
                                    <IconButton size="small" onClick={handleEditBalance} sx={{ color: 'rgba(255,255,255,0.7)', p: 0.25 }} aria-label="editar saldo">
                                        <EditIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                }
                            />
                        )}

                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

                        <StatItem label="Débito/Pix" value={fmt(monthlyDebitExpenses)} />

                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

                        <StatItem label="Fatura CC" value={fmt(monthlyCreditCardTotal)} color={theme.palette.secondary.main} />

                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />

                        {/* GROUP 2: Monthly summary */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', letterSpacing: 1, mb: 0.25 }}>
                                RESUMO
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
                                <StatItem label="Despesas Totais" value={fmt(monthlyExpensesTotal)} color={theme.palette.error.light} />
                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                                <StatItem label="Receitas no mês" value={fmt(monthlyIncomeTotal)} color="#82E0AA" />
                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                                <StatItem
                                    label="Balanço Mensal"
                                    value={fmt(monthlyBalance)}
                                    color={monthlyBalance >= 0 ? '#82E0AA' : theme.palette.error.light}
                                />
                            </Box>
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.3)' }} />

                        {/* GROUP 3: Indicators */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', letterSpacing: 1, mb: 0.25 }}>
                                INDICADORES
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
                                <StatItem
                                    label="Desp. Pendentes"
                                    value={`${pendingExpensesCount} (${fmt(pendingExpensesTotal)})`}
                                    color="#FFD700"
                                />
                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                                <StatItem
                                    label="Economia"
                                    value={savingsRate}
                                    color={monthlyBalance >= 0 ? '#82E0AA' : theme.palette.error.light}
                                />
                                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                                <StatItem label="Desp. Recorrentes" value={fmt(monthlyRecurringExpenses)} color="#B0BEC5" />
                            </Box>
                        </Box>
                    </Box>

                    {/* Avatar */}
                    <Avatar
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                        src={user?.avatarUrl || ''}
                        alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                        sx={{ cursor: 'pointer' }}
                    />
                </Toolbar>
            </AppBar>
            <Toolbar />
            <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <UserMenuPopover anchorEl={menuAnchor} onClose={() => setMenuAnchor(null)} />
        </>
    )
}

export default Header