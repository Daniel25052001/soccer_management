import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    MenuItem,
    Paper,
    Alert,
    Card,
    Avatar,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SecurityIcon from '@mui/icons-material/Security';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { StandingsTable } from '../modules/standings/pages/StandingsTable';
import { getTournaments } from '../modules/tournaments/services/tournaments.service';
import type { Tournament } from '../types';

interface BestDefense {
    teamName: string;
    goalsAgainst: number;
    played: number;
}

interface TopScorer {
    playerId: number;
    playerName: string;
    teamName: string;
    goals: number;
}

export const StandingsPage: React.FC = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournamentId, setSelectedTournamentId] = useState<number | ''>('');
    const [error, setError] = useState<string | null>(null);

    const [bestDefense, setBestDefense] = useState<BestDefense | null>(null);
    const [topScorers, setTopScorers] = useState<TopScorer[]>([]);

    useEffect(() => {
        getTournaments()
            .then((data) => {
                setTournaments(data);
                if (data.length > 0) {
                    setSelectedTournamentId(data[0].id);
                }
            })
            .catch((err) => {
                console.error('Error al cargar torneos:', err);
                setError('No se pudieron cargar los torneos.');
            });
    }, []);

    useEffect(() => {
        if (selectedTournamentId !== '') {
            // Se añadió el prefijo /api/ para que coincida con la ruta global de NestJS
            fetch(`http://localhost:3000/api/standings/${selectedTournamentId}/best-defense`)
                .then((res) => res.json())
                .then((data) => setBestDefense(data))
                .catch(() => setBestDefense(null));

            // Se añadió el prefijo /api/ aquí también
            fetch(`http://localhost:3000/api/standings/${selectedTournamentId}/top-scorers`)
                .then((res) => res.json())
                .then((data) => setTopScorers(data))
                .catch(() => setTopScorers([]));
        }
    }, [selectedTournamentId]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                    GolAdmin PWA
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Tabla de posiciones oficial, valla menos vencida y goleadores del torneo.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper elevation={0} sx={{ p: 2.5, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EmojiEventsIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Seleccionar Torneo:
                    </Typography>
                </Box>
                <TextField
                    select
                    size="small"
                    value={selectedTournamentId}
                    onChange={(e) => setSelectedTournamentId(Number(e.target.value))}
                    sx={{ minWidth: '240px' }}
                >
                    {tournaments.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                            {t.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Paper>

            {selectedTournamentId !== '' ? (
                <>
                    {/* Tarjetas Superiores (Valla y Goleador Líder) */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                        <Card sx={{ flex: 1, display: 'flex', alignItems: 'center', p: 2.5, borderRadius: 3, backgroundColor: 'rgba(25, 118, 210, 0.03)', border: '1px solid', borderColor: 'rgba(25, 118, 210, 0.2)', boxShadow: 'none' }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2.5, width: 52, height: 52, boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.3)' }}>
                                <SecurityIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                                    VALLA MENOS VENCIDA
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    {bestDefense ? bestDefense.teamName : 'Sin datos aún'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Solo <strong>{bestDefense?.goalsAgainst ?? 0} goles</strong> en contra ({bestDefense?.played ?? 0} PJ)
                                </Typography>
                            </Box>
                        </Card>

                        <Card sx={{ flex: 1, display: 'flex', alignItems: 'center', p: 2.5, borderRadius: 3, backgroundColor: 'rgba(46, 125, 50, 0.03)', border: '1px solid', borderColor: 'rgba(46, 125, 50, 0.2)', boxShadow: 'none' }}>
                            <Avatar sx={{ bgcolor: 'success.main', mr: 2.5, width: 52, height: 52, boxShadow: '0px 4px 12px rgba(46, 125, 50, 0.3)' }}>
                                <SportsSoccerIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
                                    LIDER DE GOLEO (BOTA DE ORO)
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                    {topScorers[0] ? topScorers[0].playerName : 'Sin datos aún'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {topScorers[0] ? `${topScorers[0].teamName} - ` : ''}<strong>{topScorers[0]?.goals ?? 0} Goles</strong>
                                </Typography>
                            </Box>
                        </Card>
                    </Box>

                    {/* Tabla de Posiciones Principal */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                            Clasificacion Oficial
                        </Typography>
                        <StandingsTable tournamentId={Number(selectedTournamentId)} />
                    </Box>

                    {/* Top 3 de Goleadores */}
                    {topScorers.length > 0 && (
                        <Box sx={{ mt: 5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                                Top 3 Goleadores del Torneo
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                                {topScorers.map((scorer, index) => (
                                    <Paper
                                        key={scorer.playerId}
                                        elevation={0}
                                        sx={{
                                            flex: 1,
                                            p: 2.5,
                                            borderRadius: 3,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: '#ffffff'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2,
                                                backgroundColor: index === 0 ? '#1976d2' : index === 1 ? '#42a5f5' : '#90caf9',
                                                color: '#ffffff',
                                                fontWeight: 'bold',
                                                flexShrink: 0
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography component="div" variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {scorer.playerName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {scorer.teamName}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right', ml: 1, flexShrink: 0 }}>
                                            <Typography component="span" variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {scorer.goals}
                                            </Typography>
                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                Goles
                                            </Typography>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    )}
                </>
            ) : (
                <Typography align="center" color="text.secondary" sx={{ py: 6 }}>
                    Cargando torneos o no hay torneos disponibles...
                </Typography>
            )}
        </Container>
    );
};

export default StandingsPage;