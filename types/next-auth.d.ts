import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    provider?: string;
    providerAccountId?: string;
    user: {
      id: string;
      role: string;
      restaurantId?: string;
      customerId?: string;
      restaurantSlug?: string;
      customerProfile?: {
        id: string;
        name: string;
        customerId: string;
        points: number;
        stamps: number;
        createdAt: Date;
        lastVisit?: Date | null;
      };
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    restaurantId?: string;
    customerId?: string;
    restaurantSlug?: string;
  }
}