import type { Metadata } from "next";
import { JoinQr } from "@/app/games/_components/join-qr";
import { contestStatus } from "@/lib/ctf/contest";
import { getStudent } from "@/lib/auth/session";
import { countPlayers, getContest, getLeaderboard } from "@/lib/ctf/queries";
import { LiveLeaderboard } from "./live-leaderboard";

export const metadata: Metadata = { title: "Leaderboard | Knights Hack CTF" };

export default async function LeaderboardPage() {
  const [player, contest, rows, registered] = await Promise.all([
    getStudent(),
    getContest(),
    getLeaderboard(100),
    countPlayers(),
  ]);

  return (
    <LiveLeaderboard
      initial={{
        status: contestStatus(contest),
        registered,
        rows: rows.map(({ playerId, name, score, solved }) => ({ playerId, name, score, solved })),
      }}
      me={player?.id ?? null}
      qr={<JoinQr path="/ctf" size={240} />}
    />
  );
}
