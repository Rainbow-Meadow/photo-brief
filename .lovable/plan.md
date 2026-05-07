
## Generate scene-aware voiceover for the feature video

### Voiceover Script

Scene-timed narration matched to the 9-scene video (~90 seconds at 30fps). Voice: Daniel (`onwK4e9ZLuTAKqWW03F9`) — cinematic, warm, authoritative. Settings: stability 0.4 (expressive), style 0.6 (dramatic), speed 0.92 (deliberate pacing).

| Scene | Duration | Start (s) | Script |
|-------|----------|-----------|--------|
| 1 Hook | 3.3s | 0.0 | "Your customers have the photos you need. They just don't know which ones." |
| 2 Value Prop | 3.0s | 3.3 | "PhotoBrief tells them exactly what to send." |
| 3 Create Request | 12.0s | 6.3 | "Pick a template. Add their name. Hit send. In seconds, your customer gets a guided photo link — no app, no account, no friction." |
| 4 Customer Capture | 14.0s | 18.3 | "They open the link on their phone. One photo at a time. Clear guidance at every step. Real-time AI feedback catches blurry shots before they hit your inbox." |
| 5 Brief Arrives | 14.0s | 32.3 | "Everything lands in one place. Photos. AI quality checks. A summary you can actually act on — ready to quote, ready to dispatch, without a single phone call." |
| 6 Beta Transition | 3.7s | 46.3 | "We're building this with you." |
| 7 Partner Benefits | 12.0s | 50.0 | "Sixty days of full access. Concierge setup. A direct line to shape the product. And permanent rewards tied to how deeply you engage." |
| 8 Reward Tiers | 12.0s | 62.0 | "The top two partners get Pro free — for life. Everyone who participates walks away with a discount that never expires." |
| 9 Closing | 16.0s | 74.0 | "Thirty seats. Sixty days. Your feedback shapes the product. PhotoBrief dot AI." |

### Background Music

Generate a ~90 second background music track via ElevenLabs Music API. Prompt: "Cinematic ambient electronic, building tension to resolve, minimal bass pulse, ethereal pads, subtle percussion, modern tech documentary feel — not corporate, not generic." Mix under voiceover at ~15% volume.

### Implementation

1. **Create `supabase/functions/generate-tts/index.ts`** — Edge function that accepts text, voice settings, and request-stitching context (`previousText`/`nextText`). Returns base64 MP3 audio. Uses Daniel voice with expressive settings.

2. **Deploy and call for each segment** — Call the edge function 9 times (one per scene), using request stitching for natural prosody between segments. Save each segment to `/tmp/`.

3. **Generate background music** — Create `supabase/functions/generate-music/index.ts` edge function. Call ElevenLabs Music API with the cinematic prompt. Save to `/tmp/`.

4. **Assemble with ffmpeg** — Use ffmpeg to:
   - Pad each voiceover segment with silence to match scene start times
   - Concatenate all padded segments into one voiceover track
   - Mix voiceover (100%) + music (15% volume) into final stereo MP3
   - Output to `/mnt/documents/photobrief-voiceover.mp3`

5. **Clean up** — Delete the temporary edge functions after generation is complete.

### Files changed
- `supabase/functions/generate-tts/index.ts` (temporary — deleted after)
- `supabase/functions/generate-music/index.ts` (temporary — deleted after)
- Output: `/mnt/documents/photobrief-voiceover.mp3`
