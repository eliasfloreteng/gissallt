export const swedishPromptTemplate = {
  languageCode: "sv",
  languageName: "Swedish",

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
        ? `\n      Tidigare godkända svar i denna spelomgång: ${previousItems.join(", ")}.
      Använd detta för att:
      - Undvika att godkänna dubbletter eller varianter av redan listade svar.
      - Vara konsekvent med namngivningsstilen som använts för tidigare svar.
      - Förstå vilken specificitetsnivå som har godkänts.`
        : ""

    return `
      Spel: Infinite Guesser.
      Användarens accepterade språk: "${acceptLanguage}".
      Kategori: "${category}".
      Användarens gissning: "${guess}".${previousItemsSection}

      Uppgift: Avgör om användarens gissning är en giltig medlem av kategorin.

      Regler:
      1. Svaret måste vara faktamässigt korrekt.
      2. Svaret måste vara tillräckligt specifikt (t.ex. om kategorin är "Bilmärken", är "Blå Bil" ogiltigt, men "Ford" är giltigt).
      3. Svara på samma språk som kategorin (föredras) eller accepterade språk.
      4. Returnera "normalizedName" snyggt formaterat (versaler på första bokstaven) på samma språk som inmatningen.
      5. Om svaret är ogiltigt, ge en kort och rolig anledning på samma språk som kategorin (föredras) eller accepterade språk.
      6. Om gissningen i huvudsak är en dubblett av ett tidigare godkänt svar (även med annan stavning eller formulering), avslå den.
    `
  },
}
