import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import { getStandings, type TeamStanding } from '../services/standings.service';

interface StandingsTableProps {
    tournamentId: number;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ tournamentId }) => {
    const [standings, setStandings] = useState<TeamStanding[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStandings = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getStandings(tournamentId);
                setStandings(data);
            } catch (err: any) {
                console.error('Error al cargar la tabla de posiciones:', err);
                setError('No se pudo cargar la tabla de posiciones.');
            } finally {
                setLoading(false);
            }
        };

        if (tournamentId) {
            fetchStandings();
        }
    }, [tournamentId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (standings.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                Aún no hay partidos finalizados para calcular la tabla de posiciones.
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
            <Table size="small">
                <TableHead sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                    <TableRow>
                        <TableCell align="center"><b>#</b></TableCell>
                        <TableCell><b>Equipo</b></TableCell>
                        <TableCell align="center"><b>PTS</b></TableCell>
                        <TableCell align="center"><b>PJ</b></TableCell>
                        <TableCell align="center"><b>PG</b></TableCell>
                        <TableCell align="center"><b>PE</b></TableCell>
                        <TableCell align="center"><b>PP</b></TableCell>
                        <TableCell align="center"><b>GF</b></TableCell>
                        <TableCell align="center"><b>GC</b></TableCell>
                        <TableCell align="center"><b>DIF</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {standings.map((team, index) => {
                        const position = index + 1;
                        const isTopClass = position <= 2; // Ejemplo: resaltar zona de clasificación

                        return (
                            <TableRow key={team.teamId} hover>
                                <TableCell align="center">
                                    <Chip
                                        label={position}
                                        size="small"
                                        color={isTopClass ? 'primary' : 'default'}
                                        variant={isTopClass ? 'filled' : 'outlined'}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{team.teamName}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {team.points}
                                </TableCell>
                                <TableCell align="center">{team.played}</TableCell>
                                <TableCell align="center">{team.won}</TableCell>
                                <TableCell align="center">{team.drawn}</TableCell>
                                <TableCell align="center">{team.lost}</TableCell>
                                <TableCell align="center">{team.goalsFor}</TableCell>
                                <TableCell align="center">{team.goalsAgainst}</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};