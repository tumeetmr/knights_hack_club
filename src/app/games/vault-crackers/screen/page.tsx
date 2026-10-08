import type { Metadata } from "next";
import { VaultCrackersScreen } from "../_components/screen";

export const metadata: Metadata = {
  title: "Vault Crackers (projector) | Knights Hack Club",
  robots: { index: false },
};

export default function VaultCrackersScreenPage() {
  return <VaultCrackersScreen />;
}
