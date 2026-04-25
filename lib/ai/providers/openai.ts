function extractOutputText(json: Record<string, unknown>): string {
  // Try output_text helper first (may exist on some responses)
  if (typeof json.output_text === "string") {
    return json.output_text;
  }

  // Parse output array: find the first message with text content
  const output = json.output as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(output)) {
    for (const item of output) {
      if (item.type === "message") {
        const content = item.content as
          | Array<Record<string, unknown>>
          | undefined;
        if (Array.isArray(content)) {
          for (const part of content) {
            if (part.type === "output_text" && typeof part.text === "string") {
              return part.text;
            }
          }
        }
      }
    }
  }

  throw new Error("Could not extract text from OpenAI response");
}

function buildFileContent(base64Data: string, mimeType: string) {
  if (mimeType === "application/pdf") {
    return {
      type: "input_file" as const,
      filename: "recipe.pdf",
      file_data: `data:application/pdf;base64,${base64Data}`,
    };
  }

  return {
    type: "input_image" as const,
    image_url: `data:${mimeType};base64,${base64Data}`,
  };
}

export async function openaiVision(
  apiKey: string,
  model: string,
  prompt: string,
  base64Data: string,
  mimeType: string,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            buildFileContent(base64Data, mimeType),
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const json = await response.json();
  return extractOutputText(json);
}

export async function openaiText(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const json = await response.json();
  return extractOutputText(json);
}
