// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { proof_id, image_url, proof_description, pool_name } = await req.json();

    if (!proof_id || !image_url) {
      return new Response(
        JSON.stringify({ error: "proof_id and image_url are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let status = "approved";
    let confidence = 0.75;
    let reasoning = "Auto-approved: AI verification not configured.";
    const flags: string[] = [];

    // If Gemini API key is set, use AI verification
    if (GEMINI_API_KEY) {
      try {
        // Fetch the image and convert to base64
        const imageResponse = await fetch(image_url);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = btoa(
          String.fromCharCode(...new Uint8Array(imageBuffer))
        );
        const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

        // Call Gemini API with vision
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const prompt = `You are a proof verification AI for an accountability app called GetStaked.

A user is submitting photo proof for a pool called "${pool_name}".
The proof requirement is: "${proof_description}"

Analyze this image and determine:
1. Does the image appear to satisfy the proof requirement?
2. Is this a real photo (not a screenshot of someone else's photo, not AI-generated)?
3. Rate your confidence from 0.0 to 1.0

Respond in JSON format ONLY:
{
  "approved": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation",
  "flags": ["list of any concerns"]
}`;

        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 500,
            },
          }),
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const text =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

          // Parse JSON from Gemini response
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            status = result.approved ? "approved" : "rejected";
            confidence = Math.min(1, Math.max(0, result.confidence || 0.5));
            reasoning = result.reasoning || "AI analysis complete.";
            if (result.flags?.length) {
              flags.push(...result.flags);
            }
          }
        } else {
          console.error("Gemini API error:", await geminiResponse.text());
          // Fallback to auto-approve
          reasoning = "Auto-approved: Gemini API returned an error.";
        }
      } catch (aiError) {
        console.error("AI verification error:", aiError);
        reasoning = `Auto-approved: AI analysis failed (${aiError}).`;
      }
    }

    // Call the RPC to process verification (handles all side effects)
    const { error: rpcError } = await supabase.rpc(
      "process_proof_verification",
      {
        p_proof_id: proof_id,
        p_status: status,
        p_confidence: confidence,
        p_reasoning: reasoning,
        p_flags: JSON.stringify(flags),
      }
    );

    if (rpcError) {
      console.error("RPC error:", rpcError);
    }

    return new Response(
      JSON.stringify({
        proof_id,
        status,
        confidence,
        reasoning,
        flags,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("verify-proof error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
