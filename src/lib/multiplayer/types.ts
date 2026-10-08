export type PlayerNumber = 1 | 2;

export type PlayerStatus = "connected" | "reconnecting" | "disconnected";
export type GamePhase = "lobby" | "playing" | "won";
export type ClueColor = "red" | "blue";

export type PlayerSummary = {
  id: string;
  number: PlayerNumber;
  status: PlayerStatus;
};

export type RoomState = {
  roomCode: string;
  players: PlayerSummary[];
  hostConnected: boolean;
  game: {
    phase: GamePhase;
    attempts: number;
  };
};

export type ClientToServerEvents = {
  "room:create": (ack: (response: CreateRoomResponse) => void) => void;
  "room:join": (
    payload: { roomCode: string; reconnectToken?: string },
    ack: (response: JoinRoomResponse) => void,
  ) => void;
  "host:reconnect": (
    payload: { roomCode: string; reconnectToken: string },
    ack: (response: ReconnectHostResponse) => void,
  ) => void;
  "game:start": (ack: (response: GameCommandResponse) => void) => void;
  "game:submit-code": (
    payload: { code: string },
    ack: (response: SubmitCodeResponse) => void,
  ) => void;
  "game:play-again": (ack: (response: GameCommandResponse) => void) => void;
};

export type ServerToClientEvents = {
  "room:state": (state: RoomState) => void;
  "player:assigned": (assignment: PlayerAssignment) => void;
  "game:private-clue": (clue: { color: ClueColor; number: number }) => void;
  "game:result": (result: { result: "won" | "incorrect"; attempts: number }) => void;
  "server:error": (message: { message: string }) => void;
};

export type CreateRoomResponse =
  | { ok: true; roomCode: string; reconnectToken: string }
  | { ok: false; message: string };

export type JoinRoomResponse =
  | { ok: true; assignment: PlayerAssignment }
  | { ok: false; message: string };

export type ReconnectHostResponse =
  | { ok: true; roomCode: string }
  | { ok: false; message: string };

export type GameCommandResponse =
  | { ok: true }
  | { ok: false; message: string };

export type SubmitCodeResponse =
  | { ok: true; result: "won" | "incorrect"; attempts: number }
  | { ok: false; message: string };

export type PlayerAssignment = {
  playerId: string;
  playerNumber: PlayerNumber;
  roomCode: string;
  reconnectToken: string;
};
