"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectResolvedSettings } from "@/store/selectors";
import { setBgColor, setFields, setGlobalSettings, type SwapiType } from "@/store/customizationSlice";

const fetchSwapi = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch SWAPI data");
  }
  return response.json();
};

const baseUrlByType: Record<SwapiType, string> = {
  starships: "https://swapi.dev/api/starships/",
  species: "https://swapi.dev/api/species/",
};

const excludedFields = new Set(["name", "url", "created", "edited"]);

const isSwapiType = (value: string | null): value is SwapiType =>
  value === "starships" || value === "species" || value === "vehicles";

export default function EditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const idParam = searchParams.get("id");
  const dispatch = useAppDispatch();
  const type = isSwapiType(typeParam) ? typeParam : null;
  const id = idParam ?? "";

  const settings = useAppSelector((state) =>
    type ? selectResolvedSettings(state, type, id) : { fields: [], bgColor: "#ffffff", nameColor: "#222222" }
  );

  const [selectedFields, setSelectedFields] = React.useState<string[]>(settings.fields);
  const [bgColor, setBgColorState] = React.useState<string>(settings.bgColor);
  const [applyFieldsToAll, setApplyFieldsToAll] = React.useState<boolean>(false);
  const [applyBgToAll, setApplyBgToAll] = React.useState<boolean>(false);
  const [applyNameColorToAll, setApplyNameColorToAll] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!type) return;
    setSelectedFields(settings.fields);
    setBgColorState(settings.bgColor);
  }, [type, id, settings.fields, settings.bgColor]);

  const detailQuery = useQuery({
    enabled: Boolean(type && id),
    queryKey: [type, id],
    queryFn: () => fetchSwapi(`${baseUrlByType[type as SwapiType]}${id}/`)
  });
  if (!type || !id) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdf6e3,_#f4efe2_40%,_#f1ede4_100%)] p-8">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Missing card details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Select a card from the homepage to edit its settings.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }
  if (detailQuery.isLoading) {
    return <div className="p-8 text-lg">Loading card details...</div>;
  }
  if (detailQuery.error || !detailQuery.data) {
    return (
      <div className="p-8 text-lg text-red-600">Failed to load card details.</div>
    );
  }
  const availableFields = Object.keys(detailQuery.data).filter(
    (field) => !excludedFields.has(field)
  );
  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((item) => item !== field) : [...prev, field]
    );
  };

  const handleSave = () => {
    if (applyFieldsToAll && applyBgToAll && applyNameColorToAll) {
      dispatch(
        setGlobalSettings({
          type,
          fields: selectedFields,
          bgColor
        })
      );
    } else {
      dispatch(
        setFields({
          type,
          id,
          fields: selectedFields,
          applyToAll: applyFieldsToAll
        })
      );
      dispatch(
        setBgColor({
          type,
          id,
          bgColor,
          applyToAll: applyBgToAll
        })
      );
    }

    queryClient.invalidateQueries({ queryKey: ["starships"] });
    queryClient.invalidateQueries({ queryKey: ["species"] });
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fdf6e3,_#f4efe2_40%,_#f1ede4_100%)]">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.25em] text-[hsl(var(--muted-foreground))]">
            Edit card
          </p>
          <h1 className="text-3xl font-semibold">Customize {detailQuery.data.name}</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Choose the fields to display and decide whether changes apply to only this card or all
            cards in the section.
          </p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Visible fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableFields.map((field) => (
              <label key={field} className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">{field}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedFields.includes(field)}
                  onChange={() => toggleField(field)}
                />
              </label>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Apply field changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <label className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">Apply fields to all {type}</span>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={applyFieldsToAll}
                onChange={(event) => setApplyFieldsToAll(event.target.checked)}
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card background color</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Background color</span>
              <input
                type="color"
                value={bgColor}
                onChange={(event) => setBgColorState(event.target.value)}
                className="h-10 w-14 cursor-pointer rounded border"
              />
            </label>
            <label className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">Apply background to all {type}</span>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={applyBgToAll}
                onChange={(event) => setApplyBgToAll(event.target.checked)}
              />
            </label>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave}>Save changes</Button>
          <Button asChild variant="outline">
            <Link href="/">Cancel</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
