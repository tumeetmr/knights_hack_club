import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getStudent } from "@/lib/auth/session";
import { CtfHeader } from "./_components/header";

export const metadata: Metadata = {
  title: "CTF | Knights Hack Club",
  description: "Capture the flag with Knights Hack Club. Register, solve challenges and climb the leaderboard.",
};

export default async function PlayerLayout({ children }: { children: ReactNode }) {
  const player = await getStudent();
  return (
    <>
      <CtfHeader player={player ? { name: player.name } : null} />
      <main className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4">{children}</main>
    </>
  );
}
