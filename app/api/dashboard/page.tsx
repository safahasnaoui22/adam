import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Tableau de bord
      </h1>
      <p>Bienvenue sur votre tableau de bord de fidélité</p>
    </div>
  )
}