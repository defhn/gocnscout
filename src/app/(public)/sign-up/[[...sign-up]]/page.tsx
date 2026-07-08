import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <section className="container-page py-16">
        <h1 className="text-3xl font-semibold text-slate-950">Sign up</h1>
        <p className="mt-3 text-sm text-slate-600">Clerk is not configured yet. Add Clerk environment variables to enable account creation.</p>
      </section>
    );
  }

  return (
    <section className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <SignUp />
    </section>
  );
}
