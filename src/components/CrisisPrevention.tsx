
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Phone, 
  Heart, 
  Users, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MessageCircle,
  Calendar,
  MapPin
} from 'lucide-react';

interface CrisisPreventionProps {
  riskLevel: string;
}

interface InterventionStrategy {
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<any>;
  color: string;
  urgent?: boolean;
}

const CrisisPrevention: React.FC<CrisisPreventionProps> = ({ riskLevel }) => {
  const [interventionStep, setInterventionStep] = useState(1);
  const [interventionsUsed, setInterventionsUsed] = useState<string[]>([]);

  const emergencyContacts = [
    { name: 'National Suicide Prevention Lifeline', number: '988', available: '24/7' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', available: '24/7' },
    { name: 'Emergency Services', number: '911', available: '24/7' },
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', available: '24/7' },
  ];

  const interventionStrategies: Record<string, InterventionStrategy[]> = {
    low: [
      {
        title: 'Mindfulness Check-in',
        description: 'Take 5 minutes for deep breathing and mindfulness',
        action: 'Start Guided Session',
        icon: Brain,
        color: 'bg-blue-50 border-blue-200',
      },
      {
        title: 'Social Connection',
        description: 'Reach out to a friend or family member',
        action: 'View Contacts',
        icon: Users,
        color: 'bg-green-50 border-green-200',
      },
      {
        title: 'Physical Activity',
        description: 'Take a short walk or do light exercise',
        action: 'Start Activity',
        icon: Heart,
        color: 'bg-purple-50 border-purple-200',
      },
    ],
    medium: [
      {
        title: 'Professional Check-in',
        description: 'Schedule appointment with your therapist/counselor',
        action: 'Schedule Now',
        icon: Calendar,
        color: 'bg-yellow-50 border-yellow-300',
      },
      {
        title: 'Crisis Support Chat',
        description: 'Connect with trained crisis counselor online',
        action: 'Start Chat',
        icon: MessageCircle,
        color: 'bg-orange-50 border-orange-300',
      },
      {
        title: 'Safety Planning',
        description: 'Review and update your personalized safety plan',
        action: 'Open Safety Plan',
        icon: Shield,
        color: 'bg-blue-50 border-blue-300',
      },
      {
        title: 'Support Network Alert',
        description: 'Notify trusted contacts about your current state',
        action: 'Send Alerts',
        icon: Users,
        color: 'bg-green-50 border-green-300',
      },
    ],
    high: [
      {
        title: '🚨 Immediate Professional Help',
        description: 'Contact emergency mental health services now',
        action: 'Call 988',
        icon: Phone,
        color: 'bg-red-100 border-red-400',
        urgent: true,
      },
      {
        title: '🏥 Crisis Center Locator',
        description: 'Find nearest mental health crisis center',
        action: 'Find Centers',
        icon: MapPin,
        color: 'bg-red-50 border-red-300',
        urgent: true,
      },
      {
        title: '👥 Emergency Contact',
        description: 'Call your emergency contact person immediately',
        action: 'Call Contact',
        icon: Users,
        color: 'bg-red-50 border-red-300',
        urgent: true,
      },
    ],
  };

  const handleInterventionUse = (title: string) => {
    setInterventionsUsed(prev => [...prev, title]);
    console.log(`Intervention used: ${title} at ${new Date().toISOString()}`);
  };

  const currentStrategies = interventionStrategies[riskLevel] || [];

  return (
    <div className="space-y-6">
      {/* Crisis Prevention Header */}
      <Card className={`shadow-lg ${riskLevel === 'high' ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Crisis Prevention & Early Intervention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                riskLevel === 'high' ? 'bg-red-500 animate-pulse' :
                riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="font-semibold">
                Current Risk Level: {riskLevel.toUpperCase()}
              </span>
            </div>
            <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'default' : 'secondary'}>
              {riskLevel === 'high' ? 'Immediate Action Required' :
               riskLevel === 'medium' ? 'Proactive Intervention' : 'Preventive Monitoring'}
            </Badge>
          </div>

          {riskLevel === 'high' && (
            <Alert className="mb-4 border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <strong>Crisis Alert:</strong> Immediate professional intervention recommended. 
                If you're having thoughts of self-harm, please reach out for help immediately.
              </AlertDescription>
            </Alert>
          )}

          <p className="text-gray-700">
            {riskLevel === 'high' 
              ? 'AI systems have detected patterns indicating immediate crisis risk. Multiple intervention resources are available.'
              : riskLevel === 'medium'
              ? 'Elevated risk patterns detected. Proactive intervention can help prevent crisis development.'
              : 'Current patterns show stable mental health. Continue monitoring and using preventive strategies.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      {(riskLevel === 'high' || riskLevel === 'medium') && (
        <Card className="shadow-lg border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Phone className="h-5 w-5" />
              Emergency Support Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-red-200">
                  <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                  <p className="text-lg font-bold text-red-600 my-2">{contact.number}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Available: {contact.available}</span>
                    <Button size="sm" variant="destructive">
                      Call Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intervention Strategies */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-purple-600" />
            Personalized Intervention Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {currentStrategies.map((strategy, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 ${strategy.color} ${strategy.urgent ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <strategy.icon className={`h-6 w-6 mt-1 ${strategy.urgent ? 'text-red-600' : 'text-gray-600'}`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-2 ${strategy.urgent ? 'text-red-800' : 'text-gray-900'}`}>
                      {strategy.title}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">{strategy.description}</p>
                    <div className="flex items-center justify-between">
                      <Button 
                        size="sm" 
                        variant={strategy.urgent ? "destructive" : "default"}
                        onClick={() => handleInterventionUse(strategy.title)}
                        className={strategy.urgent ? 'animate-pulse' : ''}
                      >
                        {strategy.action}
                      </Button>
                      {interventionsUsed.includes(strategy.title) && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {interventionsUsed.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Interventions Used Today
              </h4>
              <div className="flex flex-wrap gap-2">
                {interventionsUsed.map((intervention, index) => (
                  <Badge key={index} variant="outline" className="bg-green-100 border-green-300">
                    {intervention}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Planning */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Personal Safety Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Step 1</span>
                Warning Signs Recognition
              </h4>
              <p className="text-sm text-gray-700">
                AI has identified your personal warning signs: decreased sleep quality, 
                reduced social interactions, negative thought patterns.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Step 2</span>
                Coping Strategies
              </h4>
              <p className="text-sm text-gray-700">
                Your personalized coping strategies: mindfulness meditation, journaling, 
                calling trusted friends, listening to calming music.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Step 3</span>
                Professional Support
              </h4>
              <p className="text-sm text-gray-700">
                Your therapist: Dr. Smith (555-0123), Crisis hotline: 988, 
                Emergency contact: Family member (555-0456).
              </p>
            </div>

            <Button className="w-full">
              Update Safety Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Crisis Prevention Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Risk Assessment Completed</p>
                <p className="text-sm text-gray-600">AI analysis completed - {new Date().toLocaleString()}</p>
              </div>
            </div>
            
            {interventionsUsed.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Interventions Initiated</p>
                  <p className="text-sm text-gray-600">{interventionsUsed.length} strategies accessed today</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Next Check-in Scheduled</p>
                <p className="text-sm text-gray-600">Automated assessment in 4 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrisisPrevention;
