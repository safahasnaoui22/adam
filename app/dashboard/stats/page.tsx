import StatsClient from "@/components/StatsClient";

export default function StatsPage() {
  // Static data to test
  const mockData = {
    totalCustomers: 0,
    totalPoints: 0,
    totalVisits: 0,
    totalRewardsRedeemed: 0,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-2">Statistiques</h1>
      <p className="text-gray-400 mb-6">Analysez l’activité de votre programme de fidélité</p>
      <StatsClient data={mockData} />
    </div>
  );
}