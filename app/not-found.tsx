import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
      <Link href="/" className="mt-4 inline-block text-sm text-accent hover:underline">Back to the dashboard</Link>
    </div>
  );
}
