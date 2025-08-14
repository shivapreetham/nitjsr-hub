// app/market/page.tsx
"use client";

import { Suspense } from "react";
import SearchParamsWrapper from "./(comp)/components/MarketPage";
import LoadingState from "./(comp)/components/ui/LoadingState";

export default function MarketPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading marketplace..." />}>
      <SearchParamsWrapper />
    </Suspense>
  );
}