import type { Metadata } from "next";
import { VaultCrackersPlayer } from "./_components/player";

export const metadata: Metadata = {
  title: "Vault Crackers | Knights Hack Club",
  description: "Crack code vaults with your crew. Every phone holds part of the program. No coding experience needed.",
};

export default function VaultCrackersPage() {
  return <VaultCrackersPlayer />;
}
