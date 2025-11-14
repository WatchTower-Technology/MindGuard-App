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
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    
    if (!authHeader) {
      console.error('No authorization header found');
      throw new Error('Missing authorization header');
    }

    console.log('Authorization header present, creating Supabase client');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    if (!user) {
      console.error('No user found despite valid header');
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Fetch recent data
    const { data: moodData } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(7);

    const { data: sleepData } = await supabase
      .from('sleep_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(7);

    const { data: activityData } = await supabase
      .from('activity_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(7);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    console.log('Assessing overall risk with AI');

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
            content: 'You are a mental health risk assessment assistant. Analyze user data and provide an overall risk assessment. Return JSON with: {"riskLevel": "low"|"medium"|"high", "overallWellness": 0-100, "moodRisk": 0-100, "sleepRisk": 0-100, "activityRisk": 0-100, "insights": "brief AI insights"}'
          },
          {
            role: 'user',
            content: `Recent data:\n\nMood entries (last 7): ${JSON.stringify(moodData?.slice(0, 3))}\n\nSleep entries (last 7): ${JSON.stringify(sleepData?.slice(0, 3))}\n\nActivity entries (last 7): ${JSON.stringify(activityData?.slice(0, 3))}\n\nProvide comprehensive risk assessment.`
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
    
    let assessment = {
      riskLevel: 'medium',
      overallWellness: 70,
      moodRisk: 50,
      sleepRisk: 50,
      activityRisk: 50,
      insights: 'Continue monitoring your mental health patterns.'
    };

    try {
      const jsonMatch = content.match(/\{.*\}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        assessment = { ...assessment, ...parsed };
      }
    } catch (e) {
      console.error('Failed to parse assessment:', e);
    }

    const { data: riskEntry, error: insertError } = await supabase
      .from('risk_assessments')
      .insert({
        user_id: user.id,
        risk_level: assessment.riskLevel,
        overall_wellness: assessment.overallWellness,
        mood_risk: assessment.moodRisk,
        sleep_risk: assessment.sleepRisk,
        activity_risk: assessment.activityRisk,
        ai_insights: assessment.insights,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('Risk assessment saved:', riskEntry);

    return new Response(JSON.stringify({ ...assessment, entry: riskEntry }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in assess-risk:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});