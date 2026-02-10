import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type SwapiType = "starships" | "species";

type CardSettings = {
  fields: string[];
  bgColor: string;
};

type TypeState = {
  global: CardSettings;
  perId: Record<string, Partial<CardSettings>>;
};

type CustomizationState = Record<SwapiType, TypeState>;

const initialState: CustomizationState = {
  starships: {
    global: {
      fields: ["starship_class"],
      bgColor: "#ffffff"
    },
    perId: {}
  },
  species: {
    global: {
      fields: ["classification"],
      bgColor: "#ffffff"
    },
    perId: {}
  }
};

type SetFieldsPayload = {
  type: SwapiType;
  id: string;
  fields: string[];
  applyToAll: boolean;
};

type SetBgColorPayload = {
  type: SwapiType;
  id: string;
  bgColor: string;
  applyToAll: boolean;
};

const customizationSlice = createSlice({
  name: "customization",
  initialState,
  reducers: {
    setFields(state, action: PayloadAction<SetFieldsPayload>) {
      const { type, id, fields, applyToAll } = action.payload;
      if (applyToAll) {
        state[type].global.fields = fields;
      } else {
        const existing = state[type].perId[id] ?? {};
        state[type].perId[id] = { ...existing, fields };
      }
    },
    setBgColor(state, action: PayloadAction<SetBgColorPayload>) {
      const { type, id, bgColor, applyToAll } = action.payload;
      if (applyToAll) {
        state[type].global.bgColor = bgColor;
      } else {
        const existing = state[type].perId[id] ?? {};
        state[type].perId[id] = { ...existing, bgColor };
      }
    }
  }
});

export const { setFields, setBgColor } = customizationSlice.actions;
export default customizationSlice.reducer;
