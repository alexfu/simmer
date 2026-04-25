import { getSettings } from "@/lib/settings";
import {
  extractRecipeFromFile,
  extractRecipeFromText,
} from "@/lib/ai/extract-recipe";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const mode = formData.get("mode")?.toString() ?? "file";
  const collectDiagnostics = formData.get("diagnostics") === "true";

  const settings = await getSettings();
  if (!settings) {
    return Response.json(
      { error: "Please configure your AI provider in Settings first." },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      }

      function onProgress(phase: string) {
        sendEvent({ type: "progress", phase });
      }

      const filePhases = [
        { key: "ocr", label: "Extracting text" },
        { key: "structure", label: "Parsing recipe" },
        { key: "split", label: "Organizing ingredients" },
        { key: "tagging", label: "Linking ingredients" },
        { key: "done", label: "Done" },
      ];

      const textPhases = [
        { key: "structure", label: "Parsing recipe" },
        { key: "split", label: "Organizing ingredients" },
        { key: "tagging", label: "Linking ingredients" },
        { key: "done", label: "Done" },
      ];

      sendEvent({
        type: "phases",
        phases: mode === "text" ? textPhases : filePhases,
      });

      try {
        if (mode === "text") {
          const text = formData.get("text")?.toString().trim() ?? "";
          if (!text) {
            sendEvent({
              type: "error",
              message: "Please paste some recipe text.",
            });
            controller.close();
            return;
          }

          const result = await extractRecipeFromText(
            text,
            settings,
            collectDiagnostics,
            onProgress,
          );

          sendEvent({
            type: "result",
            data: result.recipe,
            diagnosticLog: result.diagnosticLog ?? null,
          });
        } else {
          const file = formData.get("file") as File | null;

          if (!file || file.size === 0) {
            sendEvent({ type: "error", message: "Please select a file." });
            controller.close();
            return;
          }

          if (!ALLOWED_TYPES.includes(file.type)) {
            sendEvent({
              type: "error",
              message:
                "Unsupported file type. Please upload an image (JPEG, PNG, WebP) or PDF.",
            });
            controller.close();
            return;
          }

          if (file.size > MAX_FILE_SIZE) {
            sendEvent({
              type: "error",
              message: "File is too large. Maximum size is 10MB.",
            });
            controller.close();
            return;
          }

          const buffer = Buffer.from(await file.arrayBuffer());
          const base64 = buffer.toString("base64");

          const result = await extractRecipeFromFile(
            { base64, mimeType: file.type },
            settings,
            collectDiagnostics,
            onProgress,
          );

          sendEvent({
            type: "result",
            data: result.recipe,
            diagnosticLog: result.diagnosticLog ?? null,
          });
        }
      } catch (error) {
        sendEvent({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Import failed. Please try again.",
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
