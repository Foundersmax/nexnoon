import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle,
  Users,
  Clock,
  Video,
  MessageSquare,
  Send,
  Monitor,
  BookOpen,
  Download,
  Calendar
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { classService } from '@/lib/api';
import { ENV } from '@/config/env';
import type { Class } from '@/types/api';

export default function LiveSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apiClass, setApiClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    classService
      .getClass(id)
      .then((data) => setApiClass(data))
      .catch(() => setApiClass(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Zoom from instructor's class schedule (first session with zoomLink)
  const firstSession = apiClass?.schedule?.find((s) => s.zoomLink);
  const zoomLinkFromApi = firstSession?.zoomLink;
  const meetingIdFromApi = firstSession?.zoomMeetingId;
  const passcodeFromApi = firstSession?.zoomPasscode;

  const useRealZoom = !ENV.ENABLE_DEMO_MODE && zoomLinkFromApi;
  const zoomLink = useRealZoom ? zoomLinkFromApi! : 'https://zoom.us/j/1234567890?pwd=example';
  const meetingId = useRealZoom && meetingIdFromApi ? String(meetingIdFromApi).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') : '123 456 7890';
  const passcode = useRealZoom && passcodeFromApi ? passcodeFromApi : 'nexnoon2026';

  const instructorName = apiClass?.instructor?.name ?? 'Nexnoon Expert';
  const firstSessionStart = apiClass?.schedule?.[0]?.startTime
    ? new Date(apiClass.schedule[0].startTime).toLocaleTimeString(undefined, { timeStyle: 'short' })
    : '2:00 PM EST';
  const durationMin = apiClass?.duration ?? 120;

  const classInfo = {
    title: apiClass?.title ?? 'Live Session',
    instructor: instructorName,
    startTime: firstSessionStart,
    duration: `${durationMin} min`,
    date: apiClass?.schedule?.[0]?.startTime
      ? new Date(apiClass.schedule[0].startTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
      : '—',
    description: apiClass?.description ?? 'Join the live class via Zoom. The instructor will share the link when the session starts.',
  };

  // UI States
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'materials'>('info');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const [chatMessages] = useState([
    { id: 1, user: 'Nexnoon Expert', message: 'Welcome everyone! The Zoom link is available above. See you in the session!', time: '1:55 PM', isInstructor: true },
    { id: 2, user: 'John Doe', message: 'Excited to join!', time: '1:56 PM', isInstructor: false },
    { id: 3, user: 'Jane Smith', message: 'Looking forward to this session!', time: '1:57 PM', isInstructor: false },
  ]);

  const materials = [
    { id: 1, name: 'Session Slides.pdf', size: '2.4 MB', type: 'PDF' },
    { id: 2, name: 'Code Examples.zip', size: '856 KB', type: 'ZIP' },
    { id: 3, name: 'Additional Resources.md', size: '12 KB', type: 'MD' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(zoomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinZoom = () => {
    window.open(zoomLink, '_blank');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // TODO: Implement real-time chat
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mb-4" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/classroom/${id}`)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-black">{classInfo.title}</h2>
              <p className="text-sm text-gray-600">{classInfo.instructor}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">{classInfo.startTime}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm text-red-600 font-medium">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Zoom Join Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Live Session on Zoom</h3>
                  <p className="text-gray-600">Click the button below to join the live class via Zoom</p>
                </div>

                <Button
                  onClick={handleJoinZoom}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg mb-4"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Join Zoom Meeting
                </Button>

                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Meeting Link</div>
                      <div className="text-sm font-mono text-gray-900 truncate">{zoomLink}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="ml-4"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Meeting ID</div>
                      <div className="text-lg font-semibold text-gray-900">{meetingId}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Passcode</div>
                      <div className="text-lg font-semibold text-gray-900">{passcode}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Monitor className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <strong>Note:</strong> Make sure you have Zoom installed on your device. If you don't have it, 
                      you can join via browser when you click the link above.
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Session Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Date & Time</div>
                      <div className="font-medium text-gray-900">{classInfo.date} at {classInfo.startTime}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-medium text-gray-900">{classInfo.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Description</div>
                      <div className="text-gray-900 mt-1">{classInfo.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 sticky top-24">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeTab === 'info'
                        ? 'bg-white text-black border-b-2 border-black'
                        : 'text-gray-500 hover:text-black bg-gray-50'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Info
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeTab === 'chat'
                        ? 'bg-white text-black border-b-2 border-black'
                        : 'text-gray-500 hover:text-black bg-gray-50'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeTab === 'materials'
                        ? 'bg-white text-black border-b-2 border-black'
                        : 'text-gray-500 hover:text-black bg-gray-50'
                    }`}
                  >
                    <Download className="h-4 w-4 inline mr-2" />
                    Files
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 h-96 overflow-y-auto">
                  {activeTab === 'info' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Instructor</h4>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#889dd1] to-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                            N
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{classInfo.instructor}</div>
                            <div className="text-xs text-gray-600">Expert Instructor</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Session Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Platform</span>
                            <span className="font-medium text-gray-900">Zoom</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium text-gray-900">{classInfo.duration}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Status</span>
                            <span className="font-medium text-red-600">Live Now</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="space-y-3">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="bg-gray-50 rounded p-3">
                          <div className="flex items-start justify-between mb-1">
                            <span className={`text-xs font-medium ${
                              msg.isInstructor ? 'text-black' : 'text-gray-900'
                            }`}>
                              {msg.user}
                            </span>
                            <span className="text-xs text-gray-400">{msg.time}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'materials' && (
                    <div className="space-y-2">
                      {materials.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <Download className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{file.name}</div>
                              <div className="text-xs text-gray-600">{file.size}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                {activeTab === 'chat' && (
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white border-gray-300 text-black text-sm"
                      />
                      <Button type="submit" className="bg-black hover:bg-gray-900 text-white">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}