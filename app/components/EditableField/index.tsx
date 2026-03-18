'use client'

import { Box, TextField, Typography, Button } from "@mui/material"
import { useState } from "react"
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import { Cancel } from "@mui/icons-material"

interface EditableFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    validate?: (value: string) => string | null
}

const EditableField = ({ label, value, onChange, validate }: EditableFieldProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const [error, setError] = useState<string | null>(null)

    const handleEdit = () => {
        setDraft(value)
        setError(null)
        setIsEditing(true)
    }

    const handleDraftChange = (newValue: string) => {
        setDraft(newValue)
        if (validate) {
            setError(validate(newValue))
        }
    }

    const handleConfirm = () => {
        if (validate) {
            const err = validate(draft)
            if (err) {
                setError(err)
                return
            }
        }
        onChange(draft)
        setError(null)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setDraft(value)
        setError(null)
        setIsEditing(false)
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{label}:</Typography>
            {isEditing ? (
                <TextField
                    value={draft}
                    onChange={(e) => handleDraftChange(e.target.value)}
                    slotProps={{ htmlInput: { size: draft.length || 1 } }}
                    sx={{ width: 'auto' }}
                    error={!!error}
                    helperText={error}
                />
            ) : (
                <Typography variant="body2">{value}</Typography>
            )}
            {isEditing ? (
                <Box>
                    <Button
                        sx={{
                            borderRadius: 100,
                            width: 32,
                            height: 32,
                            minWidth: 32,
                            padding: 0,
                            backgroundColor: 'background.paper',
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'grey.100' },
                        }}
                        onClick={handleConfirm}
                        disabled={!!error}
                    >
                        <CheckCircleIcon />
                    </Button>
                    <Button
                        sx={{
                            borderRadius: 100,
                            width: 32,
                            height: 32,
                            minWidth: 32,
                            padding: 0,
                            backgroundColor: 'background.paper',
                            color: 'error.main',
                            '&:hover': { backgroundColor: 'grey.100' },
                        }}
                        onClick={handleCancel}
                    >
                        <Cancel />
                    </Button>
                </Box>
            ) : (
                <Button
                    sx={{
                        borderRadius: 100,
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        padding: 0,
                        backgroundColor: 'background.paper',
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'grey.100' },
                    }}
                    onClick={handleEdit}
                >
                    <EditIcon />
                </Button>
            )}
        </Box>
    )
}

export default EditableField
