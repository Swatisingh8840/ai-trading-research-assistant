import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check API key inside the request
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing");

      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is missing. Make sure .env.local is in the project root and restart the server.",
        },
        { status: 500 }
      );
    }

    console.log("API key detected");

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const body = await request.json();
    const question = body?.question;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        {
          error: "Question is required.",
        },
        { status: 400 }
      );
    }

    console.log("Question received:", question);

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",

      input: [
        {
          role: "system",
          content: `
You are an AI Trading Research Assistant.

Convert the user's natural-language trading question into a structured
trading research experiment.

Extract the following:

- instrument
- timeframe
- entry condition
- exit condition
- holding period
- filter
- research question
- missing information
- assumptions

Rules:

1. Extract information explicitly provided by the user.
2. Do not invent important trading parameters.
3. Preserve percentages exactly.
4. If the user says "for 5 days", holdingPeriod must be "5 days".
5. If the user clearly describes a daily market movement, use "Daily".
6. If no filter is mentioned, use "Not specified".
7. If an important parameter is missing, include it in missingInformation.
8. Create a concise research question.
9. Return ONLY valid JSON.

Example:

User:
Does buying BANK NIFTY after a 2% fall work for 5 days?

Return:

{
  "instrument": "BANK NIFTY",
  "timeframe": "Daily",
  "entry": "BANK NIFTY falls >= 2%",
  "exit": "Close position after 5 days",
  "holdingPeriod": "5 days",
  "filter": "Not specified",
  "question": "Does buying BANK NIFTY after a 2% fall have a positive edge?",
  "missingInformation": [],
  "assumptions": []
}
          `,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    console.log("OpenAI request completed");

    const output = response.output_text;

    console.log("OpenAI output:", output);

    if (!output || !output.trim()) {
      return NextResponse.json(
        {
          error: "OpenAI returned an empty response.",
        },
        { status: 500 }
      );
    }

    let result;

    try {
      result = JSON.parse(output);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw OpenAI output:", output);

      return NextResponse.json(
        {
          error: "OpenAI returned invalid JSON.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("OPENAI ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    return NextResponse.json(
      {
        error: `OpenAI error: ${message}`,
      },
      { status: 500 }
    );
  }
}