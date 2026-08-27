import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Video, Users, Calendar, Clock, CheckCircle, Mic, Camera } from 'lucide-react';
import Header from '@/app/components/Header';
import { Button } from '@/app/components/ui/button';
import { classDetailUrl } from '@/lib/url';

export default function WaitingRoom() {
  const { id, sessionId } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 15, seconds: 30 });
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          return prev;
        }

        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isLive = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const handleJoinClass = () => {
    navigate(`/live-session/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Header variant="light" />
      
      <main className="py-12">
        <div className="w-[90vw] max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#889dd1] to-[#7a8ec2] px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Live Session Starting Soon</h1>
                  <p className="text-white/90">Advanced React Patterns - Live Coding Session</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">234 waiting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="p-12 text-center border-b border-gray-200">
              {!isLive ? (
                <>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full mb-6">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Starting in</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {/* Hours */}
                    {timeLeft.hours > 0 && (
                      <>
                        <div className="text-center">
                          <div className="bg-gray-900 text-white rounded-xl p-6 min-w-[100px]">
                            <div className="text-5xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                          </div>
                          <div className="text-sm text-gray-600 mt-2">Hours</div>
                        </div>
                        <div className="text-4xl font-bold text-gray-400">:</div>
                      </>
                    )}
                    
                    {/* Minutes */}
                    <div className="text-center">
                      <div className="bg-gray-900 text-white rounded-xl p-6 min-w-[100px]">
                        <div className="text-5xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">Minutes</div>
                    </div>
                    
                    <div className="text-4xl font-bold text-gray-400">:</div>
                    
                    {/* Seconds */}
                    <div className="text-center">
                      <div className="bg-gray-900 text-white rounded-xl p-6 min-w-[100px]">
                        <div className="text-5xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">Seconds</div>
                    </div>
                  </div>

                  <p className="text-gray-600">
                    The instructor will let you in when the class is ready to start
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full mb-6">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Class is Live!</span>
                  </div>
                  
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-xl font-semibold text-gray-900 mb-2">Ready to join?</p>
                    <p className="text-gray-600">Click the button below to enter the live session</p>
                  </div>

                  <Button
                    onClick={handleJoinClass}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                  >
                    Join Live Class Now
                  </Button>
                </>
              )}
            </div>

            {/* Device Check */}
            <div className="p-8 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Device Settings</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  videoEnabled ? 'border-[#889dd1] bg-[#889dd1]/5' : 'border-gray-300'
                }`} onClick={() => setVideoEnabled(!videoEnabled)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        videoEnabled ? 'bg-[#889dd1]' : 'bg-gray-400'
                      }`}>
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Camera</p>
                        <p className="text-sm text-gray-600">{videoEnabled ? 'On' : 'Off'}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      videoEnabled ? 'bg-[#889dd1]' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                        videoEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </div>
                </div>

                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  audioEnabled ? 'border-[#889dd1] bg-[#889dd1]/5' : 'border-gray-300'
                }`} onClick={() => setAudioEnabled(!audioEnabled)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        audioEnabled ? 'bg-[#889dd1]' : 'bg-gray-400'
                      }`}>
                        <Mic className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Microphone</p>
                        <p className="text-sm text-gray-600">{audioEnabled ? 'On' : 'Off'}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      audioEnabled ? 'bg-[#889dd1]' : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                        audioEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">!</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Before joining</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Make sure your camera and microphone are working</li>
                      <li>• Find a quiet place with good lighting</li>
                      <li>• Close unnecessary applications to improve performance</li>
                      <li>• Have a stable internet connection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="p-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Session Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[#889dd1] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">January 25, 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#889dd1] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">2:00 PM - 4:00 PM EST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-[#889dd1] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">120 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-[#889dd1] mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Nexnoon Expert</p>
                    <p className="font-medium text-gray-900">Sarah Johnson</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => id && navigate(classDetailUrl(id, undefined))}
              className="text-white hover:text-white/80"
            >
              Back to Class
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}