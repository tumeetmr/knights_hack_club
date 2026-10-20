import { requireAdmin } from "@/lib/ctf/session";
import { AdminShell, PageHeader } from "../_components/shell";
import { AvailabilityForm } from "./availability-form";

export default async function AvailabilityPage() {
  await requireAdmin();

  return (
    <AdminShell>
      <PageHeader
        title="Availability email"
        description={
          <>
            Tell members there are no events before midterms, the next one is the week after reading week, and ask
            them to fill in your availability form. Paste your member list, then copy the email for each person and send it from your own mailbox.
          </>
        }
      />
      <AvailabilityForm />
    </AdminShell>
  );
}
