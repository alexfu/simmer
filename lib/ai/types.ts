export interface ExtractedRecipe {
  title: string;
  description: string | null;
  servings: number;
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions: { text: string }[];
}

export interface DiagnosticPhase {
  name: string;
  prompt: string;
  response: string;
  parsed?: ExtractedRecipe;
}

export interface DiagnosticLog {
  provider: string;
  model: string;
  timestamp: string;
  source: "file" | "text";
  phases: DiagnosticPhase[];
  finalResult: ExtractedRecipe;
}

export interface ExtractionResult {
  recipe: ExtractedRecipe;
  diagnosticLog?: DiagnosticLog;
}
