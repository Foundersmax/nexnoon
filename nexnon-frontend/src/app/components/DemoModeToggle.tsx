import { useState } from 'react';
import { GraduationCap, Users, X } from 'lucide-react';

interface DemoModeToggleProps {
  onRoleChange: (role: 'student' | 'instructor') => void;
  currentRole: 'student' | 'instructor';
}

export default function DemoModeToggle({ onRoleChange, currentRole }: DemoModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#889dd1] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#7a8ec2] transition-all flex items-center gap-2 font-medium"
      >
        {currentRole === 'student' ? (
          <>
            <GraduationCap className="h-5 w-5" />
            <span className="hidden sm:inline">Demo: Student</span>
          </>
        ) : (
          <>
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline">Demo: Nexnoon Expert</span>
          </>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Demo Mode</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Switch between student and Nexnoon Expert views to explore different features
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => {
                  onRoleChange('student');
                  setIsOpen(false);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  currentRole === 'student'
                    ? 'border-[#889dd1] bg-[#889dd1]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <GraduationCap className={`h-10 w-10 mx-auto mb-3 ${
                  currentRole === 'student' ? 'text-[#889dd1]' : 'text-gray-400'
                }`} />
                <div className={`font-semibold text-lg ${
                  currentRole === 'student' ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  Student
                </div>
                <div className="text-xs text-gray-500 mt-1">Learning view</div>
              </button>

              <button
                onClick={() => {
                  onRoleChange('instructor');
                  setIsOpen(false);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  currentRole === 'instructor'
                    ? 'border-[#889dd1] bg-[#889dd1]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className={`h-10 w-10 mx-auto mb-3 ${
                  currentRole === 'instructor' ? 'text-[#889dd1]' : 'text-gray-400'
                }`} />
                <div className={`font-semibold text-lg ${
                  currentRole === 'instructor' ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  Nexnoon Expert
                </div>
                <div className="text-xs text-gray-500 mt-1">Teaching view</div>
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is demo mode. Sign up to save your preferences and access real features.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
