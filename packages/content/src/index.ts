import data from '../generated/public-missions.json';
import hintsData from '../../../content/hints.v1.json';
import type { Mission } from '@piko/core';
export const missions = data.missions as Mission[];
export const contentVersion = data.schemaVersion;
export const collisionRules = data.collisionRules;
export const hints = hintsData;
export const missionById = (id: string): Mission => { const m=missions.find(m=>m.id===id); if (!m) throw new Error('Nieznana misja'); return m; };
