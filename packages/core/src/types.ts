export type Role = 'practice' | 'teach' | 'robot_transfer' | 'human_check';
export type Polynomial = { c2: number; c1: number; c0: number };
export type Family = 'constant' | 'linear' | 'quadratic';
export type Portal = { x: number; yMin: number; yMax: number };
export type Scene = {
  id: string; title: string; instruction: string; role: Role;
  domain: { xMin: number; xMax: number; yMin: number; yMax: number };
  allowedFamilies: Family[]; coefficientLocks: Partial<Polynomial>; vertexLock?: { x?: number; y?: number };
  start: Portal; goal: Portal; gates: (Portal & { id: string })[];
  obstacles: { id: string; xMin: number; xMax: number; yMin: number; yMax: number }[];
  initialExpression: string;
};
export type Mission = { id: string; order: number; title: string; skillId: string; learningGoal: string; misconceptionId: string; canonicalRuleId: string; ruleText: string; scriptedRobotUtterance: string; scenes: Record<Role, Scene> };
export type NumericEvidence = { sceneId: string; checkpointId: string; submittedY: number };
export type RuleEvidence = { missionId: string; candidateExpression: string; numericEvidence: NumericEvidence[] };
export type Fact = { id: string; kind: string; subject: string; value: unknown; textPL: string };
export type Event = { x: number; y: number; code: string; subject: string };
export type EngineResult = { ok: boolean; parseable: boolean; primaryCode: string; messagePL: string; diagnostics: string[]; checkpoints: { id: string; x: number; y: number; passed: boolean }[]; firstPhysicalEvent: Event | null; canonicalPolynomial: Polynomial | null };
