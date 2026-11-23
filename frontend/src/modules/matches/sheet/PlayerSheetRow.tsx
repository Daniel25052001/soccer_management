import React from 'react';
import {
    Box,
    Checkbox,
    IconButton,
    TableCell,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { PlayerSheetRowData } from './matchSheet.types';

export type StatField = 'goals' | 'yellowCards' | 'redCards';

interface PlayerSheetRowProps {
    side: 'home' | 'away';
    player: PlayerSheetRowData;
    onTogglePlayed: (side: 'home' | 'away', playerId: number, checked: boolean) => void;
    onChangeJersey: (side: 'home' | 'away', playerId: number, jerseyNumber: number) => void;
    onStepStat: (side: 'home' | 'away', playerId: number, field: StatField, delta: number) => void;
}

/**
 * Fila memorizada por jugador para mantener el llenado fluido
 * incluso con plantillas amplias en ambos equipos.
 */
export const PlayerSheetRow: React.FC<PlayerSheetRowProps> = React.memo(
    ({ side, player, onTogglePlayed, onChangeJersey, onStepStat }) => {
        const handlePlayedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onTogglePlayed(side, player.playerId, event.target.checked);
        };

        const handleJerseyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const parsed = parseInt(event.target.value, 10);
            onChangeJersey(side, player.playerId, Number.isNaN(parsed) || parsed < 0 ? 0 : parsed);
        };

        return (
            <TableRow
                hover
                sx={{
                    backgroundColor: player.played ? 'rgba(25, 118, 210, 0.05)' : 'inherit',
                }}
            >
                <TableCell padding="checkbox" align="center">
                    <Tooltip title="Marcar si jugó el partido">
                        <Checkbox
                            size="small"
                            checked={player.played}
                            onChange={handlePlayedChange}
                        />
                    </Tooltip>
                </TableCell>

                <TableCell sx={{ width: 68, px: 0.5 }}>
                    <TextField
                        type="number"
                        size="small"
                        value={player.jerseyNumber}
                        onChange={handleJerseyChange}
                        slotProps={{
                            htmlInput: {
                                min: 0,
                                max: 99,
                                style: { textAlign: 'center', padding: '4px 6px' },
                            },
                        }}
                    />
                </TableCell>

                <TableCell sx={{ py: 0.75 }}>
                    <Typography
                        component="div"
                        variant="body2"
                        noWrap
                        sx={{ fontWeight: player.played ? 600 : 400 }}
                    >
                        {player.firstName} {player.lastName}
                    </Typography>
                    <Typography component="div" variant="caption" color="text.secondary">
                        Doc: {player.documentId}
                    </Typography>
                </TableCell>

                <TableCell align="center" sx={{ px: 0.5, width: 92 }}>
                    <CounterCell
                        value={player.goals}
                        onDecrement={() => onStepStat(side, player.playerId, 'goals', -1)}
                        onIncrement={() => onStepStat(side, player.playerId, 'goals', 1)}
                    />
                </TableCell>

                <TableCell align="center" sx={{ px: 0.5, width: 92 }}>
                    <CounterCell
                        value={player.yellowCards}
                        accentColor="#ed6c02"
                        onDecrement={() => onStepStat(side, player.playerId, 'yellowCards', -1)}
                        onIncrement={() => onStepStat(side, player.playerId, 'yellowCards', 1)}
                    />
                </TableCell>

                <TableCell align="center" sx={{ px: 0.5, width: 92 }}>
                    <CounterCell
                        value={player.redCards}
                        accentColor="#d32f2f"
                        onDecrement={() => onStepStat(side, player.playerId, 'redCards', -1)}
                        onIncrement={() => onStepStat(side, player.playerId, 'redCards', 1)}
                    />
                </TableCell>
            </TableRow>
        );
    },
);

interface CounterCellProps {
    value: number;
    accentColor?: string;
    onDecrement: () => void;
    onIncrement: () => void;
}

const CounterCell: React.FC<CounterCellProps> = ({
    value,
    accentColor,
    onDecrement,
    onIncrement,
}) => {
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: value > 0 && accentColor ? accentColor : 'divider',
                borderRadius: 1,
            }}
        >
            <IconButton size="small" onClick={onDecrement} disabled={value <= 0} sx={{ p: 0.25 }}>
                <RemoveIcon fontSize="inherit" />
            </IconButton>
            <Typography
                component="span"
                variant="body2"
                sx={{
                    minWidth: 22,
                    textAlign: 'center',
                    fontWeight: value > 0 ? 700 : 400,
                    color: value > 0 && accentColor ? accentColor : 'text.primary',
                }}
            >
                {value}
            </Typography>
            <IconButton size="small" onClick={onIncrement} sx={{ p: 0.25 }}>
                <AddIcon fontSize="inherit" />
            </IconButton>
        </Box>
    );
};