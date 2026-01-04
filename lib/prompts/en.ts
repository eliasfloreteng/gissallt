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
      - Avoid accepting duplicates or variations of already listed items.
      - Be consistent with the naming style used for previous items.
      - Understand what specificity level has been accepted.`
        : ""

    return `
      Game: Infinite Guesser.
      Category: "${category}".
      User Guess: "${guess}".${previousItemsSection}

      Task: Determine if the User Guess is a valid member of the Category.

      Rules:
      1. It must be factually correct.
      2. It must be specific enough (e.g. if category is "Car Brands", "Blue Car" is invalid, "Ford" is valid).
      3. All responses must be in English.
      4. Return the "normalizedName" formatted nicely (Title Case) in English.
      5. If invalid, provide a short, fun reason in English.
      6. If the guess is essentially a duplicate of a previously accepted item (even with different spelling or phrasing), reject it.
    `
  },
}
