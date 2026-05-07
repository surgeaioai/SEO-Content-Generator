import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

import { AI_CACHE_TTL_SEC, aiPromptCacheKey, cacheGet, cacheSet } from "@/lib/cache";
import { parseJsonFromLlm } from "@/lib/json-llm";

const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const CLAUDE_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

function extractAnthropicText(response: Anthropic.Messages.Message) {
  const block = response.content.find((b) => b.type === "text");
  if (block && block.type === "text") {
    return block.text;
  }
  return "";
}

export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000,
): Promise<string> {
  if (!anthropicClient) {
    throw new Error("Anthropic API key is not configured");
  }

  const response = await anthropicClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return extractAnthropicText(response).trim();
}

export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000,
  jsonMode: boolean = false,
): Promise<string> {
  if (!openaiClient) {
    throw new Error("OpenAI API key is not configured");
  }

  const response = await openaiClient.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: maxTokens,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    ...(jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000,
  jsonMode: boolean = false,
): Promise<string> {
  if (anthropicClient) {
    const cacheKey = aiPromptCacheKey({
      provider: "anthropic",
      model: CLAUDE_MODEL,
      systemPrompt,
      userPrompt,
      maxTokens,
      jsonMode,
    });
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return cached;
    }

    const prompt = jsonMode
      ? `${userPrompt}\n\nReturn ONLY valid JSON. No markdown fences. No commentary.`
      : userPrompt;
    const output = await callClaude(systemPrompt, prompt, maxTokens);
    await cacheSet(cacheKey, output, AI_CACHE_TTL_SEC);
    return output;
  }

  if (openaiClient) {
    const cacheKey = aiPromptCacheKey({
      provider: "openai",
      model: OPENAI_MODEL,
      systemPrompt,
      userPrompt,
      maxTokens,
      jsonMode,
    });
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return cached;
    }

    const output = await callOpenAI(systemPrompt, userPrompt, maxTokens, jsonMode);
    await cacheSet(cacheKey, output, AI_CACHE_TTL_SEC);
    return output;
  }

  throw new Error("Configure ANTHROPIC_API_KEY or OPENAI_API_KEY");
}

export async function callLLMJson<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000,
): Promise<T> {
  const prefersJsonObject = Boolean(openaiClient && !anthropicClient);
  const raw = await callLLM(systemPrompt, userPrompt, maxTokens, prefersJsonObject);

  try {
    return parseJsonFromLlm<T>(raw);
  } catch {
    const retryPrompt = `${userPrompt}\n\nYour previous output was not valid JSON. Return ONLY compact valid JSON.`;
    const second = await callLLM(
      systemPrompt,
      retryPrompt,
      maxTokens,
      prefersJsonObject,
    );
    return parseJsonFromLlm<T>(second);
  }
}
