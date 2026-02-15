// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ElevenLabs voice IDs for each persona
const VOICE_MAP: Record<string, string> = {
  drill_sergeant: "pNInz6obpgDQGcFmaJgB", // Adam — strong/commanding
  hype_beast: "EXAVITQu4vr4xnSDxMaL",     // Bella — energetic
  gentle_guide: "21m00Tcm4TlvDq8ikWAM",    // Rachel — calm/soothing
};

const PERSONA_PROMPTS: Record<string, string> = {
  drill_sergeant: `You are a tough-love accountability coach. You're like a drill sergeant who genuinely cares. Be direct, no-nonsense, and push the user hard. Use short, punchy sentences. Think R. Lee Ermey meets Tony Robbins. Keep responses under 3 sentences.`,
  hype_beast: `You are an ultra-hyped motivational coach. Everything is AMAZING and INCREDIBLE. Use lots of energy, exclamation marks, and slang. Think Gary Vee meets your most supportive friend. Keep responses under 3 sentences.`,
  gentle_guide: `You are a calm, mindful accountability partner. Speak gently and supportively. Use zen-like wisdom and encourage self-compassion while still promoting action. Think meditation teacher meets life coach. Keep responses under 3 sentences.`,
};

const TRIGGER_CONTEXT: Record<string, string> = {
  morning_reminder: "The user hasn't submitted their proof yet today. Remind them.",
  streak_broken: "The user just broke their streak. They missed a day.",
  proof_verified: "The user just had their proof approved! Celebrate with them.",
  proof_rejected: "The user's proof was rejected. Encourage them to try again.",
  pool_won: "The user just won a pool challenge! They get their stake back plus winnings.",
  pool_joined: "The user just joined a new stake pool. Hype them up for the challenge.",
  milestone_streak: "The user hit a streak milestone. Congratulate them.",
  idle_reminder: "The user hasn't opened the app in a while. Welcome them back.",
};

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
    const { user_id, persona, trigger, context } = await req.json();

    if (!user_id || !trigger) {
      return new Response(
        JSON.stringify({ error: "user_id and trigger are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const personaKey = persona || "drill_sergeant";
    const systemPrompt = PERSONA_PROMPTS[personaKey] || PERSONA_PROMPTS.drill_sergeant;
    const triggerCtx = TRIGGER_CONTEXT[trigger] || `Trigger: ${trigger}`;

    let message = getDefaultMessage(personaKey, trigger);
    let audio: string | null = null;

    // Generate AI message if Gemini is available
    if (GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const userPrompt = `${triggerCtx}${context ? `\nAdditional context: ${JSON.stringify(context)}` : ""}\n\nRespond in character. Keep it short (1-3 sentences max).`;

        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 150 },
          }),
        });

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) message = text.trim();
        }
      } catch (aiErr) {
        console.error("Gemini error:", aiErr);
      }
    }

    // Generate voice audio if ElevenLabs is available
    if (ELEVENLABS_API_KEY && message) {
      try {
        const voiceId = VOICE_MAP[personaKey] || VOICE_MAP.drill_sergeant;
        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: message,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          }
        );

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        }
      } catch (ttsErr) {
        console.error("ElevenLabs error:", ttsErr);
      }
    }

    // Save coach message to DB (non-blocking)
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from("coach_messages").insert({
        user_id,
        persona: personaKey,
        trigger,
        message,
        has_audio: !!audio,
      });
    } catch {
      // Non-critical — don't fail the response
    }

    return new Response(
      JSON.stringify({ message, audio, persona: personaKey, trigger }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("voice-coach error:", err);
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

function getDefaultMessage(persona: string, trigger: string): string {
  const defaults: Record<string, Record<string, string>> = {
    drill_sergeant: {
      morning_reminder: "Rise and shine! Your pool is waiting. Get that proof in NOW — no excuses.",
      streak_broken: "You broke your streak. That's on you. Now get back up and don't let it happen again.",
      proof_verified: "Proof accepted. That's what I like to see. Keep that energy going, soldier.",
      proof_rejected: "Proof rejected. Try again. I know you can do better than that.",
      pool_won: "VICTORY! You crushed it. Collect your winnings — you earned every lamport.",
      pool_joined: "New pool, new challenge. I expect nothing less than 100% from you. Let's go.",
      milestone_streak: "That's a serious streak. You're proving you've got what it takes. Don't stop.",
      idle_reminder: "Where have you been?! Your habits don't build themselves. Get back in here.",
    },
    hype_beast: {
      morning_reminder: "GOOD MORNING CHAMPION! Time to crush it! Get that proof submitted! 🔥",
      streak_broken: "Hey, streaks break — but LEGENDS bounce back! Let's get it TODAY! 💪",
      proof_verified: "YOOO your proof just got VERIFIED! You're absolutely KILLING IT! 🎉",
      proof_rejected: "No worries fam! Just retake that proof — you got this EASY! 📸",
      pool_won: "WINNER WINNER! You just WON the pool! SOL incoming! 🏆💰",
      pool_joined: "LET'S GOOOO! New pool joined! This is YOUR challenge to dominate! ⚡",
      milestone_streak: "STREAK MILESTONE! You're literally UNSTOPPABLE right now! 🔥🔥🔥",
      idle_reminder: "We MISS you! Come back and keep that energy going! The pools need you! 🙌",
    },
    gentle_guide: {
      morning_reminder: "Good morning. A new day, a new opportunity. When you're ready, share your proof.",
      streak_broken: "Streaks come and go, but your commitment endures. Take a breath and begin again.",
      proof_verified: "Your proof has been accepted. Well done — each step forward matters.",
      proof_rejected: "This proof didn't pass, but that's okay. Try once more with kindness toward yourself.",
      pool_won: "Congratulations on completing your challenge. Your dedication has been rewarded.",
      pool_joined: "You've taken a beautiful step by joining this pool. Trust in your ability.",
      milestone_streak: "What a meaningful milestone. Your consistency speaks volumes about your character.",
      idle_reminder: "Welcome back. There's no judgment here — only the next step whenever you're ready.",
    },
  };

  return defaults[persona]?.[trigger] || defaults.drill_sergeant?.[trigger] || "Let's get it done. You've got this.";
}
