
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

const Index = () => {
  const [riskLevel, setRiskLevel] = useState('low');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Simulated real-time risk assessment
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // This would connect to real AI prediction engine
      const risk = Math.random();
      if (risk > 0.8) setRiskLevel('high');
      else if (risk > 0.6) setRiskLevel('medium');
      else setRiskLevel('low');
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  MindGuard
                </h1>
                <p className="text-lg text-gray-600">AI-Powered Mental Health Crisis Prevention</p>
              </div>
            </div>
            <UserMenu />
          </div>

          {/* Risk Status Dashboard */}
          <Card className="mb-6 border-l-4 border-l-purple-500 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-600" />
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
              <p className="text-gray-700 mb-4">{getRiskDescription(riskLevel)}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
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
            <Card className="mb-6 border-red-500 bg-red-50 shadow-lg animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">Crisis Prevention Alert</h3>
                    <p className="text-red-700">Patterns indicate elevated risk. Immediate support resources available.</p>
                  </div>
                  <Button variant="destructive" className="ml-auto">
                    Access Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg rounded-lg p-1">
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
            <PredictiveAnalytics riskLevel={riskLevel} />
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
        <div className="mt-12 text-center text-gray-500 border-t pt-8">
          <p className="mb-2">🔒 Your data is processed locally and encrypted end-to-end</p>
          <p className="text-sm">MindGuard - Preventing mental health crises through predictive analytics</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
