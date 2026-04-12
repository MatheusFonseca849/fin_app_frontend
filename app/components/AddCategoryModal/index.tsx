'use client'

import { useState } from 'react'
import { Box, Chip, IconButton, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

export interface CategoryFormData {
    name: string
    type: 'credito' | 'debito'
    color: string
    keywords: string[]
}

export const initialCategoryFormData: CategoryFormData = {
    name: '',
    type: 'debito',
    color: '#1976d2',
    keywords: [],
}

interface AddCategoryProps {
    formData: CategoryFormData
    setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>
}

const AddCategory = ({ formData, setFormData }: AddCategoryProps) => {
    const [keywordInput, setKeywordInput] = useState('')

    const handleChange = (field: keyof CategoryFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleAddKeyword = () => {
        const trimmed = keywordInput.trim()
        if (!trimmed) return
        if (formData.keywords.includes(trimmed)) {
            setKeywordInput('')
            return
        }
        if (formData.keywords.length >= 50) return
        setFormData(prev => ({ ...prev, keywords: [...prev.keywords, trimmed] }))
        setKeywordInput('')
    }

    const handleRemoveKeyword = (kw: string) => {
        setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }))
    }

    const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddKeyword()
        }
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

            <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Palavras-chave (para importação CSV)</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                        size="small"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeywordKeyDown}
                        placeholder="Adicionar palavra-chave"
                        fullWidth
                        inputProps={{ maxLength: 100 }}
                    />
                    <IconButton onClick={handleAddKeyword} color="primary" size="small">
                        <AddCircleOutlineIcon />
                    </IconButton>
                </Stack>
                {formData.keywords.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {formData.keywords.map(kw => (
                            <Chip
                                key={kw}
                                label={kw}
                                size="small"
                                onDelete={() => handleRemoveKeyword(kw)}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Stack>
    )
}

export default AddCategory
