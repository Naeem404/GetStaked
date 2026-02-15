import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

const PERSONA_PROMPTS: Record<string, string> = {
  drill_sergeant: `You are Sarge, a tough-love drill sergeant accountability coach. You're intense, direct, and don't accept excuses. Use military metaphors. Keep responses to 2-3 punchy sentences. Be motivating through intensity.`,
  hype_beast: `You are Hype, an ultra-enthusiastic hype coach. You're excited about everything, use tons of energy, fire emojis, and slang. Keep responses to 2-3 high-energy sentences. Make the user feel like a champion.`,
  gentle_guide: `You are Sage, a calm and wise mindfulness coach. You're supportive, use gentle encouragement, and nature metaphors. Keep responses to 2-3 thoughtful sentences. Focus on the journey, not the destination.`,
};

const TRIGGER_CONTEXT: Record<string, string> = {
  morning_reminder: "The user needs their daily morning motivation to start their habit routine.",
  streak_broken: "The user just broke their streak. They need encouragement to get back on track.",
  proof_verified: "The user just had their daily proof verified successfully. Celebrate!",
  proof_rejected: "The user's proof was rejected by AI verification. Encourage them to try again.",
  pool_won: "The user completed a pool and won their stake back plus rewards!",
  pool_joined: "The user just joined a new accountability pool.",
  milestone_streak: "The user is asking how they're doing. Give them a progress report and motivation.",
  idle_reminder: "The user hasn't been active lately. Nudge them back gently.",
};

// ElevenLabs voice IDs for each persona
const VOICE_IDS: Record<string, string> = {
  drill_sergeant: "pNInz6obpgDQGcFmaJgB", // Adam - strong male
  hype_beast: "EXAVITQu4vr4xnSDxMaL",     // Bella - energetic
  gentle_guide: "21m00Tcm4TlvDq8ikWAM",    // Rachel - calm female
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { persona = "drill_sergeant", trigger = "morning_reminder", context } = await req.json();

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate coach message with Gemini
    const systemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.drill_sergeant;
    const triggerInfo = TRIGGER_CONTEXT[trigger] || "Give the user general motivation.";
    const extraContext = context ? `\nAdditional context: ${JSON.stringify(context)}` : "";

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nSituation: ${triggerInfo}${extraContext}\n\nRespond in character with a short, punchy motivational message (2-3 sentences max). Do NOT use any special formatting, markdown, or asterisks. Just plain text.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini error:", errText);
      return new Response(
        JSON.stringify({
          message: getFallbackMessage(persona, trigger),
          audio: null,
          persona,
          trigger,
          fallback: true,
        }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const message = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || getFallbackMessage(persona, trigger);

    // Generate audio with ElevenLabs (if key is set)
    let audioBase64: string | null = null;

    if (ELEVENLABS_API_KEY) {
      try {
        const voiceId = VOICE_IDS[persona] || VOICE_IDS.drill_sergeant;

        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
              "Accept": "audio/mpeg",
            },
            body: JSON.stringify({
              text: message,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: persona === "gentle_guide" ? 0.7 : 0.4,
                similarity_boost: 0.8,
                style: persona === "hype_beast" ? 0.8 : 0.5,
              },
            }),
          }
        );

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          // Convert to base64
          const uint8Array = new Uint8Array(audioBuffer);
          let binary = "";
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          audioBase64 = btoa(binary);
        } else {
          console.error("ElevenLabs error:", await ttsResponse.text());
        }
      } catch (ttsErr) {
        console.error("TTS error:", ttsErr);
      }
    }

    return new Response(
      JSON.stringify({
        message,
        audio: audioBase64,
        persona,
        trigger,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("voice-coach error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function getFallbackMessage(persona: string, trigger: string): string {
  const fallbacks: Record<string, Record<string, string>> = {
    drill_sergeant: {
      morning_reminder: "Rise and shine, soldier! Your habits won't complete themselves. Get moving NOW!",
      streak_broken: "You broke your streak? Get back up! A true warrior doesn't stay down. Start again TODAY.",
      proof_verified: "Mission accomplished! That's how it's done. Keep this momentum going, soldier!",
      default: "No excuses! Get in there and crush your goals. That's an order!",
    },
    hype_beast: {
      morning_reminder: "YOOO let's GOOO! New day, new grind! You're about to absolutely CRUSH IT! 🔥🔥🔥",
      streak_broken: "Hey, champions bounce back HARDER! This is your comeback arc! Let's GET IT! 💪",
      proof_verified: "SHEEEESH you're on FIRE! Look at you being absolutely UNSTOPPABLE! 🏆🔥",
      default: "You're literally built different! Keep going, legend! 🚀",
    },
    gentle_guide: {
      morning_reminder: "Good morning. Take a deep breath. Today is a new opportunity to nurture your growth.",
      streak_broken: "It's okay to stumble. What matters is the courage to begin again. You've got this.",
      proof_verified: "Wonderful work. Each small step is a seed planted in the garden of your growth.",
      default: "Remember, progress is a gentle river. Keep flowing forward at your own pace.",
    },
  };

  const personaFallbacks = fallbacks[persona] || fallbacks.drill_sergeant;
  return personaFallbacks[trigger] || personaFallbacks.default;
}
