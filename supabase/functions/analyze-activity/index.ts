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
    const { steps, screenTime, socialInteractions, exerciseMinutes, outdoorTime } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    console.log('Analyzing activity with AI:', { steps, screenTime, socialInteractions, exerciseMinutes, outdoorTime });

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
            content: 'You are a behavioral health analysis assistant. Analyze daily activity patterns and identify behavioral alerts or concerns. Also calculate a risk score from 0-100. Return your response as JSON with format: {"alerts": ["alert1", "alert2"], "riskScore": 0-100}'
          },
          {
            role: 'user',
            content: `Activity data:\n- Steps: ${steps}\n- Screen time: ${screenTime} hours\n- Social interactions: ${socialInteractions}\n- Exercise: ${exerciseMinutes} minutes\n- Outdoor time: ${outdoorTime} hours\n\nAnalyze and return JSON with behavioral alerts and risk score.`
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
    
    let alerts: string[] = [];
    let riskScore = 0;
    try {
      const jsonMatch = content.match(/\{.*\}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        alerts = parsed.alerts || [];
        riskScore = Math.min(100, Math.max(0, parsed.riskScore || 0));
      }
    } catch (e) {
      console.error('Failed to parse analysis:', e);
    }

    const { data: entry, error: insertError } = await supabase
      .from('activity_entries')
      .insert({
        user_id: user.id,
        steps,
        screen_time: screenTime,
        social_interactions: socialInteractions,
        exercise_minutes: exerciseMinutes,
        outdoor_time: outdoorTime,
        risk_score: riskScore,
        behavior_alerts: alerts,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Activity entry saved:', entry);

    return new Response(JSON.stringify({ alerts, riskScore, entry }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-activity:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});