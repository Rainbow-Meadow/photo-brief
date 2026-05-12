# Cloudflare Workers AI — Account Catalog

> Snapshot of every model bound to PhotoBrief's Cloudflare account
> (`6c2f1b338ff8d813f945cf998c258284`), pulled from
> `GET /accounts/{id}/ai/models/search`. Use this as the source-of-truth
> when picking fallback / specialty models for the AI router
> (`supabase/functions/_shared/aiModelRouter.ts`).

**Total models: 91.** Last refreshed: 2026-05-12.

To regenerate this list:

```bash
ACC=6c2f1b338ff8d813f945cf998c258284
curl -sS -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACC/ai/models/search?per_page=200"
```

---

## Mapping to PhotoBrief tiers

The Lovable AI Gateway remains the **primary** provider for every tier.
Workers AI is the **last-resort fallback** so a Gateway 5xx / model outage
degrades gracefully instead of throwing `AIUnavailableError`. The 429/402
contract is unchanged — those still propagate immediately.

| Tier | Lovable Gateway (primary) | Cloudflare fallback |
|---|---|---|
| `default` | `gemini-3-flash-preview` → `gpt-5-mini` → `gemini-2.5-flash-lite` | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| `vision` | `gpt-5-mini` → `gemini-2.5-flash` → `gemini-2.5-flash-lite` | `@cf/meta/llama-4-scout-17b-16e-instruct` → `@cf/meta/llama-3.2-11b-vision-instruct` |
| `escalation` | `gpt-5.2` → `gemini-3.1-pro-preview` → `gpt-5-mini` | `@cf/openai/gpt-oss-120b` → `@cf/qwen/qwq-32b` |
| `cheap` | `gpt-5-nano` → `gemini-2.5-flash-lite` | `@cf/meta/llama-3.2-3b-instruct` → `@cf/meta/llama-3.2-1b-instruct` |

Implementation lives in `aiModelRouter.ts` (`TIER_CHAIN_CLOUDFLARE`,
`callWorkersAI`). Tool-calling envelope is preserved — Workers AI
chat-completions endpoint is OpenAI-compatible.

---

## Net-new capabilities (not currently wired)

| Capability | Model | Possible PhotoBrief use |
|---|---|---|
| Safety guardrail | `@cf/meta/llama-guard-3-8b` | Pre-screen recipient captions/photos for abuse before storing |
| Embeddings (multilingual) | `@cf/baai/bge-m3` | Vectorize + RAG over `photo_guides` instead of in-memory `agent.sql` |
| Reranker | `@cf/baai/bge-reranker-base` | Improve guide search precision in `assistant-agent` |
| ASR | `@cf/openai/whisper-large-v3-turbo` | Voice-note submissions from recipients |
| Live ASR | `@cf/deepgram/flux` | Real-time capture wizard transcription |
| TTS | `@cf/deepgram/aura-2-en` | Spoken playback of guide steps for hands-busy recipients |
| Image gen | `@cf/black-forest-labs/flux-2-dev` | Auto-generate "good example" reference images per guide step |

Each of these is **opt-in** — none ships in the current router. Pick up
when the corresponding product surface is on the roadmap.

---

## Full catalog by task

### Text Generation (55)

```
@cf/openai/gpt-oss-120b
@cf/openai/gpt-oss-20b
@cf/nvidia/nemotron-3-120b-a12b
@cf/meta/llama-4-scout-17b-16e-instruct
@cf/meta/llama-3.3-70b-instruct-fp8-fast
@cf/meta/llama-3.2-11b-vision-instruct
@cf/meta/llama-3.2-3b-instruct
@cf/meta/llama-3.2-1b-instruct
@cf/meta/llama-3.1-8b-instruct-fp8
@cf/meta/llama-3.1-8b-instruct-awq
@cf/meta/llama-3-8b-instruct
@cf/meta/llama-3-8b-instruct-awq
@cf/meta/llama-2-7b-chat-fp16
@cf/meta/llama-2-7b-chat-int8
@cf/meta-llama/llama-2-7b-chat-hf-lora
@cf/meta/llama-guard-3-8b
@cf/mistralai/mistral-small-3.1-24b-instruct
@cf/mistral/mistral-7b-instruct-v0.1
@cf/mistral/mistral-7b-instruct-v0.2-lora
@cf/google/gemma-3-12b-it
@cf/google/gemma-4-26b-a4b-it
@cf/google/gemma-2b-it-lora
@cf/google/gemma-7b-it-lora
@cf/aisingapore/gemma-sea-lion-v4-27b-it
@cf/qwen/qwq-32b
@cf/qwen/qwen3-30b-a3b-fp8
@cf/qwen/qwen2.5-coder-32b-instruct
@cf/qwen/qwen1.5-14b-chat-awq
@cf/qwen/qwen1.5-7b-chat-awq
@cf/qwen/qwen1.5-1.8b-chat
@cf/qwen/qwen1.5-0.5b-chat
@cf/deepseek-ai/deepseek-r1-distill-qwen-32b
@cf/deepseek-ai/deepseek-math-7b-instruct
@cf/moonshotai/kimi-k2.5
@cf/moonshotai/kimi-k2.6
@cf/zai-org/glm-4.7-flash
@cf/ibm-granite/granite-4.0-h-micro
@cf/tiiuae/falcon-7b-instruct
@cf/tinyllama/tinyllama-1.1b-chat-v1.0
@cf/microsoft/phi-2
@cf/openchat/openchat-3.5-0106
@cf/defog/sqlcoder-7b-2
@cf/fblgit/una-cybertron-7b-v2-bf16
@cf/thebloke/discolm-german-7b-v1-awq
@hf/nexusflow/starling-lm-7b-beta
@hf/nousresearch/hermes-2-pro-mistral-7b
@hf/mistral/mistral-7b-instruct-v0.2
@hf/thebloke/mistral-7b-instruct-v0.1-awq
@hf/thebloke/neural-chat-7b-v3-1-awq
@hf/thebloke/openhermes-2.5-mistral-7b-awq
@hf/thebloke/zephyr-7b-beta-awq
@hf/thebloke/llama-2-13b-chat-awq
@hf/thebloke/deepseek-coder-6.7b-base-awq
@hf/thebloke/deepseek-coder-6.7b-instruct-awq
@hf/google/gemma-7b-it
```

### Image-to-Text / Vision (2)

```
@cf/llava-hf/llava-1.5-7b-hf
@cf/unum/uform-gen2-qwen-500m
```

### Text Embeddings (7)

```
@cf/baai/bge-m3
@cf/baai/bge-large-en-v1.5
@cf/baai/bge-base-en-v1.5
@cf/baai/bge-small-en-v1.5
@cf/google/embeddinggemma-300m
@cf/qwen/qwen3-embedding-0.6b
@cf/pfnet/plamo-embedding-1b
```

### Reranker / Classification (3)

```
@cf/baai/bge-reranker-base
@cf/huggingface/distilbert-sst-2-int8
@cf/microsoft/resnet-50
```

### Speech (10)

```
ASR:
  @cf/openai/whisper
  @cf/openai/whisper-tiny-en
  @cf/openai/whisper-large-v3-turbo
  @cf/deepgram/nova-3
  @cf/deepgram/flux

TTS:
  @cf/deepgram/aura-1
  @cf/deepgram/aura-2-en
  @cf/deepgram/aura-2-es
  @cf/myshell-ai/melotts

Smart turn:
  @cf/pipecat-ai/smart-turn-v2
```

### Text-to-Image (11)

```
@cf/black-forest-labs/flux-2-dev
@cf/black-forest-labs/flux-2-klein-9b
@cf/black-forest-labs/flux-2-klein-4b
@cf/black-forest-labs/flux-1-schnell
@cf/leonardo/lucid-origin
@cf/leonardo/phoenix-1.0
@cf/bytedance/stable-diffusion-xl-lightning
@cf/stabilityai/stable-diffusion-xl-base-1.0
@cf/lykon/dreamshaper-8-lcm
@cf/runwayml/stable-diffusion-v1-5-img2img
@cf/runwayml/stable-diffusion-v1-5-inpainting
```

### Translation / Summarization (3)

```
@cf/meta/m2m100-1.2b
@cf/ai4bharat/indictrans2-en-indic-1B
@cf/facebook/bart-large-cnn
```
