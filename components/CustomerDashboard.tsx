// components/CustomerDashboard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Restaurant, CustomerProfile, Reward } from "@prisma/client";

interface CustomerDashboardProps {
  restaurant: Restaurant & { loyaltyProgram: any };
  customer: CustomerProfile & { visits: any[]; earnedRewards: any[] };
  rewards: Reward[];
  nextReward: Reward | null;
  currentProgress: number;
}

export default function CustomerDashboard({
  restaurant,
  customer,
  rewards,
  nextReward,
  currentProgress,
}: CustomerDashboardProps) {
  const [showQR, setShowQR] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const dinars = (customer.points / 10).toFixed(2);

  const handleGoogleReview = async () => {
    setReviewLoading(true);
    try {
      const res = await fetch("/api/customer/add-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          points: 50,
          reason: "google_review",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMessage("Merci ! 50 étoiles ajoutées à votre compte.");
        window.location.reload();
      } else {
        setReviewMessage(data.error || "Erreur, réessayez.");
      }
    } catch (error) {
      setReviewMessage("Erreur de connexion.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToHomeScreen = () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      alert("Déjà installé !");
    } else {
      alert("Utilisez 'Ajouter à l'écran d'accueil' dans le menu de votre navigateur.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf9f4] to-white pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-[#282424] text-center mb-6">Mon programme</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 transform transition hover:scale-[1.01]">
          <p className="text-sm text-[#7f8489]">Bienvenue,</p>
          <p className="text-2xl font-bold text-[#fe5502]">{customer.name}</p>
        </div>

        <div className="bg-gradient-to-r from-[#fe5502] to-[#e0682e] rounded-2xl shadow-lg p-6 mb-6 text-white">
          <p className="text-sm opacity-90">Votre solde</p>
          <p className="text-4xl font-bold mt-1">{customer.points} points</p>
          <p className="text-sm mt-2">≈ {dinars} DT</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 text-center">
          <p className="text-sm text-[#7f8489]">1 DT = 10 étoiles</p>
        </div>

        {nextReward ? (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#282424]">Prochaine récompense</span>
              <span className="text-sm font-bold text-[#fe5502]">
                {customer.points} / {nextReward.pointsRequired} pts
              </span>
            </div>
            <div className="w-full bg-[#c6c9c8] rounded-full h-3">
              <div
                className="bg-[#fe5502] h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(currentProgress, 100)}%` }}
              />
            </div>
            <p className="text-sm text-[#7f8489] mt-2">🎁 {nextReward.name}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 text-center">
            <p className="text-sm text-[#7f8489]">🎉 Félicitations ! Vous avez débloqué toutes les récompenses.</p>
          </div>
        )}

        {rewards.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <h3 className="font-semibold text-[#282424] mb-3">Récompenses</h3>
            <div className="space-y-2">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex justify-between items-center py-2 border-b border-[#c6c9c8] last:border-0">
                  <span className="text-sm text-[#282424]">{reward.name}</span>
                  <span className="text-sm font-medium text-[#fe5502]">{reward.pointsRequired} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => setShowQR(!showQR)} className="w-full mb-4 py-3 bg-[#fe5502] text-white rounded-xl font-medium hover:bg-[#e0682e] transition-colors flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          <span>Mon QR Code</span>
        </button>

        {showQR && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
            <div className="bg-[#fdf9f4] p-4 rounded-xl inline-block mx-auto">
              <QRCodeSVG value={customer.customerId} size={180} bgColor="#ffffff" fgColor="#fe5502" level="H" />
            </div>
            <p className="text-xs text-[#7f8489] mt-3 break-all">ID: {customer.customerId}</p>
            <p className="text-xs text-[#7f8489] mt-1">Présentez ce code au restaurateur pour cumuler des points.</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="font-semibold text-[#282424] mb-2">Gagnez plus de points</h3>
          <button onClick={handleGoogleReview} disabled={reviewLoading} className="w-full py-2 border border-[#fe5502] text-[#fe5502] rounded-lg hover:bg-[#fe5502] hover:text-white transition-colors">
            {reviewLoading ? "Chargement..." : "Laissez un avis Google +50⭐"}
          </button>
          {reviewMessage && <p className="text-sm text-[#e0682e] mt-2">{reviewMessage}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="font-semibold text-[#282424] mb-3">Comment ça marche</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3"><div className="flex-shrink-0 w-6 h-6 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center text-xs font-bold">1</div><p className="text-sm text-[#7f8489]">Scannez le QR code du restaurant ou présentez votre code personnel</p></div>
            <div className="flex items-start space-x-3"><div className="flex-shrink-0 w-6 h-6 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center text-xs font-bold">2</div><p className="text-sm text-[#7f8489]">Le restaurateur ajoute vos points selon vos achats (1 DT = 10⭐)</p></div>
            <div className="flex items-start space-x-3"><div className="flex-shrink-0 w-6 h-6 bg-[#ffd9b9] text-[#fe5502] rounded-full flex items-center justify-center text-xs font-bold">3</div><p className="text-sm text-[#7f8489]">Accumulez et échangez vos points contre des récompenses exclusives</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="font-semibold text-[#282424] mb-2">À propos</h3>
          <p className="text-sm text-[#7f8489] leading-relaxed">{restaurant.description || "Bienvenue dans notre programme de fidélité."}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <h3 className="font-semibold text-[#282424] mb-2">Conditions d'utilisation</h3>
          <p className="text-sm text-[#7f8489]">{restaurant.termsConditions || "1 point = 1 DT dépensé. Les points expirent après 90 jours d'inactivité."}</p>
        </div>

        <button onClick={() => setShowOptions(!showOptions)} className="w-full py-3 border border-[#c6c9c8] rounded-xl text-[#7f8489] font-medium hover:bg-[#fdf9f4] transition-colors mb-4">
          Plus d'options {showOptions ? "▲" : "▼"}
        </button>

        {showOptions && (
          <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3 mb-6">
            <Link href={`/${restaurant.urlSlug}/history`} className="block py-2 text-[#282424] hover:text-[#fe5502]">📜 Historique des visites</Link>
            <Link href={`/${restaurant.urlSlug}/rewards-history`} className="block py-2 text-[#282424] hover:text-[#fe5502]">🎁 Historique des récompenses</Link>

          </div>
        )}

        <button onClick={handleAddToHomeScreen} className="w-full py-4 bg-[#282424] text-white rounded-xl font-semibold hover:bg-[#3a2e2e] transition-colors flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          <span>Ajouter à l'écran d'accueil</span>
        </button>
      </div>
    </div>
  );
}