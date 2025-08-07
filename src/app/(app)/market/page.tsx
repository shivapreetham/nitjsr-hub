// app/market/page.tsx
"use client";

import { Suspense } from "react";
import SearchParamsWrapper from "./(comp)/components/MarketPage";

export default function MarketPage() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <SearchParamsWrapper />
    </Suspense>
  );
}