import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { compare } from "bcrypt"
import { prisma } from "@/app/lib/prisma"

// Extend the built-in types
declare module "next-auth" {
  interface User {
    role?: string
    restaurantId?: string
    customerId?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role?: string
      restaurantId?: string
      customerId?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
    restaurantId?: string
    customerId?: string
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
    signUp: "/auth/signup",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        console.log("🔐 Authorize attempt for:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { 
            restaurant: true,
            customerProfile: true
          },
        })

        if (!user) {
          console.log("❌ User not found");
          return null
        }

        if (!user.password) {
          console.log("❌ User has no password");
          return null
        }

        console.log("✅ User found:", { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          hasRestaurant: !!user.restaurant,
          hasCustomerProfile: !!user.customerProfile
        });

        const validPassword = await compare(
          credentials.password,
          user.password
        )

        if (!validPassword) {
          console.log("❌ Invalid password");
          return null
        }

        console.log("✅ Password valid, returning user with role:", user.role);

        // Return user object with all necessary fields
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
      console.log("🔧 JWT Callback - User present:", !!user);
      if (user) {
        console.log("🔧 JWT - Setting token with role:", user.role);
        token.id = user.id
        token.role = user.role
        token.restaurantId = user.restaurantId
        token.customerId = user.customerId
      } else {
        console.log("🔧 JWT - Token exists with role:", token.role);
      }
      return token
    },

    async session({ session, token }) {
      console.log("🎯 Session Callback - Token role:", token.role);
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.restaurantId = token.restaurantId
        session.user.customerId = token.customerId
        console.log("🎯 Session created for user:", {
          email: session.user.email,
          role: session.user.role
        });
      }
      return session
    },
  },
}