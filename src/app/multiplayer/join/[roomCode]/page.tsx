import { PlayerClient } from "./player-client";

type Props = {
  params: Promise<{ roomCode: string }>;
};

export default async function PlayerPage({ params }: Props) {
  const { roomCode } = await params;
  return <PlayerClient roomCode={roomCode} />;
}
