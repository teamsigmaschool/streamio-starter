const { z } = require("zod");
const { registry, tools } = require("./tools");

const AI_URL = "https://api.groq.com/openai/v1/chat/completions";
const AI_KEY = process.env.GROQ_API_KEY;
const AI_MODEL = "openai/gpt-oss-120b";

async function askGroq(messages, options) {
  try {
    const response = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: messages,
        max_completion_tokens: 1000,
        ...options,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.log("status:", response.status, await response.text());
      return null;
    }
    const data = await response.json();
    return data.choices[0].message;
  } catch (error) {
    console.log("AI request failed:", error.name);
    return null;
  }
}

async function runTool(call, viewer) {
  const name = call.function.name;
  if (!Object.keys(registry).includes(name)) {
    console.log("tool:", name, "failed: unknown tool");
    return { error: `There is no tool called ${name}` };
  }
  const tool = registry[name];

  let args;
  try {
    args = JSON.parse(call.function.arguments);
  } catch {
    console.log("tool:", name, "failed: arguments were not JSON");
    return { error: "Your arguments were not valid JSON" };
  }

  const result = tool.schema.safeParse(args);
  if (!result.success) {
    console.log("tool:", name, args, "failed:", z.prettifyError(result.error));
    return { error: z.prettifyError(result.error) };
  }

  try {
    const output = await tool.run(result.data, viewer);
    console.log("tool:", name, args, "ok");
    return output;
  } catch (error) {
    console.log("tool:", name, args, "failed:", error.message);
    return { error: `${name} isn't working right now, try again later` };
  }
}

function systemPromptFor(viewer) {
  const watched = viewer.list.filter((item) => item.watched).map((item) => item.title);
  const saved = viewer.list.filter((item) => !item.watched).map((item) => item.title);

  return `You are the Streamio assistant. You help one viewer choose what to watch tonight.

The viewer is ${viewer.name}. Favourite genres: ${viewer.favourite_genres}.
Already watched: ${watched.join(", ") || "nothing yet"}.
Already on their watchlist: ${saved.join(", ") || "nothing yet"}.

Rules:
- If the viewer only greets you or makes small talk, reply in one short sentence and ask what they're in the mood for. Don't call any tools.
- If they don't name a genre, search their first favourite genre.
- Before you say whether Streamio has a show, check with search_shows.
- Only recommend shows that a tool returned. Never make up a show.
- Never recommend a show they have watched or already saved.
- Recommend one show unless they ask for more.

Answer in two or three sentences of plain text: the title, how long it is, and why it suits them.`;
}

const ONE_STEP = "I can only do one lookup per message. Ask me again, one thing at a time.";

async function runAgent(viewer, conversation) {
  const history = conversation.filter((m) => m.role === "user" || m.role === "assistant");
  const messages = [{ role: "system", content: systemPromptFor(viewer) }, ...history];

  const first = await askGroq(messages, { tools: tools });
  if (!first) return null;
  if (!first.tool_calls) return first.content;

  const call = first.tool_calls[0];
  const output = await runTool(call, viewer);
  messages.push(first);
  messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });

  const second = await askGroq(messages, { tools: tools });
  if (!second) return null;
  if (second.tool_calls) return ONE_STEP;
  return second.content;
}

const Picks = z.object({
  picks: z
    .array(
      z.object({
        title: z.string(),
        reason: z.string().describe("One sentence on why it suits the viewer"),
      })
    )
    .describe("Every show the reply recommends, in order. Empty if it recommends none"),
});

async function toPicks(reply) {
  const message = await askGroq(
    [
      { role: "system", content: "List the shows this reply recommends. Only use what the reply says. If it recommends no show, return an empty list." },
      { role: "user", content: reply },
    ],
    {
      response_format: {
        type: "json_schema",
        json_schema: { name: "picks", strict: true, schema: z.toJSONSchema(Picks) },
      },
    }
  );
  if (!message) return null;

  let data;
  try {
    data = JSON.parse(message.content);
  } catch {
    console.log("picks: not valid JSON");
    return null;
  }

  const result = Picks.safeParse(data);
  if (!result.success) {
    console.log("picks:", z.prettifyError(result.error));
    return null;
  }
  return result.data.picks.filter((pick) => reply.includes(pick.title));
}

module.exports = { runAgent, toPicks };
