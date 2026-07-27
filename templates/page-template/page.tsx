import { Suspense } from "react";

export default async function FeaturePage() {
  // Fetch data (Server Component)

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Feature Title</h1>

      <Suspense fallback={<div>Loading...</div>}>{/* Child Components */}</Suspense>
    </div>
  );
}
