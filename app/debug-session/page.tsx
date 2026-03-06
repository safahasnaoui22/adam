
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export default async function DebugSessionPage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>🔍 Session Debug</h1>
      <pre style={{ background: "#f4f4f4", padding: "1rem", borderRadius: "5px" }}>
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}