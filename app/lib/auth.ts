// app/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            restaurant: true,
            customerProfile: true,
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurant?.id,
          customerId: user.customerProfile?.id,
        };
      },
    }),
  ],
  callbacks: {
  async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.restaurantId = user.restaurantId;
    token.customerId = user.customerId; // already set in user object
  }
  return token;
},
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role as string;
    session.user.restaurantId = token.restaurantId as string;
    session.user.customerId = token.customerId as string; // make sure it's here
  }
  return session;
},
  },
  session: {
    strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   
  },
  pages: {
    signIn: "/auth/signin",
  },
};