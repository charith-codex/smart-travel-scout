import { TravelResult } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Sparkles } from "lucide-react";

interface TravelResultCardProps {
  result: TravelResult;
}

export function TravelResultCard({ result }: TravelResultCardProps) {
  return (
    <Card className="flex flex-col h-full bg-white border border-primary/10 transition-all hover:shadow-[0_30px_60px_rgba(141,31,23,0.12)] hover:-translate-y-1 rounded-[2.5rem] overflow-hidden group shadow-xl gap-0">
      <CardHeader className="pb-3 px-8 pt-10">
        <div className="flex flex-col gap-3">
          <CardTitle className="text-3xl font-serif font-black leading-tight text-neutral-900 group-hover:text-primary transition-colors italic tracking-tight">
            {result.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-primary/60 uppercase tracking-[0.2em] font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{result.location}</span>
          </div>
        </div>
        <CardAction>
          <Badge
            variant="secondary"
            className="flex items-center gap-1 font-black whitespace-nowrap bg-accent text-accent-foreground py-1.5 px-4 h-10 rounded-2xl shadow-lg border-2 border-white/20"
          >
            <DollarSign className="w-4 h-4 opacity-70" />
            <span className="text-md">{result.price}</span>
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="grow space-y-6 px-8 pt-4 pb-8">
        <div className="flex flex-wrap gap-2">
          {result.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10 rounded-xl transition-all hover:bg-primary hover:text-white"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0 bg-transparent flex-col items-stretch">
        <div className="bg-secondary/5 border border-secondary/10 rounded-[2rem] p-6 relative overflow-hidden group/insight">
          <div className="flex items-start gap-5 relative z-10">
            <div className="p-3 bg-white rounded-2xl shrink-0 shadow-sm border border-secondary/10">
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-secondary/60 uppercase tracking-[0.3em]">
                Heritage Scout Insight
              </p>
              <p className="text-neutral-800 leading-relaxed font-medium italic text-[15px]">
                "{result.reason}"
              </p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
