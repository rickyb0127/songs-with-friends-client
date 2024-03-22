export interface User {
  id: string;
  displayName: string;
  isHost: boolean;
}

export interface PendingGame {
  id: string,
  roomCode: string,
  players: User[]
}

export interface Game {
  id: string,
  roomCode: string,
  musicGenre: string,
  userScores: UserScore[],
  numRounds: number,
  currentRound: number | null,
  rounds: Round[],
  roundStatus: RoundStatus,
  playlist: SongData[],
  isGameOver: boolean
}

export interface CurrentGameState {
  gameId: string,
  roomCode: string,
  musicGenre: string,
  userScores: UserScore[],
  currentRound: number | null,
  currentRoundStatus: RoundStatus,
  currentAudioSrc: string | null,
  isGameOver: boolean
}

export interface Round {
  roundNum: number,
  currentGuessPhase: number,
  playerIdsGuessed: string[],
  correctGuessPlayerId: string | null,
  isRoundOver: boolean
}

export interface UserScore {
  userId: string,
  userName: string,
  isHost: boolean,
  totalScore: number,
  buzzedInTimestamp: number | null
}

export interface SongData {
  name: string,
  albumName: string,
  artistName: string,
  releaseDate: string,
  img: string,
  musicSample: string
}

export enum RoundStatus {
  WAITING_START = "WAITING_START",
  STARTED = "STARTED",
  PAUSED = "PAUSED",
  RESUMED = "RESUMED",
  PHASE_ENDED = "PHASE_ENDED",
  ENDED = "ENDED"
}

export interface AvailableCategory {
  name: string,
  maxPlaylistLength: number
}

export enum AudioElementActions {
  PLAY = "PLAY",
  PAUSE = "PAUSE"
}