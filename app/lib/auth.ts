import type { NextAuthOptions, DefaultUser, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { compare } from "bcrypt"
import { prisma } from "@/app/lib/prisma"

// Extend the built-in types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      restaurantId?: string;
      customerId?: string;
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string;
    restaurantId?: string;
    customerId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    restaurantId?: string;
    customerId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    // signUp is NOT a valid option - removed
    error: "/auth/error", // optional
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { 
            restaurant: true,
            customerProfile: true
          },
        })

        if (!user || !user.password) return null

        const validPassword = await compare(credentials.password, user.password)
        if (!validPassword) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurant?.id,
          customerId: user.customerProfile?.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.restaurantId = user.restaurantId
        token.customerId = user.customerId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.restaurantId = token.restaurantId
        session.user.customerId = token.customerId
      }
      return session
    },
  },
}