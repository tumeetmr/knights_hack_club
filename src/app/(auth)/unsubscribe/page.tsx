import type { Metadata } from "next";
import Link from "next/link";
import { AuthPanel, submitBtn } from "@/components/auth/auth-panel";
import { DISCORD_URL } from "@/lib/links";
import { getSubscription } from "@/lib/newsletter/subscription";
import { verifyUnsubscribe } from "@/lib/newsletter/unsubscribe";
import { setSubscriptionAction } from "@/lib/newsletter/unsubscribe-actions";

export const metadata: Metadata = { title: "Email preferences | Knights Hack Club", robots: { index: false } };

// The email links here instead of unsubscribing on GET, so link scanners can't opt people out.
export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const { u, t } = await searchParams;
  const id = verifyUnsubscribe(u, t);
  const sub = id ? await getSubscription(id) : null;

  if (!id || !sub) {
    return (
      <AuthPanel
        eyebrow="> knights --unsubscribe"
        title="Link expired."
        footer={<Link href="/" className="underline underline-offset-4 hover:text-knight-300">Back to the site</Link>}
      >
        <p className="text-center">
          This unsubscribe link isn&apos;t valid. Use the link at the bottom of the latest club email.
        </p>
      </AuthPanel>
    );
  }

  const subscribed = !sub.unsubscribedAt;
  return (
    <AuthPanel
      eyebrow="> knights --unsubscribe"
      title={subscribed ? "Club emails." : "You're out."}
      intro={
        <p className="text-center text-white/75">
          {subscribed ? "Club updates go to " : "We won't send club updates to "}
          <strong className="break-all text-white">{sub.email}</strong>
          {subscribed
            ? ": what's happening and what's coming up, a couple of times a month at most."
            : " anymore. Account emails like sign-in codes still arrive."}
        </p>
      }
      footer={
        <>
          You can always catch updates on{" "}
          <a href={DISCORD_URL} className="font-medium text-white underline underline-offset-4 hover:text-knight-300">
            our Discord
          </a>
          .
        </>
      }
    >
      <form action={setSubscriptionAction} className="grid gap-3">
        <input type="hidden" name="u" value={id} />
        <input type="hidden" name="t" value={String(t)} />
        <input type="hidden" name="subscribe" value={subscribed ? "0" : "1"} />
        <button type="submit" className={submitBtn}>
          {subscribed ? "Unsubscribe from club updates" : "Resubscribe"}
        </button>
      </form>
    </AuthPanel>
  );
}
