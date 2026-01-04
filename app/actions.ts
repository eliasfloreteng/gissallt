"use server"

import { generateObject } from "ai"
import { z } from "zod"
import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai"
import { headers } from "next/headers"
import { getPromptTemplate, promptTemplates, defaultTemplate } from "@/lib/prompts"

const schema = z.object({
  isValid: z.boolean().describe("Whether the item belongs to the category"),
  normalizedName: z
    .string()
    .describe(
      "The canonical name of the item in the requested language (e.g. capitalized, singular form)"
    ),
  reason: z
    .string()
    .optional()
    .describe(
      'Short reason if rejected (e.g., "Too vague", "Not a fish", "Does not exist")'
    ),
  isSpecificEnough: z
    .boolean()
    .describe(
      'Whether the answer is specific enough (e.g., "Car" is too vague for "Car Brands", but "Toyota" is good)'
    ),
})

const languageDetectionSchema = z.object({
  languageCode: z
    .string()
    .describe("The ISO 639-1 language code (e.g., 'en', 'sv', 'de', 'fr')"),
  confidence: z
    .number()
    .describe("Confidence level from 0 to 1"),
})

const LANGUAGE_DETECTION_TIMEOUT = 2000 // 2 seconds timeout for language detection

async function detectLanguage(text: string): Promise<string> {
  const supportedLanguages = Object.keys(promptTemplates)

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Language detection timeout")), LANGUAGE_DETECTION_TIMEOUT)
    })

    const detectionPromise = generateObject({
      model: openai("gpt-5.1"),
      schema: languageDetectionSchema,
      prompt: `Detect the language of this text and return the ISO 639-1 language code.

      Text: "${text}"

      Supported languages: ${supportedLanguages.join(", ")}

      If the language is not in the supported list or you're unsure, return "en" (English).`,
      providerOptions: {
        openai: {
          reasoningEffort: "none",
          reasoningSummary: null,
          textVerbosity: "low",
        } satisfies OpenAIResponsesProviderOptions,
      },
    })

    const { object } = await Promise.race([detectionPromise, timeoutPromise])

    // Only return the detected language if it's supported and confidence is reasonable
    if (supportedLanguages.includes(object.languageCode) && object.confidence > 0.5) {
      return object.languageCode
    }

    return "en" // Default to English
  } catch (error) {
    console.error("Language detection failed:", error)
    return "en" // Fallback to English on any error
  }
}

export async function checkGuess(
  category: string,
  guess: string,
  previousItems: string[] = []
) {
  try {
    // Detect the language of the category
    const detectedLanguage = await detectLanguage(category)

    // Get the appropriate prompt template
    const template = getPromptTemplate(detectedLanguage)

    // Build the prompt with previous items context
    const prompt = template.buildPrompt({
      category,
      guess,
      previousItems,
    })

    const { object } = await generateObject({
      model: openai("gpt-5.1"),
      schema,
      prompt,
      providerOptions: {
        openai: {
          reasoningEffort: "none",
          reasoningSummary: null,
          textVerbosity: "low",
        } satisfies OpenAIResponsesProviderOptions,
      },
    })

    return {
      isValid: object.isValid && object.isSpecificEnough,
      normalizedName: object.normalizedName,
      reason: !object.isSpecificEnough ? "Too vague" : object.reason,
    }
  } catch (error) {
    console.error("AI Error:", error)
    return {
      isValid: false,
      normalizedName: guess,
      reason: "Could not verify",
    }
  }
}

export async function getSuggestions() {
  const headerList = await headers().catch((e) => {
    console.error(e)
    return null
  })
  const acceptLanguage = headerList
    ? headerList.get("Accept-Language") || "en"
    : "en"
  const languages = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim())
    .join('", "')

  const prompt = `Generate 7 fun, diverse, and popular categories for a guessing game where you have to come up with as many items in a specific category as possible. The suggestions can be in any of these languages: "${languages}". Return just a JSON object with the "categories" key as an array of strings. Do NOT include the language in the category name.`

  try {
    const { object } = await generateObject({
      model: openai("gpt-5.1"),
      schema: z.object({ categories: z.array(z.string()) }),
      prompt,
      providerOptions: {
        openai: {
          reasoningEffort: "none",
          reasoningSummary: null,
          textVerbosity: "low",
        } satisfies OpenAIResponsesProviderOptions,
      },
    })
    return object.categories
  } catch (e) {
    console.error(e)
    return [
      "Animals",
      "Car Brands",
      "Countries",
      "Fruits",
      "Harry Potter Characters",
    ]
  }
}
