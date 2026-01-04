import { englishPromptTemplate } from "./en"
import { swedishPromptTemplate } from "./sv"

export type PromptTemplate = typeof englishPromptTemplate

export const promptTemplates: Record<string, PromptTemplate> = {
  en: englishPromptTemplate,
  sv: swedishPromptTemplate,
}

export const defaultTemplate = englishPromptTemplate

export function getPromptTemplate(languageCode: string): PromptTemplate {
  return promptTemplates[languageCode] || defaultTemplate
}
