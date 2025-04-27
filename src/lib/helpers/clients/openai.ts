import { requestUrl } from "obsidian";

const dollarRate = 145;
// GPT-4.1
const inputTokensDollarPerMillion = 2;
const outputTokensDollarPerMillion = 8;

interface Result {
  text: string;
  costYen: number;
}

export async function fetchOpenAIChatCompletion(args: {
  systemMessage: string;
  userMessage: string;
  apiKey: string;
}): Promise<Result> {
  const request = {
    url: "https://api.openai.com/v1/responses",
    method: "POST",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      instructions: args.systemMessage,
      input: args.userMessage,
      temperature: 0,
    }),
  };

  try {
    const res = await requestUrl(request);
    const text = res.json.output[0].content[0].text as string;

    const { input_tokens, output_tokens } = res.json.usage;
    const costYen =
      (input_tokens / 1000000) * inputTokensDollarPerMillion * dollarRate +
      (output_tokens / 1000000) * outputTokensDollarPerMillion * dollarRate;
    return { text, costYen };
  } catch (e) {
    console.error(request);
    throw e;
  }
}
