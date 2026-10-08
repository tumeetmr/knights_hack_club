import type { Namespace } from "socket.io";
import { VAULT_CRACKERS_NAMESPACE } from "../../../../shared/games/vault-crackers";
import type { GameModule } from "../../lib/game-module";
import { VaultCrackers } from "./game";

export const vaultCrackers: GameModule = {
  namespace: VAULT_CRACKERS_NAMESPACE,
  register(nsp: Namespace) {
    const game = new VaultCrackers(nsp);
    nsp.on("connection", (socket) => game.connect(socket));
  },
};
