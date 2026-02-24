import { Plane } from "lucide-react";
import { TravelScoutClient } from "@/components/TravelScoutClient";

export default function Home() {
  return (
    <main className="relative min-h-screen selection:bg-primary/20 overflow-x-hidden font-sans">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{
          backgroundImage: "url('/travel.jpg')",
          transform: "scale(1.05)",
        }}
      />
      <div className="fixed inset-0 z-10 bg-black/70 bg-linear-to-b from-black/20 via-transparent to-black/60" />

      <div className="relative z-20 min-h-screen flex flex-col items-center justify-start pt-25 pb-20 px-4">
        <div className="w-full max-w-4xl space-y-12">
          {/* Header Section */}
          <section className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="inline-flex items-center justify-center p-4 bg-primary/20 backdrop-blur-xl rounded-[2rem] border border-primary/30 shadow-2xl relative group shrink-0">
                <div className="absolute inset-0 bg-accent/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plane className="w-8 h-8 text-accent relative z-10" />
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] italic">
                Ceylonese Scout
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/95 font-serif italic max-w-2xl mx-auto drop-shadow-lg px-4">
              Experience the authentic heritage and hidden treasures in Sri
              Lanka
            </p>
          </section>

          <TravelScoutClient />
        </div>
      </div>
    </main>
  );
}
