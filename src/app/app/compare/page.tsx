import { Card, CardContent } from "@/components/ui/card";

export default function ComparePage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">Supplier comparison</h1>
      <p className="mt-2 text-sm text-slate-600">Compare saved suppliers by public profile fields.</p>
      <Card className="mt-6">
        <CardContent>
          <h2 className="text-base font-semibold text-slate-950">Comparison workspace</h2>
          <h3 className="mt-2 text-sm font-normal text-slate-600">Select suppliers from saved lists after data import and list actions are available.</h3>
        </CardContent>
      </Card>
    </section>
  );
}
