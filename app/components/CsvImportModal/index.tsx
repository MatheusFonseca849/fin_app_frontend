'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { transactionsApi } from '@/lib/api';
import type {
  BankOption,
  ImportPreviewRow,
  ImportConfirmTransaction,
  ImportResult,
  CustomMapping,
} from '@/lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { extractErrorMessage } from '@/lib/utils/extractError';
import { useCategories } from '@/lib/contexts/CategoriesContext';
import { List, type RowComponentProps } from 'react-window';

type Step = 'select' | 'mapping' | 'preview';

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  creditCardOnly?: boolean;
}

const modalBoxSx = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '95%', md: 1200 },
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column',
};

const ROW_HEIGHT = 52;

interface PreviewRowProps {
  rows: ImportPreviewRow[];
  updateRow: (index: number, field: keyof ImportPreviewRow, value: string | number | boolean) => void;
  updateRowCategory: (index: number, categoryId: string) => void;
  deleteRow: (index: number) => void;
  categoryOptions: { _id: string; name: string; type: string }[];
}

const PreviewRowRenderer = ({ index, style, rows, updateRow, updateRowCategory, deleteRow, categoryOptions }: RowComponentProps<PreviewRowProps>) => {
  const row = rows[index];

  return (
    <Box
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: index % 2 === 0 ? 'transparent' : 'action.hover',
      }}
    >
      <Box sx={{ width: 145, flexShrink: 0 }}>
        <TextField
          type="date"
          size="small"
          value={row.date}
          onChange={(e) => updateRow(index, 'date', e.target.value)}
          fullWidth
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 150 }}>
        <TextField
          size="small"
          value={row.description}
          onChange={(e) => updateRow(index, 'description', e.target.value)}
          fullWidth
        />
      </Box>
      <Box sx={{ width: 110, flexShrink: 0 }}>
        <TextField
          size="small"
          type="number"
          value={row.value}
          onChange={(e) => updateRow(index, 'value', parseFloat(e.target.value) || 0)}
          fullWidth
          inputProps={{ step: '0.01', min: '0.01' }}
        />
      </Box>
      <Box sx={{ width: 120, flexShrink: 0 }}>
        <Select
          size="small"
          value={row.type}
          onChange={(e) => updateRow(index, 'type', e.target.value)}
          fullWidth
        >
          <MenuItem value="expense">Despesa</MenuItem>
          <MenuItem value="income">Receita</MenuItem>
        </Select>
      </Box>
      <Box sx={{ width: 170, flexShrink: 0 }}>
        <Select
          size="small"
          value={row.categoryId}
          onChange={(e) => updateRowCategory(index, e.target.value)}
          fullWidth
        >
          {categoryOptions.map(c => (
            <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
          ))}
        </Select>
      </Box>
      <Box sx={{ width: 50, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        <Checkbox
          checked={row.isPaid}
          onChange={(e) => updateRow(index, 'isPaid', e.target.checked)}
          size="small"
        />
      </Box>
      <Box sx={{ width: 40, flexShrink: 0 }}>
        <Button
          size="small"
          color="error"
          onClick={() => deleteRow(index)}
          sx={{ minWidth: 0, px: 1 }}
        >
          ✕
        </Button>
      </Box>
    </Box>
  );
};

const CsvImportModal = ({ open, onClose, creditCardOnly = false }: CsvImportModalProps) => {
  const { patchUser } = useAuth();
  const { categories: allCategories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [step, setStep] = useState<Step>('select');

  // Step 1: Bank selection + file upload
  const [bankOptions, setBankOptions] = useState<BankOption[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  // Step 2: Custom mapping (only when selectedBank === 'custom')
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  // Maps each CSV column to a transaction property (or '' for skip)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [customKeywordCol, setCustomKeywordCol] = useState('');
  const [customDateFormat, setCustomDateFormat] = useState('DD/MM/YYYY');
  const [customValueSigned, setCustomValueSigned] = useState(true);
  const [customSeparator, setCustomSeparator] = useState(',');

  // Transaction properties available for mapping
  const txPropertyOptions = [
    { value: '', label: 'Ignorar' },
    { value: 'date', label: 'Data' },
    { value: 'value', label: 'Valor' },
    { value: 'description', label: 'Descrição' },
  ];

  // Derive assigned columns from the mapping
  const assignedDate = Object.entries(columnMapping).find(([, v]) => v === 'date')?.[0] || '';
  const assignedValue = Object.entries(columnMapping).find(([, v]) => v === 'value')?.[0] || '';
  const assignedDesc = Object.entries(columnMapping).find(([, v]) => v === 'description')?.[0] || '';
  const mappedColumns = csvHeaders.filter(h => columnMapping[h] && columnMapping[h] !== '');
  const canProcessMapping = !!assignedDate && !!assignedValue && !!assignedDesc;

  // Step 3: Preview + edit
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [previewErrors, setPreviewErrors] = useState<string[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Bank label (from preview response, used as source for CC transactions)
  const [bankLabel, setBankLabel] = useState<string | null>(null);

  // Confirm
  const [isConfirming, setIsConfirming] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Category lookup for the preview table dropdown
  const categoryOptions = useMemo(() => {
    return allCategories.map(c => ({ _id: c._id, name: c.name, type: c.type }));
  }, [allCategories]);

  // Load bank options on open
  useEffect(() => {
    if (!open) return;
    setIsLoadingBanks(true);
    transactionsApi.getBankOptions()
      .then(options => {
        const filtered = creditCardOnly
          ? options.filter(o => o.creditCard)
          : options;
        setBankOptions(filtered);
        // Auto-select if only one option
        if (filtered.length === 1) setSelectedBank(filtered[0].key);
      })
      .catch(() => setError('Erro ao carregar opções de banco'))
      .finally(() => setIsLoadingBanks(false));
  }, [open, creditCardOnly]);

  // Reset state on close
  const handleClose = useCallback(() => {
    if (isLoadingPreview || isConfirming) return;
    setStep('select');
    setSelectedBank('');
    setSelectedFile(null);
    setCsvHeaders([]);
    setColumnMapping({});
    setCustomKeywordCol('');
    setCustomDateFormat('DD/MM/YYYY');
    setCustomValueSigned(true);
    setCustomSeparator(',');
    setPreviewRows([]);
    setPreviewErrors([]);
    setBankLabel(null);
    setResult(null);
    setError(null);
    onClose();
  }, [isLoadingPreview, isConfirming, onClose]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    e.target.value = '';
  };

  // Load preview from backend
  const loadPreview = useCallback(async () => {
    if (!selectedFile || !selectedBank) return;
    setIsLoadingPreview(true);
    setError(null);
    setPreviewErrors([]);

    try {
      let customMapping: CustomMapping | undefined;
      if (selectedBank === 'custom') {
        customMapping = {
          columns: {
            date: assignedDate,
            value: assignedValue,
            description: assignedDesc,
          },
          keywordTarget: customKeywordCol || assignedDesc,
          dateFormat: customDateFormat,
          valueSigned: customValueSigned,
          separator: customSeparator,
        };
      }

      const { rows, errors, bankLabel: label } = await transactionsApi.importPreview(
        selectedFile,
        selectedBank,
        customMapping,
      );

      setPreviewRows(rows);
      setPreviewErrors(errors);
      setBankLabel(label ?? null);
      setStep('preview');
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Erro ao processar CSV'));
    } finally {
      setIsLoadingPreview(false);
    }
  }, [selectedFile, selectedBank, assignedDate, assignedValue, assignedDesc, customKeywordCol, customDateFormat, customValueSigned, customSeparator]);

  // Step 1 → Step 2 (custom) or Step 3 (bank preset)
  const handleNext = useCallback(async () => {
    if (!selectedFile || !selectedBank) return;
    setError(null);

    if (selectedBank === 'custom') {
      // Parse headers client-side for custom mapping step
      setIsLoadingPreview(true);
      try {
        const text = await selectedFile.text();
        const firstLine = text.split('\n')[0];
        const sep = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
        setCustomSeparator(sep);
        const headers = firstLine.split(sep).map(h => h.trim().replace(/^"|"$/g, ''));
        setCsvHeaders(headers);
        setStep('mapping');
      } catch {
        setError('Erro ao ler cabeçalhos do CSV');
      } finally {
        setIsLoadingPreview(false);
      }
      return;
    }

    // Bank preset → go straight to preview
    await loadPreview();
  }, [selectedFile, selectedBank, loadPreview]);

  // Step 2 → Step 3 (custom mapping → preview)
  const handleCustomMappingNext = useCallback(async () => {
    if (!canProcessMapping) {
      setError('Mapeie pelo menos as colunas de data, valor e descrição');
      return;
    }
    await loadPreview();
  }, [canProcessMapping, loadPreview]);

  // Update a single column's mapping, ensuring no duplicate assignments
  const handleColumnMappingChange = useCallback((header: string, property: string) => {
    setColumnMapping(prev => {
      const updated = { ...prev };
      // If assigning a non-empty property, clear it from any other column first
      if (property) {
        for (const key of Object.keys(updated)) {
          if (updated[key] === property) {
            updated[key] = '';
          }
        }
      }
      updated[header] = property;
      return updated;
    });
  }, []);

  // Edit a preview row field
  const updateRow = useCallback((index: number, field: keyof ImportPreviewRow, value: string | number | boolean) => {
    setPreviewRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // Change category for a row
  const updateRowCategory = useCallback((index: number, categoryId: string) => {
    const cat = categoryOptions.find(c => c._id === categoryId);
    setPreviewRows(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        categoryId,
        categoryName: cat?.name || 'Sem Categoria',
      };
      return updated;
    });
  }, [categoryOptions]);

  // Delete a row from preview
  const deleteRow = useCallback((index: number) => {
    setPreviewRows(prev => prev.filter((_, i) => i !== index));
  }, []);

  const rowProps = useMemo<PreviewRowProps>(() => ({
    rows: previewRows,
    updateRow,
    updateRowCategory,
    deleteRow,
    categoryOptions,
  }), [previewRows, updateRow, updateRowCategory, deleteRow, categoryOptions]);

  // Confirm import
  const handleConfirm = useCallback(async () => {
    if (previewRows.length === 0) return;
    setIsConfirming(true);
    setError(null);

    try {
      const transactions: ImportConfirmTransaction[] = previewRows.map(row => ({
        description: row.description,
        value: row.value,
        type: row.type,
        paymentMode: row.paymentMode,
        source: row.paymentMode === 'credit' && bankLabel ? bankLabel : undefined,
        categoryId: row.categoryId,
        date: row.timestamp,
        isPaid: row.isPaid,
      }));

      const importResult = await transactionsApi.importConfirm(transactions);
      setResult(importResult);

      if (importResult.createdCount > 0) {
        if (importResult.balance !== undefined) {
          patchUser({ balance: importResult.balance });
        }
        window.dispatchEvent(new Event('transaction-change'));
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Erro ao importar transações'));
    } finally {
      setIsConfirming(false);
    }
  }, [previewRows, patchUser]);

  // Render step title
  const baseTitle = creditCardOnly ? 'Importar Fatura' : 'Importar Extrato';
  const stepTitle = step === 'select'
    ? `${baseTitle} — Selecionar Banco`
    : step === 'mapping'
      ? `${baseTitle} — Mapeamento Customizado`
      : `${baseTitle} — Revisão`;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalBoxSx}>
        {/* Header */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>{stepTitle}</Typography>
        </Box>
        <Divider />

        {/* Content */}
        <Box sx={{ px: 3, py: 2, overflowY: 'auto', flex: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {result && (
            <Alert
              severity={result.errorCount > 0 ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            >
              {result.createdCount} transações importadas
              {result.skippedCount > 0 && `, ${result.skippedCount} duplicadas ignoradas`}
              {result.errorCount > 0 && `, ${result.errorCount} com erro`}
              .
            </Alert>
          )}

          {/* STEP 1: Bank selection + file */}
          {step === 'select' && !result && (
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Banco / Formato</InputLabel>
                <Select
                  value={selectedBank}
                  label="Banco / Formato"
                  onChange={(e) => setSelectedBank(e.target.value)}
                  disabled={isLoadingBanks}
                >
                  {bankOptions.map(opt => (
                    <MenuItem key={opt.key} value={opt.key}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  value={selectedFile?.name || ''}
                  placeholder="Nenhum arquivo selecionado"
                  fullWidth
                  size="small"
                  slotProps={{ input: { readOnly: true } }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <Button
                  variant="contained"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<UploadFileIcon />}
                  sx={{ whiteSpace: 'nowrap', textTransform: 'none' }}
                >
                  Selecionar
                </Button>
              </Stack>
            </Stack>
          )}

          {/* STEP 2: Custom mapping */}
          {step === 'mapping' && (
            <Stack spacing={3}>
              <Typography variant="body2" color="text.secondary">
                Para cada coluna do seu CSV, selecione a propriedade correspondente da transação:
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Coluna do CSV</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Propriedade da Transação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {csvHeaders.map(header => (
                      <TableRow key={header}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{header}</Typography>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 180 }}>
                            <Select
                              value={columnMapping[header] || ''}
                              onChange={(e) => handleColumnMappingChange(header, e.target.value)}
                              displayEmpty
                            >
                              {txPropertyOptions.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider />

              <Typography variant="subtitle2">Opções adicionais</Typography>

              <FormControl fullWidth size="small" disabled={mappedColumns.length === 0}>
                <InputLabel>Coluna para categorização por palavras-chave</InputLabel>
                <Select
                  value={customKeywordCol}
                  label="Coluna para categorização por palavras-chave"
                  onChange={(e) => setCustomKeywordCol(e.target.value)}
                >
                  <MenuItem value="">Mesma da descrição</MenuItem>
                  {mappedColumns.map(h => (
                    <MenuItem key={h} value={h}>{h} ({columnMapping[h]})</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Formato de Data</InputLabel>
                  <Select value={customDateFormat} label="Formato de Data" onChange={(e) => setCustomDateFormat(e.target.value)}>
                    <MenuItem value="DD/MM/YYYY">DD/MM/AAAA</MenuItem>
                    <MenuItem value="YYYY-MM-DD">AAAA-MM-DD</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={customValueSigned}
                      onChange={(e) => setCustomValueSigned(e.target.checked)}
                    />
                  }
                  label="Valor com sinal (negativo = despesa, positivo = receita)"
                />
              </Stack>
            </Stack>
          )}

          {/* STEP 3: Preview table */}
          {step === 'preview' && !result && (
            <>
              {previewErrors.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {previewErrors.length} linha(s) com erro foram ignoradas.
                </Alert>
              )}

              {previewRows.length === 0 ? (
                <Typography color="text.secondary">Nenhuma transação encontrada no arquivo.</Typography>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {previewRows.length} transações encontradas. Revise e edite antes de confirmar.
                  </Typography>
                  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
                      <Typography variant="body2" sx={{ width: 145, flexShrink: 0, fontWeight: 600 }}>Data</Typography>
                      <Typography variant="body2" sx={{ flex: 1, minWidth: 150, fontWeight: 600 }}>Descrição</Typography>
                      <Typography variant="body2" sx={{ width: 110, flexShrink: 0, fontWeight: 600 }}>Valor</Typography>
                      <Typography variant="body2" sx={{ width: 120, flexShrink: 0, fontWeight: 600 }}>Tipo</Typography>
                      <Typography variant="body2" sx={{ width: 170, flexShrink: 0, fontWeight: 600 }}>Categoria</Typography>
                      <Typography variant="body2" sx={{ width: 50, flexShrink: 0, fontWeight: 600, textAlign: 'center' }}>Pago</Typography>
                      <Box sx={{ width: 40, flexShrink: 0 }} />
                    </Box>
                    {/* Virtualized rows */}
                    <List
                      rowComponent={PreviewRowRenderer}
                      rowCount={previewRows.length}
                      rowHeight={ROW_HEIGHT}
                      rowProps={rowProps}
                      style={{ height: Math.min(400, previewRows.length * ROW_HEIGHT) }}
                    />
                  </Box>
                </>
              )}
            </>
          )}
        </Box>

        {/* Footer */}
        <Divider />
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ px: 3, py: 2 }}>
          {/* Back button (step 2 or 3, before result) */}
          {!result && step !== 'select' && (
            <Button
              onClick={() => setStep(step === 'preview' && selectedBank === 'custom' ? 'mapping' : 'select')}
              disabled={isLoadingPreview || isConfirming}
            >
              Voltar
            </Button>
          )}

          <Box sx={{ flex: 1 }} />

          <Button onClick={handleClose} disabled={isLoadingPreview || isConfirming}>
            {result ? 'Fechar' : 'Cancelar'}
          </Button>

          {/* Step 1: Next */}
          {step === 'select' && !result && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!selectedBank || !selectedFile || isLoadingPreview}
            >
              {isLoadingPreview ? <CircularProgress size={24} /> : 'Próximo'}
            </Button>
          )}

          {/* Step 2: Next (custom mapping) */}
          {step === 'mapping' && (
            <Button
              variant="contained"
              onClick={handleCustomMappingNext}
              disabled={!canProcessMapping || isLoadingPreview}
            >
              {isLoadingPreview ? <CircularProgress size={24} /> : 'Processar'}
            </Button>
          )}

          {/* Step 3: Confirm */}
          {step === 'preview' && !result && (
            <Button
              variant="contained"
              color="success"
              onClick={handleConfirm}
              disabled={previewRows.length === 0 || isConfirming}
            >
              {isConfirming ? <CircularProgress size={24} /> : `Importar ${previewRows.length} transações`}
            </Button>
          )}
        </Stack>
      </Box>
    </Modal>
  );
};

export default CsvImportModal;
