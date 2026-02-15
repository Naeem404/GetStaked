// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Confidence thresholds
const AUTO_APPROVE_THRESHOLD = 0.70;  // >= 0.70 → auto-approve
const AUTO_REJECT_THRESHOLD = 0.30;   // <= 0.30 → auto-reject
// Between 0.30 and 0.70 → needs_review (ask a friend)

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
    const { proof_id, image_url, proof_description, pool_name, pool_id, user_id } = await req.json();

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
        // Chunked base64 encoding to avoid stack overflow on large images
        const bytes = new Uint8Array(imageBuffer);
        let binary = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
        }
        const base64Image = btoa(binary);
        const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

        // Call Gemini 2.0 Flash with vision
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const prompt = `You are a strict but fair habit verification AI for the app "Get Staked."

The user claims to have completed this habit: "${pool_name || 'Unknown'}"
Their proof description requirement is: "${proof_description || 'Complete the required activity'}"

Analyze this photo and determine:
1. Does this photo show evidence of the claimed habit being completed?
2. Is this a real, freshly taken photo (not a screenshot of an old photo, not a stock image)?
3. Confidence score from 0-100

Respond in JSON format ONLY:
{
  "verified": true/false,
  "confidence": 0-100,
  "reasoning": "brief explanation",
  "flags": ["list of any suspicious elements"]
}

Be strict but reasonable. If the photo shows the person at a gym with equipment visible,
that counts for a gym habit. Don't require perfection, but do require clear evidence.`;

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
              responseMimeType: "application/json",
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
            const rawConf = result.confidence ?? 50;
            // Normalize: if Gemini returned 0-100, convert to 0-1
            confidence = rawConf > 1 ? Math.min(1, Math.max(0, rawConf / 100)) : Math.min(1, Math.max(0, rawConf));
            reasoning = result.reasoning || "AI analysis complete.";
            if (result.flags?.length) {
              flags.push(...result.flags);
            }

            // Determine status based on confidence thresholds
            if (confidence >= AUTO_APPROVE_THRESHOLD) {
              status = "approved";
            } else if (confidence <= AUTO_REJECT_THRESHOLD) {
              status = "rejected";
            } else {
              // Uncertain → needs friend review
              status = "needs_review";
              flags.push("AI confidence too low for auto-decision — sent to friend for review");
            }
          }
        } else {
          const errText = await geminiResponse.text();
          console.error("Gemini API error:", errText);
          reasoning = "Auto-approved: Gemini API returned an error.";
        }
      } catch (aiError) {
        console.error("AI verification error:", aiError);
        reasoning = `Auto-approved: AI analysis failed (${aiError}).`;
      }
    }

    // Handle the three possible outcomes
    if (status === "needs_review") {
      // Mark proof as pending review
      await supabase
        .from("proofs")
        .update({ status: "needs_review", verified_at: null })
        .eq("id", proof_id);

      // Find a friend to review (pick a random pool member who isn't the submitter)
      let reviewerId: string | null = null;

      if (pool_id && user_id) {
        // First try: another active pool member
        const { data: members } = await supabase
          .from("pool_members")
          .select("user_id")
          .eq("pool_id", pool_id)
          .eq("status", "active")
          .neq("user_id", user_id)
          .limit(5);

        if (members && members.length > 0) {
          reviewerId = members[Math.floor(Math.random() * members.length)].user_id;
        } else {
          // Fallback: pick any friend
          const { data: friends } = await supabase
            .from("friendships")
            .select("requester_id, addressee_id")
            .or(`requester_id.eq.${user_id},addressee_id.eq.${user_id}`)
            .eq("status", "accepted")
            .limit(5);

          if (friends && friends.length > 0) {
            const friendIds = friends.map((f: any) =>
              f.requester_id === user_id ? f.addressee_id : f.requester_id
            );
            reviewerId = friendIds[Math.floor(Math.random() * friendIds.length)];
          }
        }
      }

      // Create proof_review record
      if (user_id) {
        await supabase.from("proof_reviews").insert({
          proof_id,
          pool_id: pool_id || null,
          user_id,
          reviewer_id: reviewerId,
          status: "pending",
          ai_confidence: confidence,
          ai_reasoning: reasoning,
        });
      }
    } else {
      // Auto-approve or auto-reject → process normally via RPC
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
        // Fallback: direct update
        await supabase
          .from("proofs")
          .update({ status, verified_at: new Date().toISOString() })
          .eq("id", proof_id);
      }
    }

    return new Response(
      JSON.stringify({
        proof_id,
        status,
        confidence,
        reasoning,
        flags,
        needs_friend_review: status === "needs_review",
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
