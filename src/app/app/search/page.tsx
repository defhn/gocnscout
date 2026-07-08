import { DatabasePageLink } from "./search-link";

export default function AppSearchPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-slate-950">Search</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Use the database search page to filter suppliers. Paid account features such as website access, saving, and exports
        are handled from dashboard actions and API routes.
      </p>
      <h2 className="mt-8 text-lg font-semibold text-slate-950">Search database</h2>
      <h3 className="mt-3 text-sm font-semibold text-slate-950">Public fields only</h3>
      <p className="mt-2 text-sm text-slate-600">Search results never reveal private contact fields.</p>
      <DatabasePageLink />
    </section>
  );
}
