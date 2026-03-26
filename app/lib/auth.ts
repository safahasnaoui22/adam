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
        token.customerId = user.customerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.restaurantId = token.restaurantId as string;
        session.user.customerId = token.customerId as string;
        
        // If it's a customer, fetch their full profile
        if (token.role === "CUSTOMER" && token.customerId) {
          const customerProfile = await prisma.customerProfile.findUnique({
            where: { id: token.customerId as string },
          });
          if (customerProfile) {
            session.user.customerProfile = customerProfile;
          }
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
};