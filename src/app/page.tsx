"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectResolvedSettings } from "@/store/selectors";
import type { SwapiType } from "@/store/customizationSlice";

const fetchSwapi = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch SWAPI data");
  }
  return response.json();
};

const getIdFromUrl = (url: string) => url.split("/").filter(Boolean).pop() ?? "";

const formatValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return value ?? "";
};

function CardItem({ item, type }: { item: Record<string, unknown>; type: SwapiType }) {
  const url = String(item.url ?? "");
  const id = getIdFromUrl(url);
  const name = String(item.name ?? "Unknown");
  const settings = useAppSelector((state) => selectResolvedSettings(state, type, id));

  return (
    <Card style={{ backgroundColor: settings.bgColor }}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {settings.fields.length === 0 && (
          <p className="text-[hsl(var(--muted-foreground))]">No fields selected.</p>
        )}
        {settings.fields.map((field) => (
          <div key={field} className="flex items-start justify-between gap-4">
            <span className="text-[hsl(var(--muted-foreground))]">{field}</span>
            <span className="text-right font-medium">{
              (() => {
                const value = formatValue(item[field]);
                if (value === undefined || value === null) return "";
                if (typeof value === "object") return JSON.stringify(value);
                return String(value);
              })()
            }</span>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button asChild size="sm" variant="outline">
          <Link href={`/edit?type=${type}&id=${id}`}>Edit</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function Section({
  title,
  type,
  items
}: {
  title: string;
  type: SwapiType;
  items: Array<Record<string, unknown>>;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          First page results
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const key = String(item.url ?? item.name ?? "");
          return <CardItem key={key} item={item} type={type} />;
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  const starshipsQuery = useQuery({
    queryKey: ["starships"],
    queryFn: () => fetchSwapi("https://swapi.dev/api/starships/")
  });

  const speciesQuery = useQuery({
    queryKey: ["species"],
    queryFn: () => fetchSwapi("https://swapi.dev/api/species/")
  });

  if (starshipsQuery.isLoading || speciesQuery.isLoading) {
    return <div className="p-8 text-lg">Loading SWAPI data...</div>;
  }

  if (starshipsQuery.error || speciesQuery.error) {
    return (
      <div className="p-8 text-lg text-red-600">
        Failed to load data. Please try again.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdf6e3,_#f4efe2_40%,_#f1ede4_100%)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))]">
            SWAPI Dashboard
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Starships & Species from the Outer Rim
          </h1>
          <p className="max-w-2xl text-[hsl(var(--muted-foreground))]">
            Edit what appears on each card, or apply changes globally. Changes are stored in Redux
            and the data is fetched with TanStack Query.
          </p>
        </header>

        <Section title="Starships" type="starships" items={starshipsQuery.data.results ?? []} />
        <Section title="Species" type="species" items={speciesQuery.data.results ?? []} />
      </div>
    </main>
  );
}
