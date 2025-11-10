import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bedtime, wakeTime, quality, interruptions } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Calculate duration
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
    let duration = (wakeHour + wakeMin / 60) - (bedHour + bedMin / 60);
    if (duration < 0) duration += 24;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    console.log('Analyzing sleep with AI:', { bedtime, wakeTime, duration, quality, interruptions });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a sleep health analysis assistant. Analyze sleep patterns and identify risk factors. Return your response as a JSON array of risk factor strings. Be concise and professional.'
          },
          {
            role: 'user',
            content: `Sleep data:\n- Bedtime: ${bedtime}\n- Wake time: ${wakeTime}\n- Duration: ${duration.toFixed(2)} hours\n- Quality: ${quality}/5\n- Interruptions: ${interruptions}\n\nIdentify any sleep-related risk factors. Return only a JSON array of strings like ["risk1", "risk2"].`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let riskFactors: string[] = [];
    try {
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        riskFactors = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse risk factors:', e);
    }

    const { data: entry, error: insertError } = await supabase
      .from('sleep_entries')
      .insert({
        user_id: user.id,
        bedtime,
        wake_time: wakeTime,
        duration,
        quality,
        interruptions,
        risk_factors: riskFactors,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Sleep entry saved:', entry);

    return new Response(JSON.stringify({ riskFactors, entry }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-sleep:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});