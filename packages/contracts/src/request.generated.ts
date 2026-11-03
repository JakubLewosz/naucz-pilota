/* Generated from contracts/ JSON Schema. Do not edit. */

/**
 * Żądanie aplikacji do jej własnego backendu. Nie jest bezpośrednim wejściem OpenAI. Cookie/token sesji wyłącznie w warstwie transportu.
 */
export type LearnerRequest = {
  schemaVersion: "1.0.0";
  sessionId: string;
  sessionRevision: number;
  turnId: string;
  missionId: "M01" | "M02" | "M03" | "M04" | "M05" | "M06";
  sceneRole: "teach" | "robot_transfer";
  requestedMode: "live" | "demo";
  phase: "teach_explain" | "teach_repair" | "robot_propose";
  userMessage: string;
  candidateExpression: string | null;
  /**
   * @maxItems 6
   */
  attemptHistory: {
    attemptId: string;
    sceneId: string;
    expression: string;
  }[];
  /**
   * @maxItems 6
   */
  learnedRuleIds: (
    | "RULE_LINE_INTERCEPT"
    | "RULE_LINE_SLOPE"
    | "RULE_QUAD_VERTICAL"
    | "RULE_QUAD_HORIZONTAL"
    | "RULE_QUAD_CURVATURE"
    | "RULE_COMBINE"
  )[];
  /**
   * @maxItems 2
   */
  numericEvidence: {
    checkpointId: "G1" | "G2";
    submittedY: number;
    sceneId: string;
  }[];
  /**
   * @maxItems 6
   */
  ruleEvidence: {
    missionId: "M01" | "M02" | "M03" | "M04" | "M05" | "M06";
    candidateExpression: string;
    /**
     * @minItems 2
     * @maxItems 2
     */
    numericEvidence: {
      checkpointId: "G1" | "G2";
      submittedY: number;
      sceneId: string;
    }[];
  }[];
};
