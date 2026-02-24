"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchFormSchema, SearchFormValues } from "@/lib/types";
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
import { Search } from "lucide-react";

interface ScoutFormProps {
  onSubmit: (data: SearchFormValues) => void;
  isLoading?: boolean;
}

export function ScoutForm({ onSubmit, isLoading = false }: ScoutFormProps) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema as any),
    defaultValues: {
      query: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
      </form>
    </Form>
  );
}
