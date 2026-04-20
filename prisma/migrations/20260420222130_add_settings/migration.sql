-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "activeProvider" TEXT NOT NULL DEFAULT 'openai',
    "openaiApiKey" TEXT,
    "geminiApiKey" TEXT,
    "anthropicApiKey" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
