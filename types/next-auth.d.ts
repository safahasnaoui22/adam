// types/next-auth.d.ts
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      restaurantId?: string;
      customerId?: string;
      customerProfile?: {
        id: string;
        name: string;
        customerId: string;
        points: number;
        stamps: number;
      };
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    restaurantId?: string;
    customerId?: string;
  }
}