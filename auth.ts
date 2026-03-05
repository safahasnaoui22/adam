import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const owner = await prisma.owner.findUnique({
          where: { email: credentials.email },
        })

        if (!owner) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          owner.password
        )

        if (!isValid) return null

        return {
          id: owner.id,
          email: owner.email,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
})