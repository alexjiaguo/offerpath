import { NextResponse } from "next/server";
import { serverCallLLM, getEnvKey } from "@/lib/ai-providers";

// Fallback logic for when real AI isn't hooked up
function extractFallbackJob(text: string) {
  return {
    title: text.includes("Manager") ? "Product Manager" : text.includes("Engineer") ? "Software Engineer" : "Unknown Title",
    company: text.includes("Google") ? "Google" : text.includes("Meta") ? "Meta" : "Unknown Company",
    location: text.includes("Remote") ? "Remote" : "Unknown Location",
    salary_range: text.includes("$") ? "$100k - $150k" : "",
    notes: "Auto-extracted from provided text.",
  };
}

export async function POST(request: Request) {
  try {
    const { text, llmConfig } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Job description text is required" }, { status: 400 });
    }

    const provider = llmConfig?.provider || "openai";
    const apiKey = llmConfig?.apiKey || getEnvKey(provider);

    if (apiKey) {
      const systemPrompt = `You are an AI job parser. Extract the following details from the job description and return ONLY valid JSON:
      {
        "title": "Job Title",
        "company": "Company Name",
        "location": "Location or Remote",
        "salary_range": "Salary range if mentioned, else empty string",
        "notes": "A brief 2 sentence summary of the role"
      }`;

      try {
        const response = await serverCallLLM(provider, apiKey, systemPrompt, text);
        // Find JSON block
        const startIdx = response.indexOf("{");
        const endIdx = response.lastIndexOf("}");
        
        if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
          const jsonStr = response.substring(startIdx, endIdx + 1);
          const parsedJob = JSON.parse(jsonStr);
          return NextResponse.json({ job: parsedJob });
        }
      } catch (err) {
        console.error("AI Parse error, falling back to mock:", err);
      }
    }

    // Naive fallback parsing for the demo if no key or error
    const parsedJob = extractFallbackJob(text);
    return NextResponse.json({ job: parsedJob });
  } catch (error) {
    console.error("Job parse error:", error);
    return NextResponse.json({ error: "Failed to parse job description" }, { status: 500 });
  }
}
