import { authOptions } from "@/app/lib/auth"
import { getServerSession } from "next-auth"

import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <div>Dashboard</div>
}