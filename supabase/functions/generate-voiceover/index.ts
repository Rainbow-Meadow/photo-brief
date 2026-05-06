import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  if (!ELEVENLABS_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing ELEVENLABS_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const VOICE_ID = "onwK4e9ZLuTAKqWW03F9"; // Daniel

  const script = `PhotoBrief is the fastest way for service businesses to collect job-site photos from customers — before you ever roll a truck.

Here's how it works.

From your dashboard, create a new photo request. Choose a template — like roof inspection, junk removal, or damage documentation — or build your own.

Add your customer's name and phone number, then hit send. They receive a simple link — no app download required.

Your customer taps the link on any phone. Our guided capture walks them through each required shot — with angle hints, example overlays, and a built-in quality check powered by AI.

Once they submit, you get a ready-to-review photo brief — organized, scored, and waiting in your inbox.

Every submission is analyzed for completeness, framing, and lighting. If a photo doesn't meet your guide's requirements, the customer is prompted to reshoot — automatically.

The result? Fewer wasted site visits. Faster, more accurate quotes. And happier customers who feel guided, not confused.

PhotoBrief. See the job before you send the crew.`;

  try {
    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      return new Response(JSON.stringify({ error: `ElevenLabs: ${err}` }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await resp.arrayBuffer();

    // Upload to storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: uploadError } = await supabase.storage
      .from("marketing-assets")
      .upload("voiceover/demo-walkthrough.mp3", audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: urlData } = supabase.storage
      .from("marketing-assets")
      .getPublicUrl("voiceover/demo-walkthrough.mp3");

    return new Response(JSON.stringify({
      success: true,
      url: urlData.publicUrl,
      size: audioBuffer.byteLength,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
