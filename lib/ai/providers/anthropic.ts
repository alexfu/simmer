import { EXTRACTION_PROMPT } from "@/lib/ai/prompt";

type AnthropicMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export async function extractWithAnthropic(
  apiKey: string,
  model: string,
  base64Data: string,
  mimeType: string,
): Promise<string> {
  const isPdf = mimeType === "application/pdf";

  const fileContent = isPdf
    ? {
        type: "document" as const,
        source: {
          type: "base64" as const,
          media_type: "application/pdf" as const,
          data: base64Data,
        },
      }
    : {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mimeType as AnthropicMediaType,
          data: base64Data,
        },
      };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            fileContent,
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const json = await response.json();
  return json.content[0].text;
}
