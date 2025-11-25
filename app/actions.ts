"use server"

import { generateObject } from "ai"
import { z } from "zod"
import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai"
import { headers } from "next/headers"

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

export async function checkGuess(category: string, guess: string) {
  const headerList = await headers().catch((e) => {
    console.error(e)
    return null
  })
  const acceptLanguage = headerList
    ? headerList.get("Accept-Language") || "en"
    : "en"

  try {
    const prompt = `
      Game: Infinite Guesser.
      User Accepted Languages: "${acceptLanguage}".
      Category: "${category}".
      User Guess: "${guess}".

      Task: Determine if the User Guess is a valid member of the Category.

      Rules:
      1. It must be factually correct.
      2. It must be specific enough (e.g. if category is "Car Brands", "Blue Car" is invalid, "Ford" is valid).
      3. Respond in the same language as the category (preferred) or accepted languages.
      4. Return the "normalizedName" formatted nicely (Title Case) in the same language as the input.
      5. If invalid, provide a short, fun reason in the same language as the category (preferred) or accepted languages.
    `

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
  console.log("Detected accepted languages:", languages)

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
