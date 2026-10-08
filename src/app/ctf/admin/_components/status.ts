import { formatContestTime, type ContestStatus } from "@/lib/ctf/contest";

type Contest = { startAt: Date | null; endAt: Date | null };

/** Contest state as a badge plus one sentence saying what players can do right now. */
export function describeStatus(status: ContestStatus, c: Contest) {
  switch (status) {
    case "upcoming":
      return {
        label: "Upcoming",
        badge: "bg-knight-50 text-knight-900 ring-knight-500/30",
        text: `Challenges unlock ${formatContestTime(c.startAt)}, and players can register now.`,
      };
    case "live":
      return {
        label: "Live",
        badge: "bg-green-100 text-green-900 ring-green-700/20",
        text: c.endAt
          ? `Until ${formatContestTime(c.endAt)}, players can see challenges and submit flags.`
          : "Players can see challenges and submit flags. No end time is set.",
      };
    case "paused":
      return {
        label: "Closed",
        badge: "bg-amber-100 text-amber-900 ring-amber-700/20",
        text: "Players can't see challenges or submit flags until you reopen it.",
      };
    case "ended":
      return {
        label: "Ended",
        badge: "bg-ink text-white ring-ink",
        text: `Ended ${formatContestTime(c.endAt)}, so flags aren't accepted anymore. Challenges are still visible.`,
      };
  }
}
