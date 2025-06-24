
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Smile, Meh, Frown, Heart, Zap, Cloud } from 'lucide-react';

const MoodTracker = () => {
  const [currentMood, setCurrentMood] = useState<number>(5);
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState<Array<{
    mood: number;
    note: string;
    timestamp: Date;
    triggers?: string[];
  }>>([]);
  const [detectedTriggers, setDetectedTriggers] = useState<string[]>([]);

  // AI-powered mood pattern analysis (simulated)
  useEffect(() => {
    if (moodNote.length > 10) {
      // Simulate AI trigger detection from text analysis
      const triggers = [];
      if (moodNote.toLowerCase().includes('work')) triggers.push('Work Stress');
      if (moodNote.toLowerCase().includes('sleep')) triggers.push('Sleep Issues');
      if (moodNote.toLowerCase().includes('social')) triggers.push('Social Anxiety');
      if (moodNote.toLowerCase().includes('family')) triggers.push('Family Tension');
      setDetectedTriggers(triggers);
    }
  }, [moodNote]);

  const moodEmojis = [
    { value: 1, icon: Frown, label: 'Very Low', color: 'text-red-600' },
    { value: 2, icon: Frown, label: 'Low', color: 'text-red-400' },
    { value: 3, icon: Meh, label: 'Poor', color: 'text-orange-500' },
    { value: 4, icon: Meh, label: 'Fair', color: 'text-yellow-500' },
    { value: 5, icon: Meh, label: 'Neutral', color: 'text-gray-500' },
    { value: 6, icon: Smile, label: 'Good', color: 'text-blue-500' },
    { value: 7, icon: Smile, label: 'Very Good', color: 'text-green-500' },
    { value: 8, icon: Smile, label: 'Great', color: 'text-green-600' },
    { value: 9, icon: Heart, label: 'Excellent', color: 'text-purple-600' },
    { value: 10, icon: Zap, label: 'Amazing', color: 'text-pink-600' },
  ];

  const handleMoodSubmit = () => {
    const newEntry = {
      mood: currentMood,
      note: moodNote,
      timestamp: new Date(),
      triggers: detectedTriggers,
    };

    setMoodHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
    setMoodNote('');
    setDetectedTriggers([]);
    
    // Simulate sending data to AI analysis engine
    console.log('Mood data sent for analysis:', newEntry);
  };

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 0;
    return (moodHistory.reduce((sum, entry) => sum + entry.mood, 0) / moodHistory.length).toFixed(1);
  };

  const getMoodTrend = () => {
    if (moodHistory.length < 2) return 'neutral';
    const recent = moodHistory.slice(0, 3).reduce((sum, entry) => sum + entry.mood, 0) / 3;
    const older = moodHistory.slice(3, 6).reduce((sum, entry) => sum + entry.mood, 0) / 3;
    
    if (recent > older + 0.5) return 'improving';
    if (recent < older - 0.5) return 'declining';
    return 'stable';
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Mood Tracking & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">How are you feeling right now?</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-4">
              {moodEmojis.map(({ value, icon: Icon, label, color }) => (
                <button
                  key={value}
                  onClick={() => setCurrentMood(value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    currentMood === value
                      ? 'border-purple-500 bg-purple-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto ${color}`} />
                  <p className="text-xs mt-1 font-medium">{value}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-gray-600">
              Selected: <strong>{moodEmojis.find(m => m.value === currentMood)?.label}</strong>
            </p>
          </div>

          {/* Mood Notes */}
          <div>
            <h3 className="text-lg font-semibold mb-2">What's on your mind?</h3>
            <Textarea
              placeholder="Describe what's affecting your mood today... (AI will analyze patterns)"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            
            {/* AI-Detected Triggers */}
            {detectedTriggers.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">🤖 AI detected potential triggers:</p>
                <div className="flex flex-wrap gap-2">
                  {detectedTriggers.map((trigger, index) => (
                    <Badge key={index} variant="outline" className="bg-yellow-50">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleMoodSubmit} 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={!moodNote.trim()}
          >
            Submit Mood Entry
          </Button>
        </CardContent>
      </Card>

      {/* Mood Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Mood Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Average Mood (7 days):</span>
                <span className="font-semibold">{getAverageMood()}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Current Trend:</span>
                <Badge variant={getMoodTrend() === 'improving' ? 'default' : getMoodTrend() === 'declining' ? 'destructive' : 'secondary'}>
                  {getMoodTrend()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Entries This Week:</span>
                <span className="font-semibold">{moodHistory.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {moodHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No mood entries yet</p>
              ) : (
                moodHistory.map((entry, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold">Mood: {entry.mood}/10</span>
                      <span className="text-sm text-gray-500">
                        {entry.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{entry.note}</p>
                    {entry.triggers && entry.triggers.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.triggers.map((trigger, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodTracker;
