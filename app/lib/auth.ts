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
            customerProfile: {
              include: {
                restaurant: {
                  select: { urlSlug: true }
                }
              }
            },
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        // Get restaurant slug for customers - convert null to undefined
        let restaurantSlug: string | undefined = undefined;
        if (user.role === "CUSTOMER" && user.customerProfile?.restaurant?.urlSlug) {
          restaurantSlug = user.customerProfile.restaurant.urlSlug;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurant?.id,
          customerId: user.customerProfile?.id,
          restaurantSlug: restaurantSlug,
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
        token.restaurantSlug = user.restaurantSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.restaurantId = token.restaurantId as string;
        session.user.customerId = token.customerId as string;
        session.user.restaurantSlug = token.restaurantSlug as string | undefined;
        
        // Fetch the full customer profile if it's a customer
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
    maxAge: 365 * 24 * 60 * 60, // 1 year
    updateAge: 24 * 60 * 60,    // refresh the token every 24 hours
  },
    cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
        maxAge: 365 * 24 * 60 * 60 // 1 year
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
};