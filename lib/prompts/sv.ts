export const swedishPromptTemplate = {
  languageCode: "sv",
  languageName: "Swedish",

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
        ? `\n      Tidigare godkända svar i denna spelomgång: ${previousItems.join(", ")}.
      Använd detta för att:
      - Upptäcka om gissningen är en dubblett, felstavning eller omformulering av ett redan listat svar.
      - Vara konsekvent med namngivningsstilen som använts för tidigare svar.
      - Förstå vilken specificitetsnivå som har godkänts.`
        : ""

    return `
      Spel: Infinite Guesser.
      Kategori: "${category}".
      Användarens gissning: "${guess}".${previousItemsSection}

      Uppgift: Avgör om användarens gissning är en giltig medlem av kategorin, och kontrollera om det är en dubblett.

      Regler:
      1. Svaret måste vara faktamässigt korrekt.
      2. Svaret måste vara tillräckligt specifikt (t.ex. om kategorin är "Bilmärken", är "Blå Bil" ogiltigt, men "Ford" är giltigt).
      3. Alla svar måste vara på svenska.
      4. Returnera "normalizedName" snyggt formaterat (versaler på första bokstaven) på svenska.
      5. Om svaret är ogiltigt, ge en kort och rolig anledning på svenska.
      6. Kontrollera om gissningen är en dubblett av ett tidigare godkänt svar. Detta inkluderar:
         - Exakta matchningar (skiftlägesokänslig)
         - Felstavningar (t.ex. "Toyata" är en dubblett av "Toyota")
         - Olika formuleringar eller synonymer som refererar till samma sak (t.ex. "Sthlm" och "Stockholm")
         - Förkortningar eller fullständiga former av befintliga svar
      7. Om isDuplicate är true, sätt duplicateOf till det matchande svaret från listan över tidigare godkända svar.
    `
  },
}
