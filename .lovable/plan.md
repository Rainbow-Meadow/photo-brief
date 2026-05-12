
## What I scanned

Cloudflare doesn't expose a per-account "AI agent templates" catalog — the relevant catalog is **Workers AI models bound to your account**. I pulled the full list from `GET /accounts/{id}/ai/models/search` against your account (`6c2f1b…258284`). Result: **91 models** across text generation, vision, embeddings, ASR, TTS, image gen, classification, reranking, translation.

For reference I cross-checked against your current router (`supabase/functions/_shared/aiModelRouter.ts`), which today only uses the Lovable AI Gateway (Gemini 2.5/3, GPT-5 family) across 4 tiers: `default`, `vision`, `escalation`, `cheap`.

## Findings by tier — best Workers AI candidates

### `vision` tier (photo quality, detail extract, readiness, submission summary)
Currently: GPT-5 mini → Gemini 2.5 Flash. Workers AI multimodal options:
- **`@cf/meta/llama-4-scout-17b-16e-instruct`** — strongest multimodal on your account, MoE, good for full submission analysis
- **`@cf/meta/llama-3.2-11b-vision-instruct`** — proven, cheaper, ideal as fallback
- `@cf/google/gemma-3-12b-it` — multimodal, fast
- `@cf/llava-hf/llava-1.5-7b-hf` — last-resort budget vision

### `default` tier (recipient guidance, guide gen, follow-up drafting)
Currently: Gemini 3 Flash → GPT-5 mini. Workers AI options:
- **`@cf/meta/llama-3.3-70b-instruct-fp8-fast`** — best quality/$ on platform, JSON-friendly
- **`@cf/openai/gpt-oss-120b`** — large open-weights, instruction-tuned
- `@cf/mistralai/mistral-small-3.1-24b-instruct` — solid drafting
- `@cf/qwen/qwen3-30b-a3b-fp8` — fast MoE, good for templates

### `escalation` tier (admin re-run, low-confidence retry)
Currently: GPT-5.2 → Gemini 3.1 Pro. Workers AI reasoning options:
- **`@cf/openai/gpt-oss-120b`** — best general reasoning available
- **`@cf/qwen/qwq-32b`** — explicit reasoning model
- `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` — chain-of-thought distill
- `@cf/nvidia/nemotron-3-120b-a12b` — large MoE

### `cheap` tier (classification, routing)
Currently: GPT-5 nano. Workers AI options (much cheaper, sub-100ms):
- **`@cf/meta/llama-3.2-3b-instruct`** — sweet spot for tag/route/classify
- **`@cf/meta/llama-3.2-1b-instruct`** — ultra-cheap routing
- `@cf/huggingface/distilbert-sst-2-int8` — pure binary classification

### Net-new capabilities not in your router today
These open features you currently can't ship via the Lovable Gateway:

| Capability | Model | PhotoBrief use |
|---|---|---|
| Safety guardrail | `@cf/meta/llama-guard-3-8b` | Pre-screen recipient captions/photos for abuse before storing |
| Embeddings (multilingual) | `@cf/baai/bge-m3` | Vectorize + RAG over `photo_guides` instead of in-memory `agent.sql` |
| Reranker | `@cf/baai/bge-reranker-base` | Improve guide search precision in `assistant-agent` |
| ASR | `@cf/openai/whisper-large-v3-turbo` | Voice-note submissions from recipients |
| Live ASR | `@cf/deepgram/flux` | Real-time capture wizard transcription |
| TTS | `@cf/deepgram/aura-2-en` | Spoken playback of guide steps for hands-busy recipients |
| Image gen | `@cf/black-forest-labs/flux-2-dev` | Auto-generate "good example" reference images per guide step |

## Recommendation

Add a **`cloudflare` fallback layer** to `aiModelRouter.ts` so each tier degrades gracefully when the Lovable Gateway returns 402/429/5xx, instead of failing the request. This keeps your existing primary stack untouched but unlocks Workers AI bindings in the workers that already have `env.AI` (none yet — needs a small `wrangler.toml` add).

```text
tier         primary (Lovable Gateway)        →  CF fallback (Workers AI)
default      gemini-3-flash → gpt-5-mini      →  llama-3.3-70b-fp8-fast
vision       gpt-5-mini → gemini-2.5-flash    →  llama-4-scout-17b → llama-3.2-11b-vision
escalation   gpt-5.2 → gemini-3.1-pro         →  gpt-oss-120b → qwq-32b
cheap        gpt-5-nano                       →  llama-3.2-3b → llama-3.2-1b
```

## Plan

1. **Document the catalog** — write `docs/cloudflare-workers-ai-catalog.md` with the full 91-model list grouped by task, plus the recommendation table above. Reference it from `docs/hybrid-hosting.md`.
2. **Bind Workers AI** — add `[ai] binding = "AI"` to `workers/assistant-agent/wrangler.toml` and `workers/capture-agent/wrangler.toml`.
3. **Extend the router** — add `TIER_CHAIN_CLOUDFLARE` in `aiModelRouter.ts` plus a `callWorkersAI()` adapter (uses `env.AI.run(model, …)`); wire it in as the last fallback after the Gateway chain in `runAITask()`.
4. **Pilot one tier first** — flip the `cheap` tier to use `@cf/meta/llama-3.2-3b-instruct` as a primary in workers (where `env.AI` exists) since classification is low-risk and cost savings are largest. Keep edge functions on the Gateway.
5. **(Optional, separate step)** Stand up Vectorize + `@cf/baai/bge-m3` to replace the in-memory guide index in `AssistantAgent.indexGuides()`.

### Out of scope for this plan
- Voice/TTS/image-gen features (steps 6+, only if you want to ship those product surfaces).
- Migrating off the Lovable AI Gateway entirely — not recommended; keep it as primary for quality.

Approve to implement steps 1–4. Step 5 and the optional capabilities I'll plan separately when you're ready.

---

## Implementation log — Workers AI integration (steps 1-4)

**Status:** shipped. Workers must be redeployed to activate the new routes.

1. **Catalog documented** — `docs/cloudflare-workers-ai-catalog.md` lists all 91 models grouped by task plus the per-tier fallback table. Linked from `docs/hybrid-hosting.md`.
2. **AI bindings added** — `[ai] binding = "AI"` on `assistant-agent` and `capture-agent` wrangler.toml.
3. **Router extended** — `supabase/functions/_shared/aiModelRouter.ts` now has `TIER_CHAIN_CLOUDFLARE` and `tryModel(provider, …)`. After every Lovable Gateway model in a tier fails transiently, it falls through to Workers AI via REST (uses `R2_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` already in Supabase secrets). 429/402 still propagate immediately and are gateway-only by contract.
4. **Pilot routes** — `workers/_shared/ai.ts` exposes `workersAiChat` / `workersAiClassify`. `assistant-agent` adds `POST /ai/classify` and `POST /ai/chat` (service-role only) so the cheap-tier Workers AI path can be exercised end-to-end with curl after deploy.

### Smoke test after deploy

```bash
curl -X POST https://assistant.photobrief.ai/ai/classify \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "content-type: application/json" \
  -d '{"text":"My roof is leaking near the chimney","labels":["roofing","plumbing","hvac","other"]}'
```
