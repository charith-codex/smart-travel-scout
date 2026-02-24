"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchFormSchema, SearchFormValues, ALL_TAGS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ScoutFormProps {
  onSubmit: (data: SearchFormValues) => void;
  isLoading?: boolean;
}

export function ScoutForm({ onSubmit, isLoading = false }: ScoutFormProps) {
  const [showFilters, setShowFilters] = useState(false);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema as any),
    defaultValues: {
      query: "",
      minPrice: undefined,
      maxPrice: undefined,
      tags: [],
    },
  });

  const selectedTags = form.watch("tags") ?? [];

  const toggleTag = (tag: string) => {
    const current = form.getValues("tags") ?? [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    form.setValue("tags", next, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Main search input */}
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <div className="relative flex items-center">
                <FormControl>
                  <Input
                    placeholder="e.g., 'beach with surfing vibes under $120'"
                    className="pl-10 h-14 rounded-2xl shadow-md border-primary/20 bg-white/50 backdrop-blur-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <Search className="absolute left-3 text-primary/50 h-5 w-5 z-10 pointer-events-none" />
                <div className="absolute right-2 top-2">
                  <Button
                    type="submit"
                    className="h-10 rounded-xl px-6 text-sm font-bold shadow-lg hover:shadow-primary/20 transition-all transform active:scale-95"
                    disabled={
                      isLoading ||
                      !form.formState.isDirty ||
                      !form.formState.isValid
                    }
                  >
                    {isLoading ? "Searching..." : "Scout"}
                  </Button>
                </div>
              </div>
              <FormMessage className="ml-2" />
              <FormDescription className="ml-2 text-xs font-sans text-center italic text-muted-foreground/90">
                Discover your perfect getaway in the pearl of the Indian Ocean.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Filters toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary/80 hover:text-primary transition-colors px-4 py-1.5 rounded-full border border-primary/20 bg-white/60 hover:bg-white/80 shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showFilters ? "Hide Filters" : "Refine with Filters"}
            {showFilters ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Collapsible filter panel */}
        {showFilters && (
          <div className="rounded-2xl border border-primary/15 bg-white/60 backdrop-blur-sm px-5 py-4 space-y-5 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Price range */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/60">
                Price Range (USD)
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Min $"
                            className="h-10 rounded-xl text-sm border-primary/20 bg-white/70 focus-visible:ring-primary"
                            value={
                              field.value !== undefined
                                ? String(field.value)
                                : ""
                            }
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              field.onChange(
                                raw === "" ? undefined : Number(raw),
                              );
                            }}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <span className="text-muted-foreground text-sm font-medium">
                  —
                </span>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Max $"
                            className="h-10 rounded-xl text-sm border-primary/20 bg-white/70 focus-visible:ring-primary"
                            value={
                              field.value !== undefined
                                ? String(field.value)
                                : ""
                            }
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              field.onChange(
                                raw === "" ? undefined : Number(raw),
                              );
                            }}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Tag multi-select */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/60">
                Experience Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      disabled={isLoading}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        active
                          ? "bg-primary text-white border-primary shadow-md scale-105"
                          : "bg-white/80 text-primary/70 border-primary/20 hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => form.setValue("tags", [])}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-primary transition-colors"
                >
                  Clear tags
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
