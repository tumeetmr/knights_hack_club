import type { VaultKind } from "../../../../shared/games/vault-crackers";

// Every vault is a tiny Python program. The crew splits its lines between phones, talks it
// through, and types what it prints. Numbers are random, so neighbouring crews can't copy.

export type Puzzle = {
  kind: VaultKind;
  title: string;
  lines: string[];
  answer: number;
  concept: string;
  explanation: string;
  hint: string;
};

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const shuffle = <T>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const generators: Record<VaultKind, () => Puzzle> = {
  variables: () => {
    const a = rand(2, 9);
    const b = rand(2, 9);
    const m = rand(2, 4);
    return {
      kind: "variables",
      title: "The Variable Vault",
      lines: [`a = ${a}`, `b = ${b}`, "c = a + b", `print(c * ${m})`],
      answer: (a + b) * m,
      concept: "Variables",
      explanation:
        "A variable is a named box that holds a value. `c = a + b` looks inside a and b, adds them, and stores the result in c.",
      hint: "Work top to bottom and keep track of what's inside each box.",
    };
  },

  update: () => {
    const start = rand(3, 9);
    const add = rand(2, 6);
    const mul = rand(2, 3);
    return {
      kind: "update",
      title: "The Coin Safe",
      lines: [`coins = ${start}`, `coins = coins + ${add}`, `coins = coins * ${mul}`, "print(coins)"],
      answer: (start + add) * mul,
      concept: "Updating variables",
      explanation:
        "In code, `=` means \"store\", not \"equals\". `coins = coins + 3` takes the old value, adds 3, and puts the result back in the box.",
      hint: "Each line changes coins. Always use the value from the line before.",
    };
  },

  "if-else": () => {
    const temp = rand(15, 35);
    let limit = rand(20, 30);
    if (limit === temp) limit += 1;
    const hi = rand(3, 5);
    const lo = rand(1, 2);
    return {
      kind: "if-else",
      title: "The Thermostat Lock",
      lines: [
        `temp = ${temp}`,
        `if temp > ${limit}:`,
        `    fans = ${hi}`,
        "else:",
        `    fans = ${lo}`,
        "print(fans * 10)",
      ],
      answer: (temp > limit ? hi : lo) * 10,
      concept: "If / else",
      explanation:
        "Programs make decisions. Only one branch runs: the `if` branch when the condition is true, otherwise the `else` branch.",
      hint: "First decide whether temp is bigger than the number on the `if` line. Only that branch runs.",
    };
  },

  loop: () => {
    const start = rand(0, 5);
    const times = rand(3, 6);
    const step = rand(2, 5);
    return {
      kind: "loop",
      title: "The Loop Locker",
      lines: [`total = ${start}`, `for i in range(${times}):`, `    total = total + ${step}`, "print(total)"],
      answer: start + times * step,
      concept: "Loops",
      explanation: `\`for i in range(${times})\` repeats the indented line ${times} times. Loops let computers do the boring, repetitive work for us.`,
      hint: "range(N) repeats the indented line exactly N times.",
    };
  },

  neuron: () => {
    const weight = rand(2, 5);
    const bias = rand(1, 9);
    const x = rand(2, 6);
    return {
      kind: "neuron",
      title: "The Neuron Safe",
      lines: [
        "# one neuron of an AI",
        `weight = ${weight}`,
        `bias = ${bias}`,
        `x = ${x}`,
        "output = weight * x + bias",
        "print(output)",
      ],
      answer: weight * x + bias,
      concept: "AI neurons",
      explanation:
        "You just ran a neuron, the building block of neural networks: input × weight + bias. Real AI models add an activation step, connect millions of these, and learn good weights from data.",
      hint: "Multiply first, then add the bias.",
    };
  },

  function: () => {
    const k = rand(2, 3);
    const s = rand(2, 5);
    return {
      kind: "function",
      title: "The Function Fortress",
      lines: ["def grow(x):", `    return x * ${k}`, `a = grow(${s})`, "b = grow(a)", "print(a + b)"],
      answer: s * k + s * k * k,
      concept: "Functions",
      explanation:
        "A function is a reusable recipe. `def` writes the recipe once, and `grow(3)` runs it with x = 3 and hands back the result.",
      hint: "Work out a first, then feed a back into grow to get b.",
    };
  },

  "next-word": () => {
    const words = shuffle(["pizza", "robot", "cat", "moon", "music", "coffee"]).slice(0, 4);
    const scores = shuffle([rand(1, 3), rand(4, 5), rand(6, 7), rand(8, 9)]);
    const best = scores.indexOf(Math.max(...scores));
    return {
      kind: "next-word",
      title: "The Chatbot Cache",
      lines: [
        "# how a chatbot picks its next word",
        `words = [${words.map((w) => `"${w}"`).join(", ")}]`,
        `scores = [${scores.join(", ")}]`,
        "best = scores.index(max(scores))",
        "print(best)",
      ],
      answer: best,
      concept: "How chatbots pick words",
      explanation: `A language model gives every possible next word a score, then picks a likely one. Here it's "${words[best]}". Lists count from 0, so the first item is position 0.`,
      hint: "Find the biggest score. Its position is the answer, but counting starts at 0, not 1.",
    };
  },

  "loop-if": () => {
    const end = rand(5, 8);
    const limit = rand(2, end - 2);
    let total = 0;
    for (let n = 1; n <= end; n += 1) if (n > limit) total += n;
    return {
      kind: "loop-if",
      title: "The Filter Vault",
      lines: [
        "total = 0",
        `for n in range(1, ${end + 1}):`,
        `    if n > ${limit}:`,
        "        total = total + n",
        "print(total)",
      ],
      answer: total,
      concept: "Loops + decisions",
      explanation:
        "The loop walks through the numbers one by one, and the `if` filters which ones get added. That combo powers everything from search filters to game logic.",
      hint: `range(1, ${end + 1}) gives 1, 2, … ${end}. Only add the numbers bigger than ${limit}.`,
    };
  },
};

const tiers: VaultKind[][] = [
  ["variables", "update"],
  ["if-else", "loop", "neuron"],
  ["function", "next-word", "loop-if"],
];

/** Vaults 1–2 are warm-ups, 3–5 add decisions and loops, 6+ mix in the harder ones. */
export function makePuzzle(vaultNumber: number, avoid: VaultKind | null): Puzzle {
  const tier = vaultNumber <= 2 ? tiers[0] : vaultNumber <= 5 ? tiers[1] : [...tiers[1], ...tiers[2]];
  const options = tier.filter((kind) => kind !== avoid);
  return generators[options[Math.floor(Math.random() * options.length)]]();
}
