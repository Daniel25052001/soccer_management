import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crea un nuevo equipo en el sistema.
   */
  async create(createTeamDto: CreateTeamDto) {
    if (createTeamDto.tournamentId) {
      await this.verifyTournamentExists(Number(createTeamDto.tournamentId));
    }

    return this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        delegateName: createTeamDto.delegateName || null,
        delegatePhone: createTeamDto.delegatePhone || null,
        tournamentId: createTeamDto.tournamentId
          ? Number(createTeamDto.tournamentId)
          : null,
      },
      include: {
        tournament: true,
      },
    });
  }

  /**
   * Obtiene todos los equipos con su torneo asociado.
   */
  async findAll() {
    return this.prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        tournament: true,
      },
    });
  }

  /**
   * Obtiene un equipo por su ID numérico.
   */
  async findOne(id: number) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('El ID del equipo debe ser un número válido.');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: numericId },
      include: {
        tournament: true,
        players: true,
      },
    });

    if (!team) {
      throw new NotFoundException(`El equipo con ID ${numericId} no existe.`);
    }

    return team;
  }

  /**
   * Actualiza la información de un equipo.
   */
  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const numericId = Number(id);
    await this.findOne(numericId);

    if (updateTeamDto.tournamentId) {
      await this.verifyTournamentExists(Number(updateTeamDto.tournamentId));
    }

    try {
      return await this.prisma.team.update({
        where: { id: numericId },
        data: {
          ...(updateTeamDto.name && { name: updateTeamDto.name }),
          ...(updateTeamDto.delegateName !== undefined && {
            delegateName: updateTeamDto.delegateName || null,
          }),
          ...(updateTeamDto.delegatePhone !== undefined && {
            delegatePhone: updateTeamDto.delegatePhone || null,
          }),
          ...(updateTeamDto.tournamentId !== undefined && {
            tournamentId: updateTeamDto.tournamentId
              ? Number(updateTeamDto.tournamentId)
              : null,
          }),
        },
        include: {
          tournament: true,
        },
      });
    } catch (error) {
      console.error('Error en TeamsService.update:', error);
      throw new InternalServerErrorException('Error al actualizar la información del equipo.');
    }
  }

  /**
   * Elimina un equipo por su ID manejando restricciones de clave foránea.
   */
  async remove(id: number) {
    const numericId = Number(id);
    await this.findOne(numericId);

    try {
      return await this.prisma.team.delete({
        where: { id: numericId },
      });
    } catch (error: any) {
      console.error('Error en TeamsService.remove:', error);

      // P2003 = Restricción de clave foránea en Prisma (jugadores, partidos o eventos asociados)
      if (error?.code === 'P2003') {
        throw new BadRequestException(
          'No se puede eliminar el equipo porque tiene jugadores, partidos o registros asociados en el torneo.'
        );
      }

      throw new InternalServerErrorException(
        'No se pudo eliminar el equipo seleccionado.'
      );
    }
  }

  /**
   * Auxiliar: Valida que el torneo exista antes de asociarlo a un equipo.
   */
  private async verifyTournamentExists(tournamentId: number): Promise<void> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: Number(tournamentId) },
    });

    if (!tournament) {
      throw new NotFoundException(`El torneo con ID ${tournamentId} no existe.`);
    }
  }
}