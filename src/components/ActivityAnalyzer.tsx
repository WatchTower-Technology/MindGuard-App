
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Smartphone, Users, MapPin, Clock, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ActivityAnalyzer = () => {
  const { toast } = useToast();
  const [activityData, setActivityData] = useState({
    steps: 8500,
    screenTime: 6.5, // hours
    socialInteractions: 3,
    exerciseMinutes: 30,
    outsideTime: 2, // hours
  });

  const [activityHistory, setActivityHistory] = useState<Array<{
    date: Date;
    steps: number;
    screenTime: number;
    socialInteractions: number;
    exerciseMinutes: number;
    outsideTime: number;
    riskScore: number;
  }>>([]);

  const [behaviorAlerts, setBehaviorAlerts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadActivityHistory();
  }, []);

  const loadActivityHistory = async () => {
    const { data, error } = await supabase
      .from('activity_entries')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(7);

    if (!error && data) {
      setActivityHistory(data.map(entry => ({
        date: new Date(entry.timestamp),
        steps: entry.steps,
        screenTime: entry.screen_time,
        socialInteractions: entry.social_interactions,
        exerciseMinutes: entry.exercise_minutes,
        outsideTime: entry.outdoor_time,
        riskScore: entry.risk_score,
      })));
      if (data.length > 0) {
        setBehaviorAlerts(data[0].behavior_alerts || []);
      }
    }
  };

  const handleActivitySubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-activity', {
        body: {
          steps: activityData.steps,
          screenTime: activityData.screenTime,
          socialInteractions: activityData.socialInteractions,
          exerciseMinutes: activityData.exerciseMinutes,
          outdoorTime: activityData.outsideTime,
        }
      });

      if (error) throw error;

      toast({
        title: "Activity data recorded",
        description: data.alerts.length > 0
          ? `AI detected ${data.alerts.length} behavioral alerts`
          : "Your activity has been analyzed and saved",
      });

      setBehaviorAlerts(data.alerts || []);
      await loadActivityHistory();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityLevel = () => {
    const score = (activityData.steps / 10000) * 25 + 
                  (Math.max(0, 8 - activityData.screenTime) / 8) * 25 +
                  (Math.min(activityData.socialInteractions, 5) / 5) * 25 +
                  (Math.min(activityData.exerciseMinutes, 60) / 60) * 25;
    
    if (score >= 75) return { level: 'High', color: 'bg-green-500', description: 'Excellent activity patterns' };
    if (score >= 50) return { level: 'Moderate', color: 'bg-yellow-500', description: 'Good activity with room for improvement' };
    return { level: 'Low', color: 'bg-red-500', description: 'Activity patterns may indicate risk' };
  };

  const activityLevel = getActivityLevel();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Daily Activity & Behavior Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity Inputs */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Steps Today</label>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={activityData.steps}
                  onChange={(e) => setActivityData(prev => ({ ...prev, steps: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <Progress value={Math.min((activityData.steps / 10000) * 100, 100)} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Goal: 10,000 steps</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Screen Time (hours)</label>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  step="0.5"
                  value={activityData.screenTime}
                  onChange={(e) => setActivityData(prev => ({ ...prev, screenTime: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <Progress value={Math.min((activityData.screenTime / 12) * 100, 100)} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                {activityData.screenTime > 8 ? '⚠️ High usage' : '✓ Moderate usage'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Social Interactions</label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={activityData.socialInteractions}
                  onChange={(e) => setActivityData(prev => ({ ...prev, socialInteractions: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <Progress value={Math.min((activityData.socialInteractions / 5) * 100, 100)} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Meaningful conversations/interactions</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Exercise (minutes)</label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={activityData.exerciseMinutes}
                  onChange={(e) => setActivityData(prev => ({ ...prev, exerciseMinutes: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <Progress value={Math.min((activityData.exerciseMinutes / 60) * 100, 100)} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Goal: 30+ minutes</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Outdoor Time (hours)</label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  step="0.5"
                  value={activityData.outsideTime}
                  onChange={(e) => setActivityData(prev => ({ ...prev, outsideTime: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <Progress value={Math.min((activityData.outsideTime / 4) * 100, 100)} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">Fresh air & sunlight</p>
            </div>
          </div>

          {/* Activity Level Assessment */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              📊 Today's Activity Assessment
            </h4>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-4 h-4 rounded-full ${activityLevel.color}`}></div>
              <span className="font-medium">{activityLevel.level} Activity Level</span>
              <Badge variant={activityLevel.level === 'High' ? 'default' : activityLevel.level === 'Moderate' ? 'secondary' : 'destructive'}>
                {activityLevel.description}
              </Badge>
            </div>
          </div>

          {/* Behavioral Risk Alerts */}
          {behaviorAlerts.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                🤖 AI Behavioral Risk Detection
              </h4>
              <p className="text-sm text-red-700 mb-3">
                Patterns detected that may correlate with mental health decline:
              </p>
              <div className="flex flex-wrap gap-2">
                {behaviorAlerts.map((alert, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {alert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleActivitySubmit} 
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Analyzing with AI...' : 'Record Daily Activity'}
          </Button>
        </CardContent>
      </Card>

      {/* Activity Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No activity data yet</p>
              ) : (
                activityHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium">{entry.date.toLocaleDateString()}</span>
                      <div className="text-xs text-gray-600">
                        {entry.steps} steps • {entry.socialInteractions} social • {entry.exerciseMinutes}min exercise
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        entry.riskScore < 3 ? 'bg-green-500' : 
                        entry.riskScore < 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-xs">Risk: {entry.riskScore.toFixed(1)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Behavioral Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {activityData.steps >= 8000 && (
                <div className="p-2 bg-green-50 rounded flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Good physical activity levels</span>
                </div>
              )}
              {activityData.socialInteractions >= 2 && (
                <div className="p-2 bg-blue-50 rounded flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  <span>Healthy social engagement</span>
                </div>
              )}
              {activityData.screenTime <= 6 && (
                <div className="p-2 bg-purple-50 rounded flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>Balanced screen time</span>
                </div>
              )}
              {behaviorAlerts.length === 0 && activityHistory.length > 0 && (
                <div className="p-2 bg-green-100 rounded text-green-800">
                  🎉 No behavioral risk factors detected!
                </div>
              )}
              {behaviorAlerts.length > 2 && (
                <div className="p-2 bg-red-100 rounded text-red-800">
                  ⚠️ Multiple risk factors suggest need for intervention
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityAnalyzer;
