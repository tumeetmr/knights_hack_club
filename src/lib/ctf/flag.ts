const WORDS = [
  "brave", "knight", "castle", "shield", "banner", "dragon", "quest", "forge",
  "falcon", "lantern", "sword", "tower", "crown", "ember", "raven", "oak",
];

const pick = <T,>(list: T[]) => list[crypto.getRandomValues(new Uint32Array(1))[0] % list.length];

/** A readable random flag like KH{brave_falcon_3fa9c1}. Safe on server and client. */
export function generateFlag(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(3)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  return `KH{${pick(WORDS)}_${pick(WORDS)}_${hex}}`;
}

export const FLAG_PATTERN = /^KH\{[^\s{}]{3,100}\}$/;
