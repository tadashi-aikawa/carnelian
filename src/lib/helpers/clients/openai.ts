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
  azure?: {
    model: string;
    apiEndpoint: string;
    apiVersion: string;
  };
}): Promise<Result> {
  // Azure
  if (args.azure) {
    const res = await requestUrl({
      url: `${args.azure.apiEndpoint}/openai/deployments/${args.azure.model}/chat/completions?api-version=${args.azure.apiVersion}`,
      method: "POST",
      contentType: "application/json",
      headers: {
        "api-key": args.apiKey,
      },
      body: JSON.stringify({
        model: args.azure.model,
        messages: [
          {
            role: "developer",
            content: args.systemMessage,
          },
          {
            role: "user",
            content: args.userMessage,
          },
        ],
        temperature: 0,
      }),
    });

    const text = res.json.choices[0].message.content as string;

    const { prompt_tokens, completion_tokens } = res.json.usage;
    const costYen =
      (prompt_tokens / 1000000) * inputTokensDollarPerMillion * dollarRate +
      (completion_tokens / 1000000) * outputTokensDollarPerMillion * dollarRate;
    return { text, costYen };
  }

  // OpenAI
  const res = await requestUrl({
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
  });

  const text = res.json.output[0].content[0].text as string;

  const { input_tokens, output_tokens } = res.json.usage;
  const costYen =
    (input_tokens / 1000000) * inputTokensDollarPerMillion * dollarRate +
    (output_tokens / 1000000) * outputTokensDollarPerMillion * dollarRate;
  return { text, costYen };
}
