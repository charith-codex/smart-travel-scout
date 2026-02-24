"use client";

import { useState } from "react";
import { ScoutForm } from "@/components/ScoutForm";
import { TravelResultCard } from "@/components/TravelResultCard";
import { SearchFormValues, TravelResult } from "@/lib/types";
import { Map, Loader2, Sparkles } from "lucide-react";

export function TravelScoutClient() {
  const [results, setResults] = useState<TravelResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (values: SearchFormValues) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/scout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations. Please try again.");
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Search Section with Glassmorphism */}
      <section className="bg-primary/10 backdrop-blur-2xl p-2 md:p-4 rounded-[2.5rem] shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-700 delay-150">
        <div className="bg-white/95 p-8 md:px-12 rounded-[1.75rem] shadow-inner relative overflow-hidden">
          <h2 className="text-2xl font-serif font-bold text-neutral-800 mb-4 flex items-center justify-center gap-3 relative z-10">
            <Sparkles className="w-6 h-6 text-accent" />
            Where does your spirit lead?
          </h2>
          <div className="relative z-10">
            <ScoutForm onSubmit={handleSearch} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="space-y-6 min-h-[400px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
              <Loader2 className="w-12 h-12 animate-spin text-white relative z-10" />
            </div>
            <p className="text-lg font-semibold text-white drop-shadow-md animate-pulse">
              Scouting places...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 backdrop-blur-md text-white p-8 rounded-2xl text-center shadow-2xl border border-red-500/20 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-3 bg-red-500 rounded-full mb-1">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">Something went wrong</h3>
            <p className="text-sm opacity-90 max-w-md">{error}</p>
          </div>
        )}

        {results !== null && !isLoading && !error && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {results.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
                    <Map className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-bold text-white">
                      Discovered {results.length}{" "}
                      {results.length === 1 ? "match" : "matches"}
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                  {results.map((result, idx) => (
                    <div
                      key={result.id}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      <TravelResultCard result={result} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl p-12 rounded-3xl text-center shadow-2xl border border-white/20 space-y-6 animate-in fade-in zoom-in-95">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/20">
                  <Map className="w-10 h-10 text-white/50" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    No matches in orbit
                  </h3>
                  <p className="text-base text-white/70 max-w-sm mx-auto">
                    We couldn't find any destinations matching your criteria.
                    Try broadening your vibe or budget for more results.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
