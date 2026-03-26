// components/CustomerDashboard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
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

  const handleAddToHomeScreen = () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      alert("Déjà installé!");
    } else {
      alert("Utilisez 'Ajouter à l'écran d'accueil' dans le menu de votre navigateur");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf9f4] to-white pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          {restaurant.logo ? (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="w-20 h-20 rounded-full mx-auto object-cover shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#fe5502] mx-auto flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold text-[#282424] mt-3">
            {restaurant.name}
          </h1>
          <p className="text-sm text-[#7f8489]">Carte de fidélité</p>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-[#7f8489]">ID Client</p>
              <p className="text-sm font-mono text-[#282424]">{customer.customerId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#7f8489]">Membre depuis</p>
              <p className="text-sm text-[#282424]">
                {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#c6c9c8]">
            <p className="text-sm font-medium text-[#282424]">Bonjour,</p>
            <p className="text-lg font-bold text-[#fe5502]">{customer.name}</p>
          </div>
        </div>

        {/* QR Code Button */}
        <button
          onClick={() => setShowQR(!showQR)}
          className="w-full mb-4 py-3 bg-[#fe5502] text-white rounded-xl font-medium hover:bg-[#e0682e] transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span>Afficher le code QR</span>
        </button>

        {showQR && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 text-center">
            <div className="bg-[#fdf9f4] p-4 rounded-xl inline-block mx-auto">
              <div className="w-48 h-48 bg-gradient-to-r from-[#fe5502] to-[#e0682e] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm text-center">QR Code<br />de fidélité</span>
              </div>
            </div>
            <p className="text-xs text-[#7f8489] mt-3">
              Présentez ce code à chaque visite pour cumuler des points
            </p>
          </div>
        )}

        {/* Points Balance */}
        <div className="bg-gradient-to-r from-[#fe5502] to-[#e0682e] rounded-2xl shadow-lg p-6 mb-4 text-white">
          <p className="text-sm opacity-90">Votre solde</p>
          <p className="text-4xl font-bold mt-1">{customer.points}</p>
          <p className="text-xs opacity-80 mt-2">points</p>
        </div>

        {/* Exchange Rate */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#7f8489]">1 DT =</span>
            <span className="text-lg font-bold text-[#fe5502]">10 étoiles</span>
          </div>
        </div>

        {/* Progress Bar */}
        {nextReward && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#282424]">
                Prochaine récompense
              </span>
              <span className="text-sm font-bold text-[#fe5502]">
                {customer.points} / {nextReward.pointsRequired} pts
              </span>
            </div>
            <div className="w-full bg-[#c6c9c8] rounded-full h-3">
              <div
                className="bg-[#fe5502] h-3 rounded-full transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <p className="text-sm text-[#7f8489] mt-2">
              🎁 {nextReward.name}
            </p>
          </div>
        )}

        {/* Rewards List */}
        {rewards.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
            <h3 className="font-semibold text-[#282424] mb-3">Récompenses disponibles</h3>
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    customer.points >= reward.pointsRequired
                      ? "bg-[#ffd9b9]"
                      : "bg-[#fdf9f4]"
                  }`}
                >
                  <div>
                    <p className="font-medium text-[#282424]">{reward.name}</p>
                    {reward.description && (
                      <p className="text-xs text-[#7f8489]">{reward.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#fe5502]">
                      {reward.pointsRequired} pts
                    </p>
                    {customer.points >= reward.pointsRequired && (
                      <button className="text-xs text-green-600 mt-1">
                        Disponible
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <h3 className="font-semibold text-[#282424] mb-2">À propos</h3>
          <p className="text-sm text-[#7f8489] leading-relaxed">
            {restaurant.description || "Bienvenue dans notre programme de fidélité. Accumulez des points à chaque visite et profitez de récompenses exclusives."}
          </p>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <h3 className="font-semibold text-[#282424] mb-2">Conditions d'utilisation</h3>
          <p className="text-sm text-[#7f8489]">
            {restaurant.termsConditions || "1 point = 1 DT dépensé. Les points expirent après 90 jours d'inactivité."}
          </p>
        </div>

        {/* More Options */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full py-3 border border-[#c6c9c8] rounded-xl text-[#7f8489] font-medium hover:bg-[#fdf9f4] transition-colors mb-4"
        >
          Plus d'options {showOptions ? "▲" : "▼"}
        </button>

        {showOptions && (
          <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3 mb-4">
            <button
              onClick={async () => {
                const { signOut } = await import("next-auth/react");
                signOut({ callbackUrl: `/${restaurant.urlSlug}` });
              }}
              className="block w-full text-left py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              🚪 Se déconnecter
            </button>
          </div>
        )}

        {/* Add to Home Screen Button */}
        <button
          onClick={handleAddToHomeScreen}
          className="w-full py-4 bg-[#282424] text-white rounded-xl font-semibold hover:bg-[#3a2e2e] transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Ajouter à l'écran d'accueil</span>
        </button>
      </div>
    </div>
  );
}