/* Generated from contracts/ JSON Schema. Do not edit. */

/**
 * Wyłącznie treść zwracana przez model. Status trybu, wynik silnika i metadane należą do osobnej koperty aplikacji.
 */
export interface ModelPayload {
  /**
   * Krótka wypowiedź Piko po polsku. Zwykły tekst, bez HTML i bez deklaracji zaliczenia.
   */
  utterancePL: string;
  /**
   * Jedno krótkie pytanie lub null.
   */
  followUpPL: string | null;
  /**
   * Orientacyjny komentarz do wyjaśnienia; nigdy próg zaliczenia.
   */
  explanationAssessment: "sound" | "partial" | "incorrect" | "unclear" | "not_applicable";
  /**
   * W teach zawsze null. W robot_transfer wzór do niezależnego sprawdzenia lub null, gdy Piko zgłasza niepewność.
   */
  proposedExpression: string | null;
  /**
   * Wyłącznie sugestia dotycząca reguły bieżącej misji; nie zmienia pamięci.
   */
  suggestedRuleId:
    | "RULE_LINE_INTERCEPT"
    | "RULE_LINE_SLOPE"
    | "RULE_QUAD_VERTICAL"
    | "RULE_QUAD_HORIZONTAL"
    | "RULE_QUAD_CURVATURE"
    | "RULE_COMBINE"
    | null;
  /**
   * Identyfikatory faktów z bieżącego kontekstu; backend sprawdza, czy istnieją.
   *
   * @maxItems 8
   */
  usedFactIds: string[];
  action: "ask_question" | "explain_back" | "propose_attempt" | "acknowledge_uncertainty";
}
