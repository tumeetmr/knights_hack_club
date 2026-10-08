// Games listed on /games. Each one has a phone page at /games/<slug> and a projector page at
// /games/<slug>/screen, backed by a namespace on the game server (game-server/).

export type GameInfo = {
  slug: string;
  title: string;
  emoji: string;
  tagline: string;
  description: string;
  players: string;
  topics: string[];
};

export const games: GameInfo[] = [
  {
    slug: "vault-crackers",
    title: "Vault Crackers",
    emoji: "🔐",
    tagline: "Split the code. Crack the vault.",
    description:
      "Every phone in your crew holds a few lines of a tiny program. Talk it through, work out what it prints, and the vault pops open. Drop in anytime: no coding experience needed.",
    players: "1–4 per crew, any number of crews",
    topics: ["Variables", "Loops", "If / else", "AI neurons"],
  },
];
