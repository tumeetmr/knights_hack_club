import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  GameCommandResponse,
  PlayerAssignment,
  PlayerNumber,
  PlayerStatus,
  ReconnectHostResponse,
  RoomState,
  ServerToClientEvents,
  SubmitCodeResponse,
} from "./types";

type MultiplayerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type MultiplayerServer = Server<ClientToServerEvents, ServerToClientEvents>;

type PlayerRecord = {
  id: string;
  number: PlayerNumber;
  reconnectToken: string;
  socketId: string | null;
  status: PlayerStatus;
  disconnectTimer: NodeJS.Timeout | null;
};

type Room = {
  code: string;
  hostSocketId: string | null;
  hostReconnectToken: string;
  hostDisconnectTimer: NodeJS.Timeout | null;
  players: Map<string, PlayerRecord>;
  game: {
    phase: "lobby" | "playing" | "won";
    redNumber: number | null;
    blueNumber: number | null;
    correctCode: string | null;
    attempts: number;
  };
};

type SocketIdentity =
  | { role: "host"; roomCode: string }
  | { role: "player"; roomCode: string; playerId: string };

const MAX_PLAYERS = 2;
const PLAYER_RECONNECT_GRACE_MS = 15_000;
const HOST_RECONNECT_GRACE_MS = 60_000;
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const token = () => crypto.randomUUID();

const makeRoomCode = () =>
  Array.from({ length: 4 }, () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]).join("");

export class RoomManager {
  private readonly rooms = new Map<string, Room>();

  constructor(private readonly io: MultiplayerServer) {}

  createRoom(socket: MultiplayerSocket): { roomCode: string; reconnectToken: string } {
    let roomCode = makeRoomCode();
    while (this.rooms.has(roomCode)) roomCode = makeRoomCode();

    const room: Room = {
      code: roomCode,
      hostSocketId: socket.id,
      hostReconnectToken: token(),
      hostDisconnectTimer: null,
      players: new Map(),
      game: {
        phase: "lobby",
        redNumber: null,
        blueNumber: null,
        correctCode: null,
        attempts: 0,
      },
    };
    this.rooms.set(roomCode, room);
    socket.join(this.roomName(roomCode));
    socket.data.identity = { role: "host", roomCode } satisfies SocketIdentity;
    this.emitRoomState(room);
    return { roomCode, reconnectToken: room.hostReconnectToken };
  }

  joinRoom(
    socket: MultiplayerSocket,
    roomCodeInput: string,
    reconnectToken?: string,
  ): { assignment: PlayerAssignment } | { message: string } {
    const roomCode = roomCodeInput.trim().toUpperCase();
    const room = this.rooms.get(roomCode);
    if (!room) return { message: "That game room does not exist." };
    if (!room.hostSocketId) return { message: "The host is reconnecting. Try again shortly." };

    const existingPlayer = [...room.players.values()].find(
      (player) => player.reconnectToken === reconnectToken,
    );
    if (existingPlayer) {
      this.clearPlayerTimer(existingPlayer);
      existingPlayer.socketId = socket.id;
      existingPlayer.status = "connected";
      socket.join(this.roomName(roomCode));
      socket.data.identity = {
        role: "player",
        roomCode,
        playerId: existingPlayer.id,
      } satisfies SocketIdentity;
      const assignment = this.assignmentFor(room, existingPlayer);
      socket.emit("player:assigned", assignment);
      this.emitPrivateClue(room, existingPlayer);
      this.emitRoomState(room);
      return { assignment };
    }

    if (room.players.size >= MAX_PLAYERS) {
      return { message: "This game is full. Only 2 players are allowed." };
    }

    const player: PlayerRecord = {
      id: token(),
      number: this.nextPlayerNumber(room),
      reconnectToken: token(),
      socketId: socket.id,
      status: "connected",
      disconnectTimer: null,
    };
    room.players.set(player.id, player);
    socket.join(this.roomName(roomCode));
    socket.data.identity = { role: "player", roomCode, playerId: player.id } satisfies SocketIdentity;

    const assignment = this.assignmentFor(room, player);
    socket.emit("player:assigned", assignment);
    this.emitRoomState(room);
    return { assignment };
  }

  reconnectHost(
    socket: MultiplayerSocket,
    roomCodeInput: string,
    reconnectToken: string,
  ): ReconnectHostResponse {
    const roomCode = roomCodeInput.trim().toUpperCase();
    const room = this.rooms.get(roomCode);
    if (!room || room.hostReconnectToken !== reconnectToken) {
      return { ok: false, message: "That host session is no longer available." };
    }

    if (room.hostDisconnectTimer) clearTimeout(room.hostDisconnectTimer);
    room.hostDisconnectTimer = null;
    room.hostSocketId = socket.id;
    socket.join(this.roomName(roomCode));
    socket.data.identity = { role: "host", roomCode } satisfies SocketIdentity;
    this.emitRoomState(room);
    return { ok: true, roomCode };
  }

  startGame(socket: MultiplayerSocket): GameCommandResponse {
    const room = this.hostRoomFor(socket);
    if (!room) return { ok: false, message: "Only the host can start the game." };
    if (room.game.phase !== "lobby") return { ok: false, message: "The game is already in progress." };
    const players = [...room.players.values()];
    if (players.length !== MAX_PLAYERS || players.some((player) => player.status !== "connected")) {
      return { ok: false, message: "Both players must be connected before starting." };
    }

    this.generatePuzzle(room);
    this.emitRoomState(room);
    for (const player of players) this.emitPrivateClue(room, player);
    return { ok: true };
  }

  submitCode(socket: MultiplayerSocket, codeInput: string): SubmitCodeResponse {
    const room = this.hostRoomFor(socket);
    if (!room) return { ok: false, message: "Only the host can submit a code." };
    if (room.game.phase !== "playing" || !room.game.correctCode) {
      return { ok: false, message: "There is no active puzzle." };
    }

    const code = codeInput.trim();
    if (!/^\d{2}$/.test(code)) return { ok: false, message: "Enter a 2-digit code." };
    room.game.attempts += 1;
    const result = code === room.game.correctCode ? "won" : "incorrect";
    if (result === "won") room.game.phase = "won";
    this.emitRoomState(room);
    this.io.to(this.roomName(room.code)).emit("game:result", {
      result,
      attempts: room.game.attempts,
    });
    return { ok: true, result, attempts: room.game.attempts };
  }

  playAgain(socket: MultiplayerSocket): GameCommandResponse {
    const room = this.hostRoomFor(socket);
    if (!room) return { ok: false, message: "Only the host can start another game." };
    if (room.game.phase !== "won") return { ok: false, message: "The current game is not won yet." };
    if ([...room.players.values()].some((player) => player.status !== "connected")) {
      return { ok: false, message: "Both players must be connected before playing again." };
    }

    this.generatePuzzle(room);
    this.emitRoomState(room);
    for (const player of room.players.values()) this.emitPrivateClue(room, player);
    return { ok: true };
  }

  private hostRoomFor(socket: MultiplayerSocket): Room | null {
    const identity = socket.data.identity;
    if (!identity || identity.role !== "host") return null;
    const room = this.rooms.get(identity.roomCode);
    return room?.hostSocketId === socket.id ? room : null;
  }

  disconnect(socket: MultiplayerSocket): void {
    const identity = socket.data.identity;
    if (!identity) return;

    const room = this.rooms.get(identity.roomCode);
    if (!room) return;

    if (identity.role === "host") {
      if (room.hostSocketId !== socket.id) return;
      room.hostSocketId = null;
      room.hostDisconnectTimer = setTimeout(() => this.deleteRoom(room.code), HOST_RECONNECT_GRACE_MS);
      this.emitRoomState(room);
      return;
    }

    const player = room.players.get(identity.playerId);
    if (!player || player.socketId !== socket.id) return;
    player.socketId = null;
    player.status = "reconnecting";
    player.disconnectTimer = setTimeout(() => {
      room.players.delete(player.id);
      this.emitRoomState(room);
    }, PLAYER_RECONNECT_GRACE_MS);
    this.emitRoomState(room);
  }

  private assignmentFor(room: Room, player: PlayerRecord): PlayerAssignment {
    return {
      playerId: player.id,
      playerNumber: player.number,
      roomCode: room.code,
      reconnectToken: player.reconnectToken,
    };
  }

  private emitRoomState(room: Room): void {
    const state: RoomState = {
      roomCode: room.code,
      hostConnected: room.hostSocketId !== null,
      players: [...room.players.values()]
        .sort((a, b) => a.number - b.number)
        .map(({ id, number, status }) => ({ id, number, status })),
      game: {
        phase: room.game.phase,
        attempts: room.game.attempts,
      },
    };
    this.io.to(this.roomName(room.code)).emit("room:state", state);
  }

  private generatePuzzle(room: Room): void {
    const redNumber = this.randomPuzzleNumber();
    const blueNumber = this.randomPuzzleNumber();
    room.game = {
      phase: "playing",
      redNumber,
      blueNumber,
      correctCode: `${redNumber}${blueNumber}`,
      attempts: 0,
    };
  }

  private emitPrivateClue(room: Room, player: PlayerRecord): void {
    if (room.game.phase === "lobby" || player.socketId === null) return;
    const number = player.number === 1 ? room.game.redNumber : room.game.blueNumber;
    if (number === null) return;
    this.io.to(player.socketId).emit("game:private-clue", {
      color: player.number === 1 ? "red" : "blue",
      number,
    });
  }

  private randomPuzzleNumber(): number {
    return Math.floor(Math.random() * 9) + 1;
  }

  private nextPlayerNumber(room: Room): PlayerNumber {
    const used = new Set([...room.players.values()].map((player) => player.number));
    return ([1, 2] as const).find((number) => !used.has(number)) ?? 2;
  }

  private clearPlayerTimer(player: PlayerRecord): void {
    if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
    player.disconnectTimer = null;
  }

  private deleteRoom(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    for (const player of room.players.values()) this.clearPlayerTimer(player);
    if (room.hostDisconnectTimer) clearTimeout(room.hostDisconnectTimer);
    this.rooms.delete(roomCode);
  }

  private roomName(roomCode: string): string {
    return `knights-trial:${roomCode}`;
  }
}
