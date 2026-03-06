// app/test-session/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import Link from "next/link";

export default async function TestSessionPage() {
  const session = await getServerSession(authOptions);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Session Test Page</h1>
      <p>This page checks your session without redirecting.</p>
      <hr />
      <h2>Session Data:</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      {session?.user ? (
        <p style={{ color: "green" }}>✅ You are logged in as {session.user.email}</p>
      ) : (
        <p style={{ color: "red" }}>❌ You are not logged in.</p>
      )}
      <Link href="/">Go to Home</Link>
    </div>
  );
}