import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-[#0F172A]">Authentication error</h1>
        <p className="mt-3 text-sm text-[#64748B]">
          Sign-in could not be completed. Check your OAuth configuration and try again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
