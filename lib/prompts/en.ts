export const englishPromptTemplate = {
  languageCode: "en",
  languageName: "English",

  buildPrompt: ({
    category,
    guess,
    acceptLanguage,
    previousItems,
  }: {
    category: string
    guess: string
    acceptLanguage: string
    previousItems: string[]
  }) => {
    const previousItemsSection =
      previousItems.length > 0
        ? `\n      Previously accepted items in this game session: ${previousItems.join(", ")}.
      Use this context to:
      - Avoid accepting duplicates or variations of already listed items.
      - Be consistent with the naming style used for previous items.
      - Understand what specificity level has been accepted.`
        : ""

    return `
      Game: Infinite Guesser.
      User Accepted Languages: "${acceptLanguage}".
      Category: "${category}".
      User Guess: "${guess}".${previousItemsSection}

      Task: Determine if the User Guess is a valid member of the Category.

      Rules:
      1. It must be factually correct.
      2. It must be specific enough (e.g. if category is "Car Brands", "Blue Car" is invalid, "Ford" is valid).
      3. Respond in the same language as the category (preferred) or accepted languages.
      4. Return the "normalizedName" formatted nicely (Title Case) in the same language as the input.
      5. If invalid, provide a short, fun reason in the same language as the category (preferred) or accepted languages.
      6. If the guess is essentially a duplicate of a previously accepted item (even with different spelling or phrasing), reject it.
    `
  },
}
