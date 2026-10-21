import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';

interface ConfirmDeleteDialogProps {
    open: boolean;
    title: string;
    description: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * Modal de confirmación para acciones destructivas (eliminación de registros).
 * 
 * @param {ConfirmDeleteDialogProps} props Propiedades del componente.
 * @returns {JSX.Element} Componente Modal.
 */
export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
    open,
    title,
    description,
    loading = false,
    onClose,
    onConfirm,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={loading}>
                    Cancelar
                </Button>
                <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
                    {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};