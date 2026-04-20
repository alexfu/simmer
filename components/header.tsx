import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-5xl items-center px-6 py-4">
        <Link
          href="/"
          className="font-serif text-xl font-bold text-foreground transition-colors hover:text-primary"
        >
          Simmer
        </Link>
      </div>
    </header>
  );
}
