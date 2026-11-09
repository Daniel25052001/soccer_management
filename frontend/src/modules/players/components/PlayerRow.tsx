import React, { memo } from 'react';
import { TextField, MenuItem, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { BulkPlayerDto } from '../services/players.service';

interface RowProps {
    index: number;
    player: BulkPlayerDto;
    onChange: (index: number, field: keyof BulkPlayerDto, value: any) => void;
    onRemove: (index: number) => void;
    disableRemove: boolean;
}

const POSITIONS = [
    { value: 'GOALKEEPER', label: 'Portero' },
    { value: 'DEFENDER', label: 'Defensa' },
    { value: 'FULLBACK', label: 'Lateral' },
    { value: 'MIDFIELDER', label: 'Centrocampista' },
    { value: 'FORWARD', label: 'Delantero' },
];

export const PlayerRow: React.FC<RowProps> = memo(({
    index,
    player,
    onChange,
    onRemove,
    disableRemove,
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                mb: 2,
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
                p: 2,
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                flexWrap: { xs: 'wrap', md: 'nowrap' },
            }}
        >
            <TextField
                label="Nombre *"
                size="small"
                value={player.firstName}
                onChange={(e) => onChange(index, 'firstName', e.target.value)}
                sx={{ flex: 2, minWidth: '130px' }}
            />
            <TextField
                label="Apellido *"
                size="small"
                value={player.lastName}
                onChange={(e) => onChange(index, 'lastName', e.target.value)}
                sx={{ flex: 2, minWidth: '130px' }}
            />
            <TextField
                label="Documento *"
                size="small"
                value={player.documentId}
                onChange={(e) => onChange(index, 'documentId', e.target.value)}
                sx={{ flex: 1.5, minWidth: '110px' }}
            />
            <TextField
                label="Dorsal"
                size="small"
                type="number"
                value={player.defaultDorsal || ''}
                onChange={(e) => onChange(index, 'defaultDorsal', e.target.value ? Number(e.target.value) : undefined)}
                sx={{ width: '90px', flexShrink: 0 }}
            />
            <TextField
                select
                label="Posición"
                size="small"
                value={player.position || ''}
                onChange={(e) => onChange(index, 'position', e.target.value)}
                sx={{ width: '160px', flexShrink: 0 }}
            >
                {POSITIONS.map((pos) => (
                    <MenuItem key={pos.value} value={pos.value}>
                        {pos.label}
                    </MenuItem>
                ))}
            </TextField>

            <IconButton
                color="error"
                onClick={() => onRemove(index)}
                disabled={disableRemove}
                sx={{ flexShrink: 0 }}
            >
                <DeleteIcon />
            </IconButton>
        </Box>
    );
});

PlayerRow.displayName = 'PlayerRow';