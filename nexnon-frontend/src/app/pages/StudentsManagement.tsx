import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { 
  ArrowLeft, 
  Search, 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  Award, 
  Eye,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentsManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'at-risk'>('all');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Mock class data
  const classInfo = {
    id: 1,
    title: 'Advanced React Patterns & Best Practices',
    totalStudents: 156,
    activeStudents: 142,
    completedStudents: 8,
    atRiskStudents: 6,
  };

  // Mock student data
  const students = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      enrolledDate: 'Jan 10, 2026',
      progress: 85,
      attendance: 95,
      lastActive: '2 hours ago',
      status: 'active',
      grade: 'A',
      completedAssignments: 8,
      totalAssignments: 10,
    },
    {
      id: 2,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      enrolledDate: 'Jan 12, 2026',
      progress: 92,
      attendance: 100,
      lastActive: '1 hour ago',
      status: 'active',
      grade: 'A+',
      completedAssignments: 10,
      totalAssignments: 10,
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.b@email.com',
      enrolledDate: 'Jan 08, 2026',
      progress: 100,
      attendance: 100,
      lastActive: '3 days ago',
      status: 'completed',
      grade: 'A+',
      completedAssignments: 10,
      totalAssignments: 10,
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.w@email.com',
      enrolledDate: 'Jan 15, 2026',
      progress: 68,
      attendance: 80,
      lastActive: '1 day ago',
      status: 'active',
      grade: 'B',
      completedAssignments: 7,
      totalAssignments: 10,
    },
    {
      id: 5,
      name: 'David Lee',
      email: 'david.lee@email.com',
      enrolledDate: 'Jan 11, 2026',
      progress: 35,
      attendance: 45,
      lastActive: '5 days ago',
      status: 'at-risk',
      grade: 'C',
      completedAssignments: 3,
      totalAssignments: 10,
    },
    {
      id: 6,
      name: 'Jessica Martinez',
      email: 'jessica.m@email.com',
      enrolledDate: 'Jan 09, 2026',
      progress: 88,
      attendance: 90,
      lastActive: '4 hours ago',
      status: 'active',
      grade: 'A',
      completedAssignments: 9,
      totalAssignments: 10,
    },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleBulkEmail = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }
    // TODO: Implement bulk email
    console.log('Send email to:', selectedStudents);
    alert(`Sending email to ${selectedStudents.length} students (Demo mode)`);
  };

  const handleExportData = () => {
    // TODO: Implement export
    console.log('Export student data');
    alert('Exporting student data... (Demo mode)');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-black text-white';
      case 'completed':
        return 'bg-gray-100 text-black border-2 border-black';
      case 'at-risk':
        return 'bg-gray-100 text-black border-2 border-black';
      default:
        return 'bg-gray-100 text-black';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'completed':
        return <Award className="h-3 w-3" />;
      case 'at-risk':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="light" />
      
      <main className="py-12">
        <div className="w-[90vw] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/my-classes')}
              className="flex items-center text-gray-600 hover:text-black mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to My Classes
            </button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Students Management</h1>
                <p className="text-gray-600">{classInfo.title}</p>
              </div>
              <Button
                onClick={handleExportData}
                className="bg-white text-black border-2 border-black rounded-none hover:bg-black hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> You're viewing sample student data.
                </p>
              </div>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-black rounded-none p-5">
              <div className="text-3xl font-bold text-black mb-1">{classInfo.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="bg-white border-2 border-black rounded-none p-5">
              <div className="text-3xl font-bold text-black mb-1">{classInfo.activeStudents}</div>
              <div className="text-sm text-gray-600">Active Students</div>
            </div>
            <div className="bg-white border-2 border-black rounded-none p-5">
              <div className="text-3xl font-bold text-black mb-1">{classInfo.completedStudents}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white border-2 border-black rounded-none p-5">
              <div className="text-3xl font-bold text-black mb-1">{classInfo.atRiskStudents}</div>
              <div className="text-sm text-gray-600">At Risk</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white border-2 border-black rounded-none p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students by name or email..."
                    className="pl-10 border-2 border-black rounded-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {['all', 'active', 'completed', 'at-risk'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-4 py-2 text-xs font-bold transition-colors border-2 border-black ${
                      filterStatus === status
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {status.toUpperCase().replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {selectedStudents.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-black flex items-center justify-between">
                <span className="text-sm font-medium text-black">
                  {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkEmail}
                    className="bg-black text-white hover:bg-gray-800 rounded-none text-xs"
                  >
                    <Mail className="h-3 w-3 mr-2" />
                    Send Email
                  </Button>
                  <Button
                    onClick={() => setSelectedStudents([])}
                    variant="outline"
                    className="border-2 border-black rounded-none text-xs"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Students Table */}
          <div className="bg-white border-2 border-black rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="p-4 text-left text-xs font-bold">STUDENT</th>
                    <th className="p-4 text-left text-xs font-bold">STATUS</th>
                    <th className="p-4 text-left text-xs font-bold">PROGRESS</th>
                    <th className="p-4 text-left text-xs font-bold">ATTENDANCE</th>
                    <th className="p-4 text-left text-xs font-bold">GRADE</th>
                    <th className="p-4 text-left text-xs font-bold">LAST ACTIVE</th>
                    <th className="p-4 text-left text-xs font-bold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className={`border-t-2 border-black hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-black text-sm">{student.name}</div>
                          <div className="text-xs text-gray-600">{student.email}</div>
                          <div className="text-xs text-gray-500 mt-1">Enrolled: {student.enrolledDate}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold ${getStatusColor(student.status)}`}>
                          {getStatusIcon(student.status)}
                          {student.status.toUpperCase().replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 h-2 border border-black max-w-[100px]">
                            <div
                              className="bg-black h-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-black">{student.progress}%</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {student.completedAssignments}/{student.totalAssignments} assignments
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-black">{student.attendance}%</div>
                      </td>
                      <td className="p-4">
                        <div className="text-lg font-bold text-black">{student.grade}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-gray-600">{student.lastActive}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // TODO: View student profile
                              console.log('View student:', student.id);
                            }}
                            className="p-2 hover:bg-black hover:text-white border border-black transition-colors"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Send message
                              console.log('Message student:', student.id);
                            }}
                            className="p-2 hover:bg-black hover:text-white border border-black transition-colors"
                            title="Send Message"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 hover:bg-black hover:text-white border border-black transition-colors"
                            title="More Options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No students found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Insights Section */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white border-2 border-black rounded-none p-6">
              <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ENGAGEMENT INSIGHTS
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Average Progress</span>
                  <span className="text-sm font-bold text-black">78%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Average Attendance</span>
                  <span className="text-sm font-bold text-black">85%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Assignment Completion</span>
                  <span className="text-sm font-bold text-black">82%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Students at Risk</span>
                  <span className="text-sm font-bold text-black">{classInfo.atRiskStudents}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-black rounded-none p-6">
              <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                TOP PERFORMERS
              </h3>
              <div className="space-y-3">
                {students
                  .filter(s => s.status !== 'at-risk')
                  .sort((a, b) => b.progress - a.progress)
                  .slice(0, 5)
                  .map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-black">{student.name}</div>
                          <div className="text-xs text-gray-600">{student.grade} Grade</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-black">{student.progress}%</div>
                        <div className="text-xs text-gray-600">Progress</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
