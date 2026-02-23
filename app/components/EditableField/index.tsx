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
}

const EditableField = ({ label, value, onChange }: EditableFieldProps) => {
    const [isEditing, setIsEditing] = useState(false)

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{label}:</Typography>
            {isEditing ? (
                <TextField
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    slotProps={{ htmlInput: { size: value.length || 1 } }}
                    sx={{ width: 'auto' }}
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
                onClick={() => setIsEditing(!isEditing)}
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
                onClick={() => setIsEditing(!isEditing)}
            >
                <Cancel />
            </Button>
                </Box> 
            ) : <Button
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
                onClick={() => setIsEditing(!isEditing)}
            ><EditIcon /></Button> }
        </Box>
    )
}

export default EditableField
