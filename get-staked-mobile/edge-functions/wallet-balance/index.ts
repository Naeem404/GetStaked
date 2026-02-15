// @ts-nocheck — This file runs on Deno (Supabase Edge Functions), not Node.js
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SOLANA_RPC_URL = Deno.env.get("SOLANA_RPC_URL") || "https://api.devnet.solana.com";

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
    const { public_key } = await req.json();

    if (!public_key) {
      return new Response(
        JSON.stringify({ error: "public_key is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call Solana JSON-RPC getBalance
    const rpcResponse = await fetch(SOLANA_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [public_key],
      }),
    });

    const rpcData = await rpcResponse.json();

    if (rpcData.error) {
      return new Response(
        JSON.stringify({ error: rpcData.error.message, balance: 0 }),
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Convert lamports to SOL (1 SOL = 1_000_000_000 lamports)
    const lamports = rpcData.result?.value ?? 0;
    const balance = lamports / 1_000_000_000;

    return new Response(
      JSON.stringify({ balance, lamports }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("wallet-balance error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message, balance: 0 }),
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
