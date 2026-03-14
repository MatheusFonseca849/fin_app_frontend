'use client'

import { Box, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material"

export interface CategoryFormData {
    name: string
    type: 'credito' | 'debito'
    color: string
}

export const initialCategoryFormData: CategoryFormData = {
    name: '',
    type: 'debito',
    color: '#1976d2',
}

interface AddCategoryProps {
    formData: CategoryFormData
    setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>
}

const AddCategory = ({ formData, setFormData }: AddCategoryProps) => {

    const handleChange = (field: keyof CategoryFormData, value: string) => {
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
                label="Nome"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                fullWidth
                inputProps={{ maxLength: 50 }}
            />

            <Box>
                <TextField
                    label="Cor"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    fullWidth
                    slotProps={{
                        input: {
                            startAdornment: (
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => handleChange('color', e.target.value)}
                                    style={{
                                        width: 36,
                                        height: 36,
                                        padding: 0,
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        marginRight: 8,
                                        background: 'transparent',
                                    }}
                                />
                            ),
                        },
                    }}
                />
            </Box>
        </Stack>
    )
}

export default AddCategory
