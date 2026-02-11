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

type CustomizationState = {
  starships: TypeState;
  species: TypeState;
};

type SetGlobalSettingsPayload = {
  type: SwapiType;
  fields?: string[];
  bgColor?: string;
};

const initialState: CustomizationState = {
  starships: {
    global: {
      fields: ["starship_class"],
      bgColor: "#ffffff",
    },
    perId: {}
  },
  species: {
    global: {
      fields: ["classification"],
      bgColor: "#ffffff",
    },
    perId: {}
  },
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
        // Remove all perId bgColor overrides so all cards inherit the new global color
        Object.keys(state[type].perId).forEach((cardId) => {
          if (state[type].perId[cardId] && 'bgColor' in state[type].perId[cardId]) {
            const { bgColor, ...rest } = state[type].perId[cardId]!;
            // If no other overrides remain, remove the perId entry entirely
            if (Object.keys(rest).length === 0) {
              delete state[type].perId[cardId];
            } else {
              state[type].perId[cardId] = rest;
            }
          }
        });
      } else {
        const existing = state[type].perId[id] ?? {};
        state[type].perId[id] = { ...existing, bgColor };
      }
    },
    setGlobalSettings(state, action: PayloadAction<SetGlobalSettingsPayload>) {
      const { type, fields, bgColor } = action.payload;
      if (fields !== undefined) {
        state[type].global.fields = fields;
      }
      if (bgColor !== undefined) {
        state[type].global.bgColor = bgColor;
      }
    }
  }
});

export const { setFields, setBgColor, setGlobalSettings } = customizationSlice.actions;
export default customizationSlice.reducer;
