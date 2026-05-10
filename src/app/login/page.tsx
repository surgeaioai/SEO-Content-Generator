import Link from "next/link";
import { Globe } from "lucide-react";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";

async function actionGoogle(callbackUrl: string) {
  "use server";
  await signIn("google", { redirectTo: callbackUrl });
}

async function actionGithub(callbackUrl: string) {
  "use server";
  await signIn("github", { redirectTo: callbackUrl });
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.callbackUrl;
  const callbackUrl =
    raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  const session = await auth();
  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-[#0F172A]">Sign in</h1>
        <p className="mt-2 text-center text-sm text-[#64748B]">
          Continue to SEO Pro to run SERP analysis and generate content.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <form action={actionGoogle.bind(null, callbackUrl)}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-medium text-[#0F172A] transition hover:bg-[#F8FAFC]"
            >
              <Globe className="h-5 w-5" aria-hidden />
              Continue with Google
            </button>
          </form>

          <form action={actionGithub.bind(null, callbackUrl)}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#0F172A] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1e293b]"
            >
              Continue with GitHub
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-[#94A3B8]">
          Configure Google/GitHub OAuth keys in your environment to enable sign-in.
        </p>

        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-indigo-600 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
