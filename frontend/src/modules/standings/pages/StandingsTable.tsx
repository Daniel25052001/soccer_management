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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>;
    }

    if (standings.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    textAlign: 'center',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    borderRadius: 4,
                    border: '1px dashed #90caf9'
                }}
            >
                <Typography component="div" variant="body1" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                    ⚽ Aún no hay partidos finalizados para calcular la tabla de posiciones.
                </Typography>
            </Paper>
        );
    }

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0px 6px 24px rgba(25, 118, 210, 0.08)'
            }}
        >
            <Table sx={{ minWidth: 650 }} aria-label="tabla de posiciones moderna">
                <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell align="center" sx={{ color: '#ffffff', fontWeight: 'bold', width: '60px' }}>#</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Equipo</TableCell>
                        <TableCell align="center" sx={{ color: '#ffffff', fontWeight: 'bold' }}>PTS</TableCell>
                        <TableCell align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'medium' }}>PJ</TableCell>
                        <TableCell align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'medium' }}>PG</TableCell>
                        <TableCell align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'medium' }}>PE</TableCell>
                        <TableCell align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'medium' }}>PP</TableCell>
                        <TableCell align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'medium' }}>GF</TableCell>
                        <TableCell align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'medium' }}>GC</TableCell>
                        <TableCell align="center" sx={{ color: '#ffffff', fontWeight: 'bold' }}>DIF</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {standings.map((team, index) => {
                        const position = index + 1;
                        const isTopClass = position <= 2;

                        return (
                            <TableRow
                                key={team.teamId}
                                hover
                                sx={{
                                    backgroundColor: isTopClass ? 'rgba(25, 118, 210, 0.03)' : 'transparent',
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    transition: 'background-color 0.2s ease',
                                }}
                            >
                                <TableCell align="center">
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto',
                                            backgroundColor: position === 1 ? '#1976d2' : position === 2 ? '#42a5f5' : position === 3 ? '#90caf9' : '#f1f5f9',
                                            color: position <= 3 ? '#ffffff' : '#334155',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem',
                                            boxShadow: position <= 3 ? '0px 2px 6px rgba(25, 118, 210, 0.3)' : 'none'
                                        }}
                                    >
                                        {position}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: isTopClass ? 'bold' : 'medium', color: '#1e293b' }}>
                                    {team.teamName}
                                </TableCell>
                                <TableCell align="center">
                                    <Typography component="span" sx={{ fontWeight: 'extrabold', color: 'primary.main', fontSize: '1.05rem' }}>
                                        {team.points}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ color: '#64748b' }}>{team.played}</TableCell>
                                <TableCell align="center" sx={{ color: '#334155' }}>{team.won}</TableCell>
                                <TableCell align="center" sx={{ color: '#334155' }}>{team.drawn}</TableCell>
                                <TableCell align="center" sx={{ color: '#334155' }}>{team.lost}</TableCell>
                                <TableCell align="center" sx={{ color: '#334155' }}>{team.goalsFor}</TableCell>
                                <TableCell align="center" sx={{ color: '#334155' }}>{team.goalsAgainst}</TableCell>
                                <TableCell
                                    align="center"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: team.goalDifference > 0 ? '#2e7d32' : team.goalDifference < 0 ? '#d32f2f' : '#64748b'
                                    }}
                                >
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

export default StandingsTable;