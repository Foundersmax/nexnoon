import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  MessageSquare,
  FileText,
  CheckCircle,
  SkipBack,
  SkipForward
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';
import { classDetailUrl } from '@/lib/url';

export default function RecordedClass() {
  const { id, sessionId } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [completed, setCompleted] = useState(false);

  const videoData = {
    title: 'Introduction to Advanced React',
    duration: '45:00',
    currentTime: '15:45',
    description: 'In this session, we cover the fundamental concepts of advanced React patterns including custom hooks, render props, and compound components.',
  };

  const notes = [
    { time: '02:30', note: 'Custom hooks are reusable stateful logic' },
    { time: '15:45', note: 'Render props pattern for sharing code' },
    { time: '28:15', note: 'Compound components composition' },
  ];

  const handleMarkComplete = () => {
    setCompleted(true);
    setTimeout(() => {
      id && navigate(classDetailUrl(id, undefined));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      <main className="py-8">
        <div className="w-[90vw] max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
                {/* Video Area */}
                <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-10 w-10 text-white ml-1" />
                    </div>
                    <p className="text-white/70">Video Player</p>
                    <p className="text-white/50 text-sm mt-1">Click play to start the recording</p>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="bg-gray-800 px-4 py-3">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #889dd1 0%, #889dd1 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white text-sm">{videoData.currentTime}</span>
                      <span className="text-white/70 text-sm">{videoData.duration}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="text-white hover:text-[#889dd1] transition-colors">
                        <SkipBack className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 bg-[#889dd1] hover:bg-[#7a8ec2] rounded-full flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5 text-white" />
                        ) : (
                          <Play className="h-5 w-5 text-white ml-0.5" />
                        )}
                      </button>
                      <button className="text-white hover:text-[#889dd1] transition-colors">
                        <SkipForward className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:text-[#889dd1] transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="text-white hover:text-[#889dd1] transition-colors">
                        <Settings className="h-5 w-5" />
                      </button>
                      <button className="text-white hover:text-[#889dd1] transition-colors">
                        <Maximize className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{videoData.title}</h1>
                <p className="text-gray-600 mb-6">{videoData.description}</p>

                <div className="flex items-center gap-4">
                  {!completed ? (
                    <Button
                      onClick={handleMarkComplete}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Mark as Complete
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Completed!</span>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => id && navigate(classDetailUrl(id, undefined))}>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Discuss
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-5 w-5 mr-2" />
                    Notes
                  </Button>
                </div>
              </div>

              {/* My Notes */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">My Notes</h3>
                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((note, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <span className="text-sm font-medium text-[#889dd1]">{note.time}</span>
                        <p className="text-sm text-gray-700 flex-1">{note.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No notes yet. Click on the video timeline to add notes.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Up Next</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Component Architecture', duration: '60 min', completed: false },
                    { title: 'Custom Hooks Deep Dive', duration: '50 min', completed: false },
                    { title: 'Performance Optimization', duration: '55 min', completed: false },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-1">
                        <Play className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-6"
                  variant="outline"
                  onClick={() => id && navigate(classDetailUrl(id, undefined))}
                >
                  View All Lessons
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
