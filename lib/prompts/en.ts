export const englishPromptTemplate = {
  languageCode: "en",
  languageName: "English",

  buildPrompt: ({
    category,
    guess,
    previousItems,
  }: {
    category: string
    guess: string
    previousItems: string[]
  }) => {
    const previousItemsSection =
      previousItems.length > 0
        ? `\n      Previously accepted items in this game session: ${previousItems.join(", ")}.
      Use this context to:
      - Detect if the guess is a duplicate, misspelling, or rephrasing of an already listed item.
      - Be consistent with the naming style used for previous items.
      - Understand what specificity level has been accepted.`
        : ""

    return `
      Game: Infinite Guesser.
      Category: "${category}".
      User Guess: "${guess}".${previousItemsSection}

      Task: Determine if the User Guess is a valid member of the Category, and check for duplicates.

      Rules:
      1. It must be factually correct.
      2. It must be specific enough (e.g. if category is "Car Brands", "Blue Car" is invalid, "Ford" is valid).
      3. All responses must be in English.
      4. Return the "normalizedName" formatted nicely (Title Case) in English.
      5. If invalid, provide a short, fun reason in English.
      6. Check if the guess is a duplicate of any previously accepted item. This includes:
         - Exact matches (case-insensitive)
         - Misspellings (e.g., "Toyata" is a duplicate of "Toyota")
         - Different phrasings or synonyms that refer to the same thing (e.g., "NYC" and "New York City", "VW" and "Volkswagen")
         - Abbreviations or full forms of existing items
      7. If isDuplicate is true, set duplicateOf to the matching item from the previously accepted items list.
    `
  },
}
