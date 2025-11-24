"use server"

import { generateObject } from "ai"
import { z } from "zod"
import { openai } from "@ai-sdk/openai"

const schema = z.object({
  isValid: z.boolean().describe("Whether the item belongs to the category"),
  normalizedName: z
    .string()
    .describe("The canonical name of the item in the requested language (e.g. capitalized, singular form)"),
  reason: z
    .string()
    .optional()
    .describe('Short reason if rejected (e.g., "Too vague", "Not a fish", "Does not exist")'),
  isSpecificEnough: z
    .boolean()
    .describe(
      'Whether the answer is specific enough (e.g., "Car" is too vague for "Car Brands", but "Toyota" is good)',
    ),
})

export async function checkGuess(category: string, guess: string, language = "en") {
  try {
    const prompt = `
      Game: Infinite Guesser.
      Language: ${language === "sv" ? "Swedish" : "English"}.
      Category: "${category}".
      User Guess: "${guess}".
      
      Task: Determine if the User Guess is a valid member of the Category.
      
      Rules:
      1. It must be factually correct.
      2. It must be specific enough (e.g. if category is "Car Brands", "Blue Car" is invalid, "Ford" is valid).
      3. If the language is Swedish, the guess should be evaluated in Swedish context but English universally recognized terms are okay.
      4. Return the "normalizedName" formatted nicely (Title Case) in the target language.
      5. If invalid, provide a short, fun reason in ${language === "sv" ? "Swedish" : "English"}.
    `

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema,
      prompt,
    })

    return {
      isValid: object.isValid && object.isSpecificEnough,
      normalizedName: object.normalizedName,
      reason: !object.isSpecificEnough ? (language === "sv" ? "För otydligt" : "Too vague") : object.reason,
    }
  } catch (error) {
    console.error("AI Error:", error)
    return {
      isValid: false,
      normalizedName: guess,
      reason: language === "sv" ? "Kunde inte verifiera" : "Could not verify",
    }
  }
}

export async function getSuggestions(language = "en") {
  const prompt = `Generate 5 fun, diverse, and popular categories for a guessing game in ${language === "sv" ? "Swedish" : "English"}. Return just a JSON array of strings.`

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: z.object({ categories: z.array(z.string()) }),
      prompt,
    })
    return object.categories
  } catch (e) {
    return language === "sv"
      ? ["Djur", "Bilmärken", "Länder", "Frukter", "Harry Potter Karaktärer"]
      : ["Animals", "Car Brands", "Countries", "Fruits", "Harry Potter Characters"]
  }
}
