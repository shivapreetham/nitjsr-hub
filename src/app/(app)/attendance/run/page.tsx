"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleCheckRequest = async () => {
    setLoading(true);
    setError("");

    try {
      // https://testserver-hrna.onrender.com
      const response = await fetch("https://testserver-hrna.onrender.com/");
      console.log("Response Status:", response.status);
      const data = await response.json();
      console.log("Response Data:", data);
    } catch (err:any)
     {
      setError("Request failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
      <h2 className="text-2xl font-bold mb-4">Check GET Request</h2>
      
      <button
        onClick={handleCheckRequest}
        className="bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90 transition-colors"
        disabled={loading}
      >
        {loading ? "Checking..." : "Check Request"}
      </button>
      
      {error && <p className="text-destructive mt-3">{error}</p>}
    </main>
  );
}
