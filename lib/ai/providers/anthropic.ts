type AnthropicMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp";

function buildFileContent(base64Data: string, mimeType: string) {
  if (mimeType === "application/pdf") {
    return {
      type: "document" as const,
      source: {
        type: "base64" as const,
        media_type: "application/pdf" as const,
        data: base64Data,
      },
    };
  }

  return {
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: mimeType as AnthropicMediaType,
      data: base64Data,
    },
  };
}

export async function anthropicVision(
  apiKey: string,
  model: string,
  prompt: string,
  base64Data: string,
  mimeType: string,
): Promise<string> {
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
            buildFileContent(base64Data, mimeType),
            { type: "text", text: prompt },
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

export async function anthropicText(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
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
          content: prompt,
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
