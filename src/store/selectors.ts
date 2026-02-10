import type { RootState } from "./store";
import type { SwapiType } from "./customizationSlice";
import { createSelector } from "reselect";

type CardSettings = {
  fields: string[];
  bgColor: string;
};

type PartialCardSettings = Partial<CardSettings> | undefined;

export const selectResolvedSettings = createSelector(
  [
    (state: RootState, type: SwapiType, id: string) => state.customization[type].global,
    (state: RootState, type: SwapiType, id: string) => state.customization[type].perId[id],
  ],
  (base: CardSettings, per: PartialCardSettings) => ({
    fields: per && per.fields ? per.fields : base.fields,
    bgColor: per && per.bgColor ? per.bgColor : base.bgColor,
  })
);
