import { EXTRACTION_PROMPT } from "@/lib/ai/prompt";

function buildFileContent(base64Data: string, mimeType: string) {
  if (mimeType === "application/pdf") {
    return {
      type: "file" as const,
      file: {
        filename: "recipe.pdf",
        file_data: `data:application/pdf;base64,${base64Data}`,
      },
    };
  }

  return {
    type: "image_url" as const,
    image_url: { url: `data:${mimeType};base64,${base64Data}` },
  };
}

export async function extractWithOpenAI(
  apiKey: string,
  model: string,
  base64Data: string,
  mimeType: string,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            buildFileContent(base64Data, mimeType),
          ],
        },
      ],
      max_completion_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const json = await response.json();
  return json.choices[0].message.content;
}
