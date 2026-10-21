// app/[restaurantSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import QRCodeScanner from "@/components/QRCodeScanner";
import AutoLogin from "@/components/AutoLogin";
import AutoRedirect from "@/components/AutoRedirect";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export default async function RestaurantLandingPage({ params }: PageProps) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { urlSlug: restaurantSlug },
    include: { loyaltyProgram: true },
  });

  if (!restaurant) notFound();

  if (restaurant.accountStatus !== "ACTIVE") {
    return (
      <div
        className="rlp-inactive"
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "380px" }}>
          <div
            style={{
              width: "96px",
              height: "96px",
              background: "linear-gradient(135deg, #ffd9b9 0%, #ffe8d6 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 10px 30px rgba(254,85,2,0.12)",
            }}
          >
            <svg
              style={{ width: "48px", height: "48px", color: "#fe5502" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#282424",
              marginBottom: "12px",
            }}
          >
            Restaurant en attente
          </h2>
          <p style={{ color: "#7f8489", lineHeight: 1.6, fontSize: "15px" }}>
            Ce programme de fidélité n'est pas encore actif.
          </p>
        </div>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.customerProfile) {
    // Redirect to the existing client dashboard, passing the restaurantId as a query parameter
    redirect(`/client/dashboard?restaurantId=${restaurant.id}`);
  }

  return (
    <div className="rlp-root" style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Scoped styles — high specificity, overrides any external CSS */}
      <style>{`
        .rlp-root {
          min-height: 100vh !important;
          background: #ffffff !important;
          width: 100% !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          color: #282424 !important;
          box-sizing: border-box !important;
        }
        .rlp-root *, .rlp-root *::before, .rlp-root *::after {
          box-sizing: border-box !important;
        }
        .rlp-container {
          max-width: 520px !important;
          margin: 0 auto !important;
          padding: 32px 20px 48px !important;
          width: 100% !important;
        }
        .rlp-logo-wrap {
          position: relative !important;
          display: inline-block !important;
          margin-bottom: 20px !important;
        }
        .rlp-logo-glow {
          position: absolute !important;
          inset: 0 !important;
          background: linear-gradient(135deg, #fe5502 0%, #ff8a4c 100%) !important;
          border-radius: 50% !important;
          filter: blur(22px) !important;
          opacity: 0.22 !important;
          transform: scale(1.12) !important;
        }
        .rlp-logo {
          position: relative !important;
          width: 112px !important;
          height: 112px !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          display: block !important;
          margin: 0 auto !important;
          box-shadow: 0 14px 34px rgba(254, 85, 2, 0.18) !important;
          border: 4px solid #ffffff !important;
          background: #ffffff !important;
        }
        .rlp-logo-initials {
          position: relative !important;
          width: 112px !important;
          height: 112px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, #fe5502 0%, #ff8a4c 100%) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 auto !important;
          box-shadow: 0 14px 34px rgba(254, 85, 2, 0.22) !important;
          border: 4px solid #ffffff !important;
        }
        .rlp-logo-initials span {
          font-size: 46px !important;
          font-weight: 800 !important;
          color: #ffffff !important;
          line-height: 1 !important;
        }
        .rlp-restaurant-name {
          font-size: 26px !important;
          font-weight: 800 !important;
          color: #282424 !important;
          margin: 0 0 6px !important;
          letter-spacing: -0.02em !important;
          line-height: 1.2 !important;
          text-align: center !important;
        }
        .rlp-subtitle {
          font-size: 14px !important;
          color: #7f8489 !important;
          font-weight: 500 !important;
          margin: 0 !important;
          text-align: center !important;
          letter-spacing: 0.01em !important;
        }
        .rlp-header {
          text-align: center !important;
          margin-bottom: 28px !important;
        }
        .rlp-welcome {
          background: linear-gradient(135deg, #fffaf5 0%, #fff5ed 100%) !important;
          border: 1px solid #ffe8d6 !important;
          border-radius: 20px !important;
          padding: 28px 24px !important;
          margin-bottom: 18px !important;
          text-align: center !important;
          box-shadow: 0 4px 20px rgba(254, 85, 2, 0.04) !important;
        }
        .rlp-welcome-icon {
          width: 48px !important;
          height: 48px !important;
          background: #ffffff !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 auto 14px !important;
          box-shadow: 0 4px 12px rgba(254, 85, 2, 0.08) !important;
          font-size: 24px !important;
        }
        .rlp-welcome h2 {
          font-size: 20px !important;
          font-weight: 700 !important;
          color: #282424 !important;
          margin: 0 0 10px !important;
          line-height: 1.3 !important;
        }
        .rlp-welcome p {
          font-size: 14.5px !important;
          color: #7f8489 !important;
          line-height: 1.6 !important;
          margin: 0 !important;
          max-width: 340px !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        .rlp-scanner-card {
          background: #ffffff !important;
          border: 1px solid #f0f0f0 !important;
          border-radius: 20px !important;
          padding: 24px !important;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06) !important;
          margin-bottom: 18px !important;
        }
        .rlp-tip {
          background: linear-gradient(135deg, #ffd9b9 0%, #ffe8d6 100%) !important;
          border-radius: 18px !important;
          padding: 18px 20px !important;
          display: flex !important;
          align-items: flex-start !important;
          gap: 12px !important;
          box-shadow: 0 4px 16px rgba(254, 85, 2, 0.08) !important;
        }
        .rlp-tip-icon {
          flex-shrink: 0 !important;
          width: 32px !important;
          height: 32px !important;
          background: rgba(255, 255, 255, 0.65) !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 16px !important;
        }
        .rlp-tip p {
          font-size: 13.5px !important;
          color: #b84d1a !important;
          line-height: 1.55 !important;
          font-weight: 500 !important;
          margin: 0 !important;
          text-align: left !important;
        }
        @media (max-width: 480px) {
          .rlp-container { padding: 24px 16px 40px !important; }
          .rlp-logo, .rlp-logo-initials { width: 96px !important; height: 96px !important; }
          .rlp-logo-initials span { font-size: 38px !important; }
          .rlp-restaurant-name { font-size: 22px !important; }
          .rlp-welcome, .rlp-scanner-card { padding: 22px 18px !important; }
        }
      `}</style>

      <AutoRedirect restaurantSlug={restaurantSlug} />

      <div className="rlp-container">
        {/* Restaurant Logo & Header */}
        <div className="rlp-header">
          <div className="rlp-logo-wrap">
            <div className="rlp-logo-glow" />
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="rlp-logo"
              />
            ) : (
              <div className="rlp-logo-initials">
                <span>{restaurant.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <h1 className="rlp-restaurant-name">{restaurant.name}</h1>
          <p className="rlp-subtitle">Programme de fidélité</p>
        </div>

        {/* 👇 Client component that attempts auto‑login before showing the form */}
        <AutoLogin restaurantSlug={restaurantSlug} />

        {/* Welcome Card */}
        <div className="rlp-welcome">
          <div className="rlp-welcome-icon">👋</div>
          <h2>Bienvenue !</h2>
          <p>
            Créez votre compte pour commencer à accumuler des points et profiter
            de récompenses exclusives.
          </p>
        </div>

        {/* QR Scanner Card */}
        <div className="rlp-scanner-card">
          <QRCodeScanner
            restaurantId={restaurant.id}
            restaurantSlug={restaurantSlug}
          />
        </div>

        {/* Tip Card */}
        <div className="rlp-tip">
          <div className="rlp-tip-icon">💡</div>
          <p>
            Astuce: Après votre inscription, ajoutez cette page à l'écran
            d'accueil pour y accéder facilement à chaque visite safa
          </p>
        </div>
      </div>
    </div>
  );
}