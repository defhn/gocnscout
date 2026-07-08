import { Card, CardContent } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getPlan } from "@/config/plans";
import { requireAppUser } from "@/server/auth";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireAppUser();
  const plan = getPlan(user.planCode);

  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">Billing</h1>
      <p className="mt-2 text-sm text-slate-600">Manage subscription checkout and billing status.</p>
      <Card className="mt-6">
        <CardContent>
          <h2 className="text-base font-semibold text-slate-950">Current plan</h2>
          <h3 className="mt-2 text-sm font-normal text-slate-600">{plan.name} · {user.subscriptionStatus}</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/pricing">Change plan</ButtonLink>
            <ButtonLink href="/api/billing/portal" variant="outline">Open billing portal</ButtonLink>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
