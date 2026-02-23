'use client'

import { Checkbox, Collapse, FormControl, FormControlLabel, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material"

export interface TransactionFormData {
    description: string
    value: string
    type: 'credito' | 'debito'
    category: string
    isRecurrent: boolean
    billingDay: string
}

export const initialTransactionFormData: TransactionFormData = {
    description: '',
    value: '',
    type: 'debito',
    category: '',
    isRecurrent: false,
    billingDay: ''
}

interface AddTransactionProps {
    formData: TransactionFormData
    setFormData: React.Dispatch<React.SetStateAction<TransactionFormData>>
    categories: string[]
}

const AddTransaction = ({ formData, setFormData, categories }: AddTransactionProps) => {

    const handleChange = (field: keyof TransactionFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <Stack spacing={3} sx={{ mt: 2 }}>
            <ToggleButtonGroup
                value={formData.type}
                exclusive
                onChange={(_, value) => value && handleChange('type', value)}
                fullWidth
                color={formData.type === 'credito' ? 'success' : 'error'}
            >
                <ToggleButton value="debito">Despesa</ToggleButton>
                <ToggleButton value="credito">Receita</ToggleButton>
            </ToggleButtonGroup>

            <TextField
                label="Descrição"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                fullWidth
                inputProps={{ maxLength: 500 }}
            />

            <TextField
                label="Valor"
                value={formData.value}
                onChange={(e) => {
                    const val = e.target.value
                    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                        handleChange('value', val)
                    }
                }}
                required
                fullWidth
                type="text"
                inputMode="decimal"
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>
                    }
                }}
            />

            <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                    value={formData.category}
                    label="Categoria"
                    onChange={(e) => handleChange('category', e.target.value)}
                >
                    {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={formData.isRecurrent}
                        onChange={(e) => {
                            handleChange('isRecurrent', e.target.checked)
                            if (!e.target.checked) handleChange('billingDay', '')
                        }}
                    />
                }
                label="Transação recorrente"
            />

            <Collapse in={formData.isRecurrent}>
                <TextField
                    label="Dia de cobrança"
                    value={formData.billingDay}
                    onChange={(e) => {
                        const val = e.target.value
                        if (val === '' || (/^\d{1,2}$/.test(val) && Number(val) >= 1 && Number(val) <= 31)) {
                            handleChange('billingDay', val)
                        }
                    }}
                    required={formData.isRecurrent}
                    fullWidth
                    type="text"
                    inputMode="numeric"
                    helperText="Dia do mês (1-31)"
                />
            </Collapse>
        </Stack>
    )
}

export default AddTransaction