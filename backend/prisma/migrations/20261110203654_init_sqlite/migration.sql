-- CreateTable
CREATE TABLE "Tournament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tournamentId" INTEGER,
    "name" TEXT NOT NULL,
    "delegateName" TEXT,
    "delegatePhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "defaultDorsal" INTEGER,
    "position" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tournamentId" INTEGER NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "matchDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "homeSubsUsed" INTEGER NOT NULL DEFAULT 0,
    "homeWindowsUsed" INTEGER NOT NULL DEFAULT 0,
    "awaySubsUsed" INTEGER NOT NULL DEFAULT 0,
    "awayWindowsUsed" INTEGER NOT NULL DEFAULT 0,
    "homeArbitragePaid" BOOLEAN NOT NULL DEFAULT false,
    "awayArbitragePaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refereeId" INTEGER,
    CONSTRAINT "Match_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "Referee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchRoster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "jerseyNumber" INTEGER NOT NULL,
    "isStarter" BOOLEAN NOT NULL DEFAULT false,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MatchRoster_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchRoster_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchRoster_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchSubstitution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "playerOutId" INTEGER NOT NULL,
    "playerInId" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "windowNumber" INTEGER NOT NULL,
    "isHalftime" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MatchSubstitution_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchSubstitution_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchSubstitution_playerOutId_fkey" FOREIGN KEY ("playerOutId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchSubstitution_playerInId_fkey" FOREIGN KEY ("playerInId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "minute" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MatchEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchEvent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sanction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "fineAmount" REAL NOT NULL DEFAULT 0.00,
    "isFinePaid" BOOLEAN NOT NULL DEFAULT false,
    "matchesSuspended" INTEGER NOT NULL DEFAULT 0,
    "matchesServed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sanction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sanction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Standing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tournamentId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDifference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Standing_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Standing_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Referee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Team_tournamentId_idx" ON "Team"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_documentId_key" ON "Player"("documentId");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");

-- CreateIndex
CREATE INDEX "MatchRoster_matchId_idx" ON "MatchRoster"("matchId");

-- CreateIndex
CREATE INDEX "MatchRoster_teamId_idx" ON "MatchRoster"("teamId");

-- CreateIndex
CREATE INDEX "MatchRoster_playerId_idx" ON "MatchRoster"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchRoster_matchId_playerId_key" ON "MatchRoster"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "MatchSubstitution_matchId_idx" ON "MatchSubstitution"("matchId");

-- CreateIndex
CREATE INDEX "MatchSubstitution_teamId_idx" ON "MatchSubstitution"("teamId");

-- CreateIndex
CREATE INDEX "MatchSubstitution_playerOutId_idx" ON "MatchSubstitution"("playerOutId");

-- CreateIndex
CREATE INDEX "MatchSubstitution_playerInId_idx" ON "MatchSubstitution"("playerInId");

-- CreateIndex
CREATE INDEX "MatchEvent_matchId_idx" ON "MatchEvent"("matchId");

-- CreateIndex
CREATE INDEX "MatchEvent_teamId_idx" ON "MatchEvent"("teamId");

-- CreateIndex
CREATE INDEX "MatchEvent_playerId_idx" ON "MatchEvent"("playerId");

-- CreateIndex
CREATE INDEX "Sanction_playerId_idx" ON "Sanction"("playerId");

-- CreateIndex
CREATE INDEX "Sanction_matchId_idx" ON "Sanction"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Standing_tournamentId_teamId_key" ON "Standing"("tournamentId", "teamId");
