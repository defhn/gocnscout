import { ButtonLink } from "@/components/ui/button";

export function PublicAuthActions() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <ButtonLink href="/sign-in" variant="ghost" className="font-semibold">
        Sign In
      </ButtonLink>
      <ButtonLink
        href="/app"
        variant="outline"
        className="border-teal-200 bg-teal-50 !text-teal-800 hover:border-teal-300 hover:bg-teal-100 font-semibold"
      >
        Dashboard
      </ButtonLink>
    </div>
  );
}
