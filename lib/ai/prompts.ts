export const OCR_PROMPT = `Extract all text from this image or document exactly as written.
Preserve the original structure, headings, lists, and formatting as plain text.
Do not interpret, summarize, or restructure the content.
Return ONLY the extracted text, nothing else.`;

export const STRUCTURE_PROMPT = `Parse the following recipe text into structured JSON. Extract exactly what is written — do not modify, split, or reorganize ingredients.

Return a JSON object with this structure:
{
  "title": "string",
  "description": "string or null - brief description of the dish",
  "servings": number (integer, at least 1),
  "ingredients": [
    { "name": "string", "quantity": "string - use fractions like 2/3 or 1/4 when exact, or whole numbers like 2", "unit": "string" }
  ],
  "instructions": [
    { "text": "string" }
  ]
}

Rules:
- Keep fractions as fraction notation (e.g. "1/2", "2/3", "1/4") — do NOT convert to decimals
- Whole numbers should be plain strings (e.g. "2", "8")
- Mixed numbers should use addition (e.g. "1+1/2" for one and a half)
- If servings are not mentioned, default to 4
- Each instruction should be a single step
- Use common abbreviations for units (tbsp, tsp, oz, lb, g, ml, cups)
- If a quantity is "to taste" or not specified, use 1 with unit "to taste"
- Remove sub-recipe references that are not actual ingredients (e.g. "White Sauce (right)" or "see below" references). The sub-recipe's own ingredients should already be listed individually.
- Keep instructions as plain text — do not add any special formatting or tags
- Return ONLY the JSON object, no markdown formatting or code blocks`;

export const SPLIT_PROMPT = `You are given a structured recipe as JSON. Your task is to:

1. Split any ingredient that is used in different amounts across different steps into separate entries
2. Differentiate ALL duplicate ingredient names — if the same ingredient name appears more than once, add a descriptive parenthetical to EACH occurrence

Rules for splitting:
- If an ingredient's full amount is used in a single step, leave it as-is
- If an ingredient is divided across multiple steps (e.g. "divided" or used in different sub-recipes), split it into separate entries

Rules for naming:
- Every ingredient name in the final list MUST be unique
- When the same ingredient appears multiple times (even if from different sub-recipes), add a parenthetical describing its use: e.g. "salt (main)", "salt (white sauce)", "salt (tomato sauce)"
- Use short, clear descriptions in the parenthetical

Rules for quantities:
- Each split ingredient must have the correct quantity and unit for its specific use
- The split quantities should account for the total original amount
- Keep quantity as fraction notation (e.g. "2/3", "1/4") — do NOT convert to decimals
- Mixed numbers should use addition (e.g. "1+1/2")

Other rules:
- Do not modify instructions — only modify the ingredients array
- Return the complete recipe JSON with the updated ingredients array
- Return ONLY the JSON object, no markdown formatting or code blocks`;

export const TAGGING_PROMPT = `You are given a structured recipe as JSON with an ingredients array and an instructions array. Your task is to add ingredient reference tags to the instruction text.

When an instruction mentions a specific amount of an ingredient, replace the ENTIRE phrase (number + unit + ingredient name + any surrounding words like "of the") with a tag: {{ingredient name|quantity}}

The tag should read naturally in the sentence. Do NOT leave redundant words around the tag.

Rules:
- The ingredient name inside the tag MUST exactly match a name in the ingredients array
- The quantity in the tag should use fraction notation (e.g. "2/3", "1/4") or whole numbers — NOT decimals
- Tag ALL ingredient references that mention a specific quantity, including when the full amount is used in one step
- If an instruction mentions an ingredient without a specific amount (e.g. "season to taste"), do NOT add a tag
- Do not modify the ingredients array — only modify instruction text
- Return the complete recipe JSON with updated instructions
- Return ONLY the JSON object, no markdown formatting or code blocks

CORRECT examples:
  ingredient: { "name": "olive oil", "quantity": "2", "unit": "tbsp" }
  instruction: "Heat {{olive oil|2}} in a pan"

  ingredient: { "name": "parmesan cheese (filling)", "quantity": "2/3", "unit": "cups" }
  instruction: "Stir {{parmesan cheese (filling)|2/3}} and the egg into the meat mixture"
  (NOT: "Stir {{parmesan cheese (filling)|2/3}} of the cheese and the egg..." — redundant)

  ingredient: { "name": "milk", "quantity": "2", "unit": "cups" }
  instruction: "Stir in {{milk|2}}"
  (Full amount used in one step — still tagged)

WRONG - redundant words around tag:
  "Stir {{parmesan cheese (filling)|2/3}} of the cheese into the mixture"

WRONG - quantity/unit outside tag:
  "Heat 2 tbsp {{olive oil|2}} in a pan"

WRONG - no tag when amount is mentioned:
  "Stir in 2 cups milk"`;
