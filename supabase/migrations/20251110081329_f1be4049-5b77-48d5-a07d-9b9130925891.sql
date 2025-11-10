-- Create mood_entries table
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood VARCHAR(20) NOT NULL,
  note TEXT,
  triggers TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sleep_entries table
CREATE TABLE public.sleep_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  duration DECIMAL(4,2) NOT NULL,
  quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 5),
  interruptions INTEGER DEFAULT 0,
  risk_factors TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_entries table
CREATE TABLE public.activity_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  steps INTEGER DEFAULT 0,
  screen_time DECIMAL(4,2) DEFAULT 0,
  social_interactions INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  outdoor_time DECIMAL(4,2) DEFAULT 0,
  risk_score INTEGER DEFAULT 0,
  behavior_alerts TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk_assessments table
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_level VARCHAR(20) NOT NULL,
  overall_wellness INTEGER NOT NULL,
  mood_risk INTEGER DEFAULT 0,
  sleep_risk INTEGER DEFAULT 0,
  activity_risk INTEGER DEFAULT 0,
  ai_insights TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mood_entries
CREATE POLICY "Users can view their own mood entries"
ON public.mood_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries"
ON public.mood_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries"
ON public.mood_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries"
ON public.mood_entries FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for sleep_entries
CREATE POLICY "Users can view their own sleep entries"
ON public.sleep_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sleep entries"
ON public.sleep_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep entries"
ON public.sleep_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep entries"
ON public.sleep_entries FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for activity_entries
CREATE POLICY "Users can view their own activity entries"
ON public.activity_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity entries"
ON public.activity_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity entries"
ON public.activity_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity entries"
ON public.activity_entries FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for risk_assessments
CREATE POLICY "Users can view their own risk assessments"
ON public.risk_assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own risk assessments"
ON public.risk_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk assessments"
ON public.risk_assessments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own risk assessments"
ON public.risk_assessments FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_mood_entries_user_id_timestamp ON public.mood_entries(user_id, timestamp DESC);
CREATE INDEX idx_sleep_entries_user_id_timestamp ON public.sleep_entries(user_id, timestamp DESC);
CREATE INDEX idx_activity_entries_user_id_timestamp ON public.activity_entries(user_id, timestamp DESC);
CREATE INDEX idx_risk_assessments_user_id_timestamp ON public.risk_assessments(user_id, timestamp DESC);