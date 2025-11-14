
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Brain, Heart, Moon, Activity, Users, Shield, TrendingUp } from 'lucide-react';
import MoodTracker from '@/components/MoodTracker';
import SleepMonitor from '@/components/SleepMonitor';
import ActivityAnalyzer from '@/components/ActivityAnalyzer';
import CrisisPrevention from '@/components/CrisisPrevention';
import PredictiveAnalytics from '@/components/PredictiveAnalytics';
import UserMenu from '@/components/UserMenu';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [riskLevel, setRiskLevel] = useState('low');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [riskData, setRiskData] = useState<any>(null);

  // Load latest risk assessment
  useEffect(() => {
    loadRiskAssessment();
    const interval = setInterval(loadRiskAssessment, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadRiskAssessment = async () => {
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setRiskLevel(data.risk_level);
      setRiskData(data);
      setLastUpdate(new Date(data.timestamp));
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRiskDescription = (level: string) => {
    switch (level) {
      case 'high': return 'Immediate attention recommended - Crisis prevention protocols activated';
      case 'medium': return 'Elevated concern - Proactive intervention suggested';
      default: return 'Stable indicators - Continue monitoring';
    }
  };

  return (
    <div className="min-h-screen bg-calm p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary rounded-xl">
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-primary">
                  MindGuard
                </h1>
                <p className="text-lg text-muted-foreground">AI-Powered Mental Health Crisis Prevention</p>
              </div>
            </div>
            <UserMenu />
          </div>

          {/* Risk Status Dashboard */}
          <Card className="mb-6 border-l-4 border-l-primary shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">Current Risk Assessment</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(riskLevel)} animate-pulse`}></div>
                  <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'default' : 'secondary'}>
                    {riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">{getRiskDescription(riskLevel)}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span>Monitoring: {isMonitoring ? 'Active' : 'Paused'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Crisis Alert */}
          {riskLevel === 'high' && (
            <Card className="mb-6 border-destructive bg-destructive/10 shadow-lg animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-destructive">Crisis Prevention Alert</h3>
                    <p className="text-destructive/90">Patterns indicate elevated risk. Immediate support resources available.</p>
                  </div>
                  <Button variant="destructive" className="ml-auto" onClick={() => window.open('tel:988', '_self')}>
                    Call 988 Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card shadow-lg rounded-lg p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Mood
            </TabsTrigger>
            <TabsTrigger value="sleep" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Sleep
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="prevention" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Prevention
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <PredictiveAnalytics riskLevel={riskLevel} riskData={riskData} onRefresh={loadRiskAssessment} />
          </TabsContent>

          <TabsContent value="mood" className="space-y-6">
            <MoodTracker />
          </TabsContent>

          <TabsContent value="sleep" className="space-y-6">
            <SleepMonitor />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityAnalyzer />
          </TabsContent>

          <TabsContent value="prevention" className="space-y-6">
            <CrisisPrevention riskLevel={riskLevel} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground border-t border-border pt-8">
          <p className="mb-2">🔒 Your data is encrypted and securely stored</p>
          <p className="text-sm">MindGuard - Preventing mental health crises through AI-powered predictive analytics</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
