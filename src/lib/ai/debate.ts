import { flashModel } from "./gemini";
import { buildPersonaPrompt, PERSONAS } from "@/lib/prompts/personas";
import type {
  AnalysisResult,
  PersonaResult,
  PersonaKey,
  Stance,
} from "@/types";

const VALID_STANCES: Stance[] = [
  "strongly_agree",
  "agree",
  "neutral",
  "disagree",
  "strongly_disagree",
];

export async function generatePersonaArgument(
  persona: PersonaKey,
  signalTitle: string,
  verdict: string,
  reasoning: string,
  analysis: AnalysisResult
): Promise<PersonaResult> {
  const prompt = buildPersonaPrompt(
    persona,
    signalTitle,
    verdict as "Build" | "Invest" | "Ignore",
    reasoning,
    analysis
  );
  const result = await flashModel.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonText = text.startsWith("```")
    ? text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    : text;

  const parsed = JSON.parse(jsonText) as PersonaResult;

  return {
    stance: VALID_STANCES.includes(parsed.stance) ? parsed.stance : "neutral",
    argument: parsed.argument || "",
    quote: parsed.quote || "",
  };
}

export async function generateAllPersonas(
  signalTitle: string,
  verdict: string,
  reasoning: string,
  analysis: AnalysisResult
): Promise<
  Array<{
    persona: PersonaKey;
    personaName: string;
    stance: Stance;
    argument: string;
    quote: string;
  }>
> {
  const personaKeys: PersonaKey[] = ["innovator", "traditionalist", "analyst"];

  const results = await Promise.all(
    personaKeys.map(async (persona) => {
      const result = await generatePersonaArgument(
        persona,
        signalTitle,
        verdict,
        reasoning,
        analysis
      );
      return {
        persona,
        personaName: PERSONAS[persona].name,
        stance: result.stance,
        argument: result.argument,
        quote: result.quote,
      };
    })
  );

  return results;
}
