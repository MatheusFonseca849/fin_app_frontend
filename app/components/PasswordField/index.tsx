'use client'

import { useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import type { TextFieldProps } from '@mui/material'

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'slotProps'>

const PasswordField = (props: PasswordFieldProps) => {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <TextField
            {...props}
            type={isVisible ? 'text' : 'password'}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setIsVisible(v => !v)} edge="end">
                                {isVisible ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    )
}

export default PasswordField
