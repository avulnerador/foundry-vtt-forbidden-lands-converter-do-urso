export interface FoundrySystemData {
  // Common
  rank: string;
  description: string;
  
  // Talent Specific
  rollModifiers?: Record<string, unknown>;
  category?: string;
  type?: string; // "profession" or similar for talents
  
  // Spell Specific
  spellType?: string; // "SPELL.SPELL"
  range?: string;
  duration?: string;
  ingredient?: string;
}

export interface FoundryExportSource {
  worldId: string;
  uuid: string;
  coreVersion: string;
  systemId: string;
  systemVersion: string;
}

export interface FoundryStats {
  compendiumSource: string | null;
  duplicateSource: null;
  exportSource: FoundryExportSource;
  coreVersion: string;
  systemId: string;
  systemVersion: string;
  createdTime: number;
  modifiedTime: number;
  lastModifiedBy: string;
}

export interface FoundryItem {
  folder: string | null;
  name: string;
  type: string; // "talent" | "spell"
  img: string;
  system: FoundrySystemData;
  effects: unknown[];
  flags: Record<string, unknown>;
  _stats: FoundryStats;
  ownership: {
    default: number;
    [key: string]: number;
  };
}