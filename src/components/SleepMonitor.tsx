
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Moon, Sun, Clock, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

const SleepMonitor = () => {
  const [sleepData, setSleepData] = useState({
    bedtime: '23:00',
    wakeTime: '07:00',
    quality: 7,
    interruptions: 1,
  });

  const [sleepHistory, setSleepHistory] = useState<Array<{
    date: Date;
    duration: number;
    quality: number;
    bedtime: string;
    wakeTime: string;
    interruptions: number;
  }>>([]);

  const [riskFactors, setRiskFactors] = useState<string[]>([]);

  // Calculate sleep duration
  const calculateDuration = (bedtime: string, wakeTime: string) => {
    const bed = new Date(`2024-01-01 ${bedtime}`);
    let wake = new Date(`2024-01-01 ${wakeTime}`);
    
    // Handle overnight sleep
    if (wake < bed) {
      wake.setDate(wake.getDate() + 1);
    }
    
    return (wake.getTime() - bed.getTime()) / (1000 * 60 * 60); // hours
  };

  // AI-powered sleep pattern analysis
  useEffect(() => {
    const duration = calculateDuration(sleepData.bedtime, sleepData.wakeTime);
    const factors = [];

    if (duration < 6) factors.push('Insufficient Sleep Duration');
    if (duration > 10) factors.push('Excessive Sleep Duration');
    if (sleepData.quality < 5) factors.push('Poor Sleep Quality');
    if (sleepData.interruptions > 3) factors.push('Frequent Sleep Interruptions');
    
    // Check for irregular sleep schedule
    if (sleepHistory.length > 0) {
      const avgBedtime = sleepHistory.reduce((sum, entry) => {
        const time = new Date(`2024-01-01 ${entry.bedtime}`).getHours();
        return sum + time;
      }, 0) / sleepHistory.length;
      
      const currentBedtime = new Date(`2024-01-01 ${sleepData.bedtime}`).getHours();
      if (Math.abs(currentBedtime - avgBedtime) > 2) {
        factors.push('Irregular Sleep Schedule');
      }
    }

    setRiskFactors(factors);
  }, [sleepData, sleepHistory]);

  const handleSleepSubmit = () => {
    const duration = calculateDuration(sleepData.bedtime, sleepData.wakeTime);
    const newEntry = {
      date: new Date(),
      duration,
      quality: sleepData.quality,
      bedtime: sleepData.bedtime,
      wakeTime: sleepData.wakeTime,
      interruptions: sleepData.interruptions,
    };

    setSleepHistory(prev => [newEntry, ...prev.slice(0, 6)]); // Keep last 7 entries
    console.log('Sleep data sent for analysis:', newEntry);
  };

  const getAverageDuration = () => {
    if (sleepHistory.length === 0) return 0;
    return (sleepHistory.reduce((sum, entry) => sum + entry.duration, 0) / sleepHistory.length).toFixed(1);
  };

  const getAverageQuality = () => {
    if (sleepHistory.length === 0) return 0;
    return (sleepHistory.reduce((sum, entry) => sum + entry.quality, 0) / sleepHistory.length).toFixed(1);
  };

  const getSleepTrend = () => {
    if (sleepHistory.length < 3) return 'neutral';
    const recentAvg = sleepHistory.slice(0, 3).reduce((sum, entry) => sum + entry.quality, 0) / 3;
    const olderAvg = sleepHistory.slice(3, 6).reduce((sum, entry) => sum + entry.quality, 0) / 3;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  };

  const currentDuration = calculateDuration(sleepData.bedtime, sleepData.wakeTime);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-600" />
            Sleep Pattern Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sleep Input */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bedtime</label>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-gray-500" />
                <Input
                  type="time"
                  value={sleepData.bedtime}
                  onChange={(e) => setSleepData(prev => ({ ...prev, bedtime: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Wake Time</label>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <Input
                  type="time"
                  value={sleepData.wakeTime}
                  onChange={(e) => setSleepData(prev => ({ ...prev, wakeTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-sm font-medium mb-2">Sleep Quality (1-10)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={sleepData.quality}
                onChange={(e) => setSleepData(prev => ({ ...prev, quality: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className="font-semibold w-8">{sleepData.quality}</span>
            </div>
            <Progress value={sleepData.quality * 10} className="mt-2" />
          </div>

          {/* Sleep Interruptions */}
          <div>
            <label className="block text-sm font-medium mb-2">Number of Interruptions</label>
            <Input
              type="number"
              min="0"
              max="20"
              value={sleepData.interruptions}
              onChange={(e) => setSleepData(prev => ({ ...prev, interruptions: Number(e.target.value) }))}
            />
          </div>

          {/* Current Sleep Analysis */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tonight's Sleep Analysis
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Planned Duration: <strong>{currentDuration.toFixed(1)} hours</strong>
            </p>
            <div className="flex items-center gap-2">
              {currentDuration >= 7 && currentDuration <= 9 ? (
                <>
                  <Badge variant="default" className="bg-green-500">Optimal Duration</Badge>
                  <span className="text-sm text-green-700">✓ Within recommended range</span>
                </>
              ) : (
                <>
                  <Badge variant="destructive">Suboptimal Duration</Badge>
                  <span className="text-sm text-red-700">
                    {currentDuration < 7 ? '⚠️ Too short' : '⚠️ Too long'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                🤖 AI Detected Sleep Risk Factors
              </h4>
              <div className="flex flex-wrap gap-2">
                {riskFactors.map((factor, index) => (
                  <Badge key={index} variant="outline" className="bg-yellow-100 border-yellow-300">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleSleepSubmit} 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Record Sleep Data
          </Button>
        </CardContent>
      </Card>

      {/* Sleep Analytics Dashboard */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Sleep Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Avg Duration:</span>
                <span className="font-semibold">{getAverageDuration()}h</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Quality:</span>
                <span className="font-semibold">{getAverageQuality()}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Sleep Trend:</span>
                <Badge variant={getSleepTrend() === 'improving' ? 'default' : getSleepTrend() === 'declining' ? 'destructive' : 'secondary'}>
                  {getSleepTrend() === 'improving' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {getSleepTrend() === 'declining' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {getSleepTrend()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Sleep Quality Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sleepHistory.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{entry.date.toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={entry.quality * 10} className="w-20" />
                    <span className="text-sm w-8">{entry.quality}</span>
                  </div>
                </div>
              ))}
              {sleepHistory.length === 0 && (
                <p className="text-gray-500 text-center py-4">No sleep data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Sleep Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {currentDuration < 7 && (
                <div className="p-2 bg-blue-50 rounded">
                  💡 Try going to bed 30 minutes earlier
                </div>
              )}
              {sleepData.quality < 6 && (
                <div className="p-2 bg-green-50 rounded">
                  🧘 Consider relaxation techniques before bed
                </div>
              )}
              {sleepData.interruptions > 2 && (
                <div className="p-2 bg-purple-50 rounded">
                  🔕 Optimize your sleep environment
                </div>
              )}
              {riskFactors.length === 0 && (
                <div className="p-2 bg-green-100 rounded text-green-800">
                  ✅ Your sleep patterns look healthy!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SleepMonitor;
