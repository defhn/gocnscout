import { Card, CardContent } from "@/components/ui/card";

export function FaqSection({
  title = "Frequently asked questions",
  items,
}: {
  title?: string;
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.question}>
            <CardContent>
              <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
