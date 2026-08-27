import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { 
  Play, 
  Lock, 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  Award,
  Calendar,
  Users,
  Video,
  Download,
  BookOpen
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Mock class data
const classData = {
  id: 1,
  title: 'Advanced React Patterns & Best Practices',
  instructor: 'Nexnoon Expert',
  progress: 65,
  thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  description: 'Master advanced React patterns and build production-ready applications.',
  
  modules: [
    {
      id: 1,
      title: 'Week 1: React Fundamentals Review',
      sessions: [
        { id: 1, title: 'Introduction to Advanced React', duration: '45 min', type: 'video', completed: true, isLive: false },
        { id: 2, title: 'Component Architecture', duration: '60 min', type: 'video', completed: true, isLive: false },
        { id: 3, title: 'Live Q&A Session', duration: '90 min', type: 'live', completed: true, isLive: false, date: '2026-01-15' },
      ]
    },
    {
      id: 2,
      title: 'Week 2: Advanced Hooks & Patterns',
      sessions: [
        { id: 4, title: 'Custom Hooks Deep Dive', duration: '50 min', type: 'video', completed: true, isLive: false },
        { id: 5, title: 'Performance Optimization', duration: '55 min', type: 'video', completed: false, isLive: false },
        { id: 6, title: 'Live Coding Session', duration: '120 min', type: 'live', completed: false, isLive: true, isUpcoming: true, date: '2026-01-25', time: '2:00 PM EST' },
      ]
    },
    {
      id: 3,
      title: 'Week 3: State Management',
      sessions: [
        { id: 7, title: 'Context API Patterns', duration: '45 min', type: 'video', completed: false, isLive: false, locked: true },
        { id: 8, title: 'Redux Toolkit', duration: '60 min', type: 'video', completed: false, isLive: false, locked: true },
        { id: 9, title: 'Live Workshop', duration: '90 min', type: 'live', completed: false, isLive: false, locked: true, date: '2026-02-01' },
      ]
    }
  ],

  stats: {
    totalSessions: 9,
    completedSessions: 4,
    totalDuration: '540 min',
    enrolledStudents: 1234
  }
};

export default function ClassRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'discussions' | 'assignments' | 'materials'>('overview');

  const handleSessionClick = (session: any) => {
    if (session.locked || !id) return;
    
    if (session.isLive && session.isUpcoming) {
      navigate(`/waiting-room/${id}`);
    } else if (session.type === 'live' && session.completed) {
      navigate(`/recorded-class/${id}`);
    } else if (session.type === 'video') {
      navigate(`/recorded-class/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      <main className="py-8">
        <div className="w-[90vw] max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={classData.thumbnail}
                alt={classData.title}
                className="w-full md:w-64 h-40 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{classData.title}</h1>
                
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Your Progress</span>
                    <span className="font-semibold text-gray-900">{classData.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-black h-3 rounded-full transition-all"
                      style={{ width: `${classData.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{classData.stats.completedSessions}/{classData.stats.totalSessions}</div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{classData.stats.totalDuration}</div>
                    <div className="text-xs text-gray-600">Total Time</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{classData.stats.enrolledStudents}</div>
                    <div className="text-xs text-gray-600">Students</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">A</div>
                    <div className="text-xs text-gray-600">Grade</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-xl border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex gap-8 px-6">
                    {[
                      { id: 'overview', label: 'Course Content', icon: BookOpen },
                      { id: 'discussions', label: 'Discussions', icon: MessageSquare },
                      { id: 'assignments', label: 'Assignments', icon: FileText },
                      { id: 'materials', label: 'Materials', icon: Download },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-[#889dd1] text-[#889dd1]'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <tab.icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {classData.modules.map((module) => (
                        <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="font-bold text-gray-900">{module.title}</h3>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {module.sessions.map((session) => (
                              <div
                                key={session.id}
                                onClick={() => handleSessionClick(session)}
                                className={`px-6 py-4 flex items-center justify-between ${
                                  session.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                                } transition-colors`}
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  {session.locked ? (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  ) : session.completed ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : session.isLive ? (
                                    <div className="relative">
                                      <Video className="h-5 w-5 text-red-600" />
                                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                                    </div>
                                  ) : (
                                    <Play className="h-5 w-5 text-gray-400" />
                                  )}
                                  
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{session.title}</h4>
                                    <div className="flex items-center gap-4 mt-1">
                                      <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {session.duration}
                                      </span>
                                      {session.type === 'live' && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          session.isUpcoming 
                                            ? 'bg-red-100 text-red-700' 
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                          {session.isUpcoming ? `LIVE - ${session.time}` : 'Recorded'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {!session.locked && (
                                  <Button
                                    size="sm"
                                    variant={session.isUpcoming ? 'default' : 'outline'}
                                    className={session.isUpcoming ? 'bg-red-600 hover:bg-red-700' : ''}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!id) return;
                                      if (session.isUpcoming) {
                                        navigate(`/waiting-room/${id}`);
                                      } else {
                                        navigate(`/live-session/${id}`);
                                      }
                                    }}
                                  >
                                    {session.isUpcoming ? 'Join Live' : session.completed ? 'Rewatch' : 'Watch'}
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'discussions' && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Class Discussions</h3>
                      <p className="text-gray-600 mb-4">Connect with classmates and instructors</p>
                      <Button onClick={() => navigate(`/class/${id}/discussions`)}>
                        View Discussions
                      </Button>
                    </div>
                  )}

                  {activeTab === 'assignments' && (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignments</h3>
                      <p className="text-gray-600 mb-4">Complete assignments to reinforce learning</p>
                      <Button onClick={() => navigate(`/class/${id}/assignments`)}>
                        View Assignments
                      </Button>
                    </div>
                  )}

                  {activeTab === 'materials' && (
                    <div className="text-center py-12">
                      <Download className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Materials</h3>
                      <p className="text-gray-600 mb-4">Download slides, code, and resources</p>
                      <Button onClick={() => navigate(`/class/${id}/materials`)}>
                        View Materials
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => navigate(`/class/${id}/materials`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Materials
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => navigate(`/class/${id}/certificate`)}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => navigate(`/class/${id}/discussions`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask a Question
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Instructor</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#889dd1] to-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                      N
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{classData.instructor}</p>
                      {/* <p className="text-sm text-gray-600">Nexnoon Expert</p> */}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}