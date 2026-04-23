// app/auth/pending/page.tsx
export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Account Pending</h1>
        <p className="text-gray-600">
          Your restaurant account is currently being processed. You will be notified once it is approved.
        </p>
      </div>
    </div>
  );
}