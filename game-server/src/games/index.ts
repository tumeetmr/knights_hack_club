import type { GameModule } from "../lib/game-module";
import { vaultCrackers } from "./vault-crackers";

/** Every game the server hosts. Each one gets its own Socket.IO namespace. */
export const games: GameModule[] = [vaultCrackers];
