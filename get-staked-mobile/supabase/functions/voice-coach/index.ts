// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ElevenLabs voice IDs for each persona
const VOICE_MAP: Record<string, string> = {
  drill_sergeant: "TxGEqnHWrfWFTfGW9XjX", // Josh — deep male, commanding
  hype_beast: "pNInz6obpgDQGcFmaJgB",     // Adam — energetic male
  gentle_guide: "21m00Tcm4TlvDq8ikWAM",   // Rachel — warm female, calm
};

const PERSONA_PROMPTS: Record<string, string> = {
  drill_sergeant: `You are a tough-love accountability coach. You're like a drill sergeant who genuinely cares. Be direct, no-nonsense, and push the user hard. Use short, punchy sentences. Think R. Lee Ermey meets Tony Robbins. Keep responses under 3 sentences. Do NOT use any markdown, asterisks, or special formatting — plain text only.`,
  hype_beast: `You are an ultra-hyped motivational coach. Everything is AMAZING and INCREDIBLE. Use lots of energy, exclamation marks, and slang. Think Gary Vee meets your most supportive friend. Keep responses under 3 sentences. Do NOT use any markdown, asterisks, or special formatting — plain text only.`,
  gentle_guide: `You are a calm, mindful accountability partner. Speak gently and supportively. Use zen-like wisdom and encourage self-compassion while still promoting action. Think meditation teacher meets life coach. Keep responses under 3 sentences. Do NOT use any markdown, asterisks, or special formatting — plain text only.`,
};

const TRIGGER_CONTEXT: Record<string, string> = {
  morning_reminder: "The user hasn't submitted their proof yet today. It's getting late. Remind them their money is on the line.",
  streak_broken: "The user just broke their streak and lost their staked SOL. Their money is gone. Acknowledge the loss but push them to join another pool and finish what they started.",
  proof_verified: "The user just had their proof approved! Their streak continues. Mention how many people have already dropped out and their money is looking real good right now.",
  proof_rejected: "The user's proof was rejected by AI. Encourage them to retake the photo with clearer evidence.",
  pool_won: "The user completed the full pool challenge! They won and earned back their stake plus winnings from people who dropped out. Celebrate big.",
  pool_joined: "The user just joined a new stake pool and put real money on the line. Mention the number of other players. Let's see who blinks first.",
  milestone_streak: "The user hit an impressive streak milestone. Their discipline is paying off. Hype them up.",
  idle_reminder: "The user hasn't opened the app in a while. Their streak is at risk. It's 6 PM and no proof yet. They have limited hours. Don't let the SOL walk away.",
  someone_failed: "Someone in the user's pool just failed. Their stake got added to the pot. The user is closer to payday.",
};

// Per-persona voice tuning
const VOICE_SETTINGS: Record<string, { stability: number; similarity_boost: number; style: number }> = {
  drill_sergeant: { stability: 0.65, similarity_boost: 0.80, style: 0.4 },
  hype_beast: { stability: 0.35, similarity_boost: 0.85, style: 0.7 },
  gentle_guide: { stability: 0.80, similarity_boost: 0.70, style: 0.2 },
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { user_id, persona, trigger, context } = await req.json();

    if (!trigger) {
      return new Response(
        JSON.stringify({ error: "trigger is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const personaKey = persona || "drill_sergeant";
    const systemPrompt = PERSONA_PROMPTS[personaKey] || PERSONA_PROMPTS.drill_sergeant;
    const triggerCtx = TRIGGER_CONTEXT[trigger] || `Trigger: ${trigger}`;

    // --- 1. Generate AI message via Gemini (fallback to defaults) ---
    let message = getDefaultMessage(personaKey, trigger);

    if (GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        const userPrompt = `${triggerCtx}${context ? `\nAdditional context: ${JSON.stringify(context)}` : ""}\n\nRespond in character. Keep it short (1-3 sentences max). Plain text only, no markdown.`;

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
        } else {
          console.error("Gemini HTTP error:", geminiResponse.status, await geminiResponse.text());
        }
      } catch (aiErr) {
        console.error("Gemini error:", aiErr);
      }
    }

    // --- 2. Generate voice audio via ElevenLabs TTS ---
    let audio: string | null = null;

    if (ELEVENLABS_API_KEY && message) {
      try {
        const voiceId = VOICE_MAP[personaKey] || VOICE_MAP.drill_sergeant;
        const settings = VOICE_SETTINGS[personaKey] || VOICE_SETTINGS.drill_sergeant;

        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": ELEVENLABS_API_KEY,
              "Accept": "audio/mpeg",
            },
            body: JSON.stringify({
              text: message,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: settings.stability,
                similarity_boost: settings.similarity_boost,
                style: settings.style,
                use_speaker_boost: true,
              },
            }),
          }
        );

        if (ttsResponse.ok) {
          const audioBuffer = await ttsResponse.arrayBuffer();
          // Convert to base64 in chunks to avoid stack overflow on large audio
          const bytes = new Uint8Array(audioBuffer);
          let binary = "";
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
          }
          audio = btoa(binary);
        } else {
          const errBody = await ttsResponse.text();
          console.error(`ElevenLabs API error (${ttsResponse.status}):`, errBody);
        }
      } catch (ttsErr) {
        console.error("ElevenLabs TTS error:", ttsErr);
      }
    } else if (!ELEVENLABS_API_KEY) {
      console.warn("ELEVENLABS_API_KEY not set — skipping TTS");
    }

    // --- 3. Save coach message to DB (non-blocking) ---
    if (user_id) {
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
    }

    return new Response(
      JSON.stringify({ message, audio, persona: personaKey, trigger }),
      {
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  } catch (err) {
    console.error("voice-coach error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }
});

function getDefaultMessage(persona: string, trigger: string): string {
  const defaults: Record<string, Record<string, string>> = {
    drill_sergeant: {
      morning_reminder: "Hey. It's getting late and I haven't seen your proof yet. You've got limited hours. Don't let your SOL walk away.",
      streak_broken: "Streak broken. SOL gone. But you showed discipline for days. Join another pool and finish what you started.",
      proof_verified: "Proof accepted. You're on fire. 2 people already dropped out — their money is looking real good right now.",
      proof_rejected: "Proof rejected. Try again with better evidence. I know you can do better than that.",
      pool_won: "YOU DID IT! That discipline just earned you SOL. Winners get paid.",
      pool_joined: "Alright, you just staked SOL. Others are in the pool. Let's see who blinks first.",
      milestone_streak: "That's a serious streak. You're proving you've got what it takes. Don't stop now.",
      idle_reminder: "Where have you been?! Your streak is at risk. Get back in here NOW.",
      someone_failed: "One down. Their stake just got added to the pot. You're closer to payday.",
      default: "No excuses. Get in there and crush your goals. That's an order.",
    },
    hype_beast: {
      morning_reminder: "YO CHAMPION! Time is ticking! Get that proof submitted and keep the streak ALIVE! 🔥",
      streak_broken: "Hey, streaks break — but LEGENDS bounce back! Let's get it TODAY! 💪",
      proof_verified: "YOOO your proof just got VERIFIED! You're absolutely KILLING IT! 🎉",
      proof_rejected: "No worries fam! Just retake that proof with clearer evidence — you got this EASY! 📸",
      pool_won: "WINNER WINNER! You just WON the pool! SOL incoming! 🏆💰",
      pool_joined: "LET'S GOOOO! You just put your money where your mouth is! ⚡",
      milestone_streak: "STREAK MILESTONE! You're literally UNSTOPPABLE right now! 🔥🔥🔥",
      idle_reminder: "We MISS you! Your streak is fading! Come back and keep that FIRE going! 🙌",
      someone_failed: "Someone just DROPPED! Their stake is in the pot now! You're getting CLOSER to that bag! 💰",
      default: "You're literally built different! Keep going, legend! 🚀",
    },
    gentle_guide: {
      morning_reminder: "Good morning. A new day, a new opportunity. When you're ready, share your proof. Your consistency matters.",
      streak_broken: "Streaks come and go, but your commitment endures. Take a breath and begin again with a new pool.",
      proof_verified: "Your proof has been accepted. Well done — each step forward matters. Keep going at your own pace.",
      proof_rejected: "This proof didn't quite pass. That's okay. Try once more with clearer evidence. You've got this.",
      pool_won: "Congratulations on completing your challenge. Your dedication has been rewarded. You earned this.",
      pool_joined: "You've taken a beautiful step by joining this pool. Trust in your ability to show up every day.",
      milestone_streak: "What a meaningful milestone. Your consistency speaks volumes about your character.",
      idle_reminder: "Welcome back. There's no judgment here — only the next step whenever you're ready.",
      someone_failed: "Someone in your pool couldn't keep up. Their loss adds to your potential reward. Stay steady.",
      default: "Remember, progress is a gentle river. Keep flowing forward at your own pace.",
    },
  };

  return defaults[persona]?.[trigger] || defaults[persona]?.default || defaults.drill_sergeant?.[trigger] || "Let's get it done. You've got this.";
}
