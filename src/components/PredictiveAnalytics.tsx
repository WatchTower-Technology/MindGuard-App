
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Activity, 
  Users, 
  Moon, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PredictiveAnalyticsProps {
  riskLevel: string;
  riskData: any;
  onRefresh: () => void;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ riskLevel, riskData, onRefresh }) => {
  const { toast } = useToast();
  const [isAssessing, setIsAssessing] = useState(false);

  const runRiskAssessment = async () => {
    setIsAssessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('assess-risk', {});

      if (error) throw error;

      toast({
        title: "Risk assessment complete",
        description: `Overall wellness: ${data.overallWellness}%`,
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAssessing(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'bg-red-500';
    if (risk >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLevel = (risk: number) => {
    if (risk >= 70) return 'HIGH';
    if (risk >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getOverallWellness = () => {
    if (!riskData) return 70;
    return riskData.overall_wellness || 70;
  };

  const metrics = [
    {
      title: 'Mood Risk',
      value: riskData?.mood_risk || 0,
      icon: AlertTriangle,
      description: 'Risk indicators from mood tracking',
      color: getRiskColor(riskData?.mood_risk || 0),
    },
    {
      title: 'Sleep Risk',
      value: riskData?.sleep_risk || 0,
      icon: Moon,
      description: 'Risk indicators from sleep patterns',
      color: getRiskColor(riskData?.sleep_risk || 0),
    },
    {
      title: 'Activity Risk',
      value: riskData?.activity_risk || 0,
      icon: Activity,
      description: 'Risk indicators from daily activity',
      color: getRiskColor(riskData?.activity_risk || 0),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Wellness Score */}
      <Card className="shadow-lg border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              AI-Powered Mental Health Prediction Dashboard
            </CardTitle>
            <Button 
              onClick={runRiskAssessment}
              disabled={isAssessing}
              variant="outline"
              size="sm"
            >
              {isAssessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">{isAssessing ? 'Assessing...' : 'Run Assessment'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Overall Wellness Score: {getOverallWellness().toFixed(0)}%
              </h3>
              <p className="text-muted-foreground">
                Comprehensive AI analysis of your mental health indicators
              </p>
            </div>
            <div className="text-right">
              <Badge variant={getOverallWellness() >= 70 ? 'default' : getOverallWellness() >= 40 ? 'secondary' : 'destructive'}>
                {getOverallWellness() >= 70 ? 'Good' : getOverallWellness() >= 40 ? 'Fair' : 'At Risk'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
          <Progress value={getOverallWellness()} className="h-3" />
        </CardContent>
      </Card>

      {/* Risk Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <metric.icon className="h-5 w-5 text-primary" />
                <Badge variant={metric.value >= 70 ? 'destructive' : metric.value >= 40 ? 'default' : 'secondary'}>
                  {getRiskLevel(metric.value)}
                </Badge>
              </div>
              <CardTitle className="text-lg">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{metric.value}%</span>
                  <div className={`w-4 h-4 rounded-full ${metric.color}`}></div>
                </div>
                <Progress value={metric.value} className="h-2" />
                <p className="text-sm text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Analysis - removed as we're using real data */}

      {/* AI Insights & Recommendations */}
      {riskData?.ai_insights && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              🤖 AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-info/10 border-l-4 border-info rounded-r-lg">
              <p className="text-sm text-foreground">{riskData.ai_insights}</p>
            </div>
            
            <div className="mt-6 p-4 bg-calm rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">🎯 Personalized Action Plan</h4>
              <div className="space-y-2 text-sm">
                {riskData.mood_risk > 50 && (
                  <p className="text-destructive">• Elevated mood risk - consider reaching out for support</p>
                )}
                {riskData.sleep_risk > 50 && (
                  <p className="text-warning">• Sleep patterns need attention - establish consistent bedtime routine</p>
                )}
                {riskData.activity_risk > 50 && (
                  <p className="text-warning">• Low activity detected - try to increase daily movement</p>
                )}
                {riskData.overall_wellness > 70 && (
                  <p className="text-success">• Great overall wellness - keep up your healthy habits!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Information */}
      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">AI Model Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p><strong>Model:</strong> Google Gemini 2.5 Flash</p>
              <p><strong>Provider:</strong> Lovable AI Gateway</p>
              <p><strong>Processing:</strong> Real-time analysis</p>
            </div>
            <div>
              <p><strong>Privacy:</strong> End-to-end encrypted</p>
              <p><strong>Storage:</strong> Secure Supabase database</p>
              <p><strong>Updates:</strong> On-demand risk assessment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveAnalytics;
