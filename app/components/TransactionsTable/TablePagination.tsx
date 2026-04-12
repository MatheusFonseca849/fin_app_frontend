'use client'

import { Box, IconButton, MenuItem, Select, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

interface TablePaginationProps {
    page: number
    totalPages: number
    rowsPerPage: number
    onPageChange: (page: number) => void
    onRowsPerPageChange: (rowsPerPage: number) => void
}

const TablePagination = ({
    page,
    totalPages,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
}: TablePaginationProps) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 2 }}>
            <IconButton
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                sx={{ border: '1px solid', borderColor: 'divider' }}
            >
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2">
                {page + 1} de {totalPages}
            </Typography>
            <IconButton
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
                sx={{ border: '1px solid', borderColor: 'divider' }}
            >
                <ArrowForwardIcon />
            </IconButton>
            <Select
                value={rowsPerPage}
                onChange={(e) => { onRowsPerPageChange(Number(e.target.value)); onPageChange(0) }}
                size="small"
                sx={{ ml: 2 }}
            >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
            </Select>
        </Box>
    )
}

export default TablePagination
