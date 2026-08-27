import { useState } from 'react';
import { useNavigate } from 'react-router';
import { classDetailUrl } from '@/lib/url';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Settings,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Search,
  Filter,
  Download,
  Clock,
  UserCheck,
  UserX,
  Award,
  FolderOpen,
  Plus,
  Code,
  Palette,
  Briefcase,
  Camera,
  Music,
  Heart,
  Globe
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classes' | 'categories' | 'revenue' | 'deletions' | 'approvals'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in production, this would come from backend
  const stats = {
    totalUsers: 12543,
    totalInstructors: 234,
    totalClasses: 567,
    activeClasses: 423,
    totalRevenue: 456789,
    monthlyRevenue: 45678,
    pendingApprovals: 12,
    pendingDeletions: 8,
    activeNow: 1234
  };
  
  // Mock pending deletion requests
  const pendingDeletions = [
    { id: 1, classId: 12, title: 'Introduction to Python', instructor: 'Sarah Johnson', students: 45, requestedDate: 'Jan 26, 2026', reason: 'Unable to continue due to personal reasons', revenue: 3599.55, category: 'Development' },
    { id: 2, classId: 23, title: 'Advanced JavaScript', instructor: 'Michael Chen', students: 67, requestedDate: 'Jan 25, 2026', reason: 'Low enrollment and engagement', revenue: 5368.33, category: 'Development' },
    { id: 3, classId: 34, title: 'Web Design Basics', instructor: 'Emma Williams', students: 23, requestedDate: 'Jan 24, 2026', reason: 'Content needs major revision', revenue: 1839.77, category: 'Design' },
    { id: 4, classId: 45, title: 'Mobile App Development', instructor: 'David Martinez', students: 89, requestedDate: 'Jan 23, 2026', reason: 'Scheduling conflicts', revenue: 8901.11, category: 'Development' },
    { id: 5, classId: 56, title: 'Digital Marketing Strategy', instructor: 'Lisa Anderson', students: 34, requestedDate: 'Jan 22, 2026', reason: 'Outdated curriculum', revenue: 3026.66, category: 'Marketing' },
    { id: 6, classId: 67, title: 'Database Management', instructor: 'James Taylor', students: 12, requestedDate: 'Jan 21, 2026', reason: 'Technical difficulties', revenue: 1068.00, category: 'Technology' },
    { id: 7, classId: 78, title: 'Machine Learning Intro', instructor: 'Sophia Lee', students: 56, requestedDate: 'Jan 20, 2026', reason: 'Moving to different platform', revenue: 5604.44, category: 'Data Science' },
    { id: 8, classId: 89, title: 'Graphic Design Masterclass', instructor: 'Carlos Rodriguez', students: 78, requestedDate: 'Jan 19, 2026', reason: 'Class restructuring needed', revenue: 6942.22, category: 'Design' },
  ];

  // Mock pending instructor approvals
  const pendingInstructorApprovals = [
    { id: 1, userId: 101, name: 'Robert Anderson', email: 'robert.anderson@email.com', expertise: 'Web Development', experience: '5 years', joinedDate: 'Jan 27, 2026', bio: 'Full-stack developer with expertise in React and Node.js' },
    { id: 2, userId: 102, name: 'Jennifer Martinez', email: 'jennifer.m@email.com', expertise: 'UX Design', experience: '7 years', joinedDate: 'Jan 26, 2026', bio: 'Senior UX Designer specializing in mobile applications' },
    { id: 3, userId: 103, name: 'Christopher Lee', email: 'chris.lee@email.com', expertise: 'Data Science', experience: '4 years', joinedDate: 'Jan 26, 2026', bio: 'Data scientist with Python and Machine Learning experience' },
    { id: 4, userId: 104, name: 'Amanda Thompson', email: 'amanda.t@email.com', expertise: 'Digital Marketing', experience: '6 years', joinedDate: 'Jan 25, 2026', bio: 'Marketing strategist focused on social media and SEO' },
    { id: 5, userId: 105, name: 'Daniel Kim', email: 'daniel.kim@email.com', expertise: 'Mobile Development', experience: '3 years', joinedDate: 'Jan 25, 2026', bio: 'iOS and Android developer with published apps' },
    { id: 6, userId: 106, name: 'Michelle Garcia', email: 'michelle.g@email.com', expertise: 'Graphic Design', experience: '8 years', joinedDate: 'Jan 24, 2026', bio: 'Freelance designer specializing in branding and illustration' },
    { id: 7, userId: 107, name: 'Kevin Brown', email: 'kevin.brown@email.com', expertise: 'Business Strategy', experience: '10 years', joinedDate: 'Jan 24, 2026', bio: 'MBA with consulting experience in tech startups' },
    { id: 8, userId: 108, name: 'Lisa Nguyen', email: 'lisa.nguyen@email.com', expertise: 'Photography', experience: '5 years', joinedDate: 'Jan 23, 2026', bio: 'Professional photographer and Adobe Certified Expert' },
    { id: 9, userId: 109, name: 'Brian Wilson', email: 'brian.w@email.com', expertise: 'Cybersecurity', experience: '6 years', joinedDate: 'Jan 23, 2026', bio: 'Security analyst with CISSP certification' },
    { id: 10, userId: 110, name: 'Jessica Taylor', email: 'jessica.t@email.com', expertise: 'Content Writing', experience: '4 years', joinedDate: 'Jan 22, 2026', bio: 'Content strategist and copywriter for tech companies' },
    { id: 11, userId: 111, name: 'Matthew Davis', email: 'matt.davis@email.com', expertise: 'Video Production', experience: '7 years', joinedDate: 'Jan 22, 2026', bio: 'Video editor and producer with YouTube channel' },
    { id: 12, userId: 112, name: 'Ashley Moore', email: 'ashley.m@email.com', expertise: 'Project Management', experience: '9 years', joinedDate: 'Jan 21, 2026', bio: 'PMP certified project manager in agile environments' },
  ];

  const recentUsers = [
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Student', status: 'Active', joined: 'Jan 25, 2026', classes: 3 },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Instructor', status: 'Active', joined: 'Jan 24, 2026', classes: 5 },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', role: 'Student', status: 'Active', joined: 'Jan 23, 2026', classes: 2 },
    { id: 4, name: 'Emma Davis', email: 'emma@example.com', role: 'Instructor', status: 'Pending', joined: 'Jan 22, 2026', classes: 0 },
    { id: 5, name: 'David Lee', email: 'david@example.com', role: 'Student', status: 'Suspended', joined: 'Jan 20, 2026', classes: 1 },
  ];

  const recentClasses = [
    { id: 1, title: 'Advanced React Patterns', instructor: 'Nexnoon Expert', students: 156, revenue: 13884, status: 'Active', category: 'Development' },
    { id: 2, title: 'UI/UX Design Fundamentals', instructor: 'Michael Chen', students: 98, revenue: 7840, status: 'Active', category: 'Design' },
    { id: 3, title: 'Digital Marketing 2026', instructor: 'Emma Williams', students: 88, revenue: 8799, status: 'Active', category: 'Marketing' },
    { id: 4, title: 'Python for Beginners', instructor: 'James Rodriguez', students: 234, revenue: 18486, status: 'Pending', category: 'Development' },
    { id: 5, title: 'Data Science Masterclass', instructor: 'Lisa Anderson', students: 0, revenue: 0, status: 'Draft', category: 'Data Science' },
  ];

  const revenueData = [
    { month: 'Aug', amount: 32450 },
    { month: 'Sep', amount: 38200 },
    { month: 'Oct', amount: 42100 },
    { month: 'Nov', amount: 39800 },
    { month: 'Dec', amount: 45300 },
    { month: 'Jan', amount: 45678 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      <main className="py-8">
        <div className="w-[90vw] max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your platform, users, and content</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs text-green-600 font-medium">+12.5%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.totalInstructors} instructors
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs text-green-600 font-medium">+8.3%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalClasses}
              </div>
              <div className="text-sm text-gray-600">Total Classes</div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.activeClasses} active
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs text-green-600 font-medium">+15.2%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="mt-2 text-xs text-gray-500">
                ${stats.monthlyRevenue.toLocaleString()} this month
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-xs text-blue-600 font-medium">Live</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.activeNow.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Active Now</div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.pendingApprovals} pending approvals
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'users', label: 'Users Management', icon: Users },
                  { id: 'classes', label: 'Classes Management', icon: BookOpen },
                  { id: 'categories', label: 'Categories Management', icon: FolderOpen },
                  { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign },
                  { id: 'deletions', label: 'Pending Deletions', icon: Trash2 },
                  { id: 'approvals', label: 'Pending Approvals', icon: CheckCircle },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-black text-black'
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
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Revenue Chart */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend (Last 6 Months)</h3>
                    <div className="h-64 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-6">
                      <div className="h-full flex items-end justify-between gap-2">
                        {revenueData.map((data, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-black rounded-t" style={{ height: `${(data.amount / 50000) * 100}%` }}>
                              <div className="text-xs text-white p-1 text-center opacity-0 hover:opacity-100 transition-opacity">
                                ${(data.amount / 1000).toFixed(1)}k
                              </div>
                            </div>
                            <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('users')}
                        >
                          View All
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {recentUsers.slice(0, 3).map((user) => (
                          <div
                            key={user.id}
                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{user.name}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                user.status === 'Active' ? 'bg-green-100 text-green-700' :
                                user.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {user.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {user.role} • Joined {user.joined}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Classes</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('classes')}
                        >
                          View All
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {recentClasses.slice(0, 3).map((cls) => (
                          <div
                            key={cls.id}
                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => navigate(classDetailUrl(String(cls.id), cls.title))}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{cls.title}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                cls.status === 'Active' ? 'bg-green-100 text-green-700' :
                                cls.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {cls.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">{cls.instructor}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {cls.students} students • ${cls.revenue.toLocaleString()} revenue
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Management Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">User</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Role</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Joined</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Classes</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                user.role === 'Instructor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role === 'Instructor' ? <Award className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                user.status === 'Active' ? 'bg-green-100 text-green-700' :
                                user.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {user.status === 'Active' ? <CheckCircle className="h-3 w-3" /> :
                                 user.status === 'Pending' ? <Clock className="h-3 w-3" /> :
                                 <XCircle className="h-3 w-3" />}
                                {user.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">{user.joined}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{user.classes}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/profile/${user.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {/* Edit user */}}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {/* Delete user */}}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Classes Management Tab */}
              {activeTab === 'classes' && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search classes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Classes Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Class</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Instructor</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Category</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Students</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Revenue</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentClasses.map((cls) => (
                          <tr key={cls.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{cls.title}</div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">{cls.instructor}</td>
                            <td className="py-4 px-4">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {cls.category}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">{cls.students}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">${cls.revenue.toLocaleString()}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                cls.status === 'Active' ? 'bg-green-100 text-green-700' :
                                cls.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {cls.status === 'Active' ? <CheckCircle className="h-3 w-3" /> :
                                 cls.status === 'Pending' ? <AlertCircle className="h-3 w-3" /> :
                                 <Clock className="h-3 w-3" />}
                                {cls.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(classDetailUrl(String(cls.id), cls.title))}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/edit-class/${cls.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {cls.status === 'Pending' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {/* Approve class */}}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {/* Delete class */}}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Categories Management Tab */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  {/* Header with Add Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Category Management</h3>
                      <p className="text-sm text-gray-600">Create and manage all course categories</p>
                    </div>
                    <Button className="bg-black text-white hover:bg-gray-900">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Category
                    </Button>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Categories Grid View */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 1, name: 'Development', slug: 'development', description: 'Programming, web dev, mobile apps, and software engineering', classes: 234, revenue: 184860, icon: Code, color: 'from-blue-500 to-blue-600' },
                      { id: 2, name: 'Design', slug: 'design', description: 'UI/UX design, graphic design, and creative arts', classes: 98, revenue: 78400, icon: Palette, color: 'from-purple-500 to-purple-600' },
                      { id: 3, name: 'Marketing', slug: 'marketing', description: 'Digital marketing, SEO, and growth strategies', classes: 88, revenue: 87990, icon: TrendingUp, color: 'from-green-500 to-green-600' },
                      { id: 4, name: 'Business', slug: 'business', description: 'Business strategy, entrepreneurship, and management', classes: 156, revenue: 138840, icon: Briefcase, color: 'from-orange-500 to-orange-600' },
                      { id: 5, name: 'Photography', slug: 'photography', description: 'Photography techniques and visual storytelling', classes: 67, revenue: 53680, icon: Camera, color: 'from-pink-500 to-pink-600' },
                      { id: 6, name: 'Music', slug: 'music', description: 'Music production and instrument mastery', classes: 45, revenue: 35995, icon: Music, color: 'from-red-500 to-red-600' },
                      { id: 7, name: 'Health & Wellness', slug: 'health-wellness', description: 'Fitness, nutrition, and holistic wellness', classes: 78, revenue: 69420, icon: Heart, color: 'from-teal-500 to-teal-600' },
                      { id: 8, name: 'Languages', slug: 'languages', description: 'Learn new languages and communication skills', classes: 112, revenue: 98560, icon: Globe, color: 'from-indigo-500 to-indigo-600' },
                    ].map((category) => {
                      const Icon = category.icon;
                      return (
                        <div
                          key={category.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {/* Edit category */}}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {/* Delete category */}}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <div className="text-gray-600">Classes</div>
                              <div className="font-bold text-gray-900">{category.classes}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-600">Revenue</div>
                              <div className="font-bold text-gray-900">${(category.revenue / 1000).toFixed(1)}k</div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              Slug: <code className="bg-gray-100 px-2 py-0.5 rounded">{category.slug}</code>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Revenue Analytics Tab */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">This Month</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${stats.monthlyRevenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-green-600 font-medium">+15.2% vs last month</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Avg. Class Revenue</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${(stats.totalRevenue / stats.totalClasses).toFixed(0)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 font-medium">Per active class</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Avg. Revenue/User</div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${(stats.totalRevenue / stats.totalUsers).toFixed(0)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-purple-600 font-medium">Customer lifetime value</div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Classes</h3>
                    <div className="space-y-4">
                      {recentClasses
                        .filter(cls => cls.revenue > 0)
                        .sort((a, b) => b.revenue - a.revenue)
                        .map((cls, index) => (
                          <div key={cls.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{cls.title}</div>
                                <div className="text-sm text-gray-600">{cls.instructor}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ${cls.revenue.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">{cls.students} students</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Deletions Tab */}
              {activeTab === 'deletions' && (
                <div className="space-y-6">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search deletions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Deletions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Class</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Instructor</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Category</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Students</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Revenue</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Requested Date</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Reason</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingDeletions.map((del) => (
                          <tr key={del.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{del.title}</div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">{del.instructor}</td>
                            <td className="py-4 px-4">
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {del.category}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">{del.students}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">${del.revenue.toLocaleString()}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{del.requestedDate}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{del.reason}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(classDetailUrl(String(del.classId), del.title))}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => {/* Approve deletion */}}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {/* Deny deletion */}}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pending Approvals Tab */}
              {activeTab === 'approvals' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">Pending Nexnoon Expert Applications</h4>
                      <p className="text-sm text-yellow-800">
                        Review and approve new instructor applications. Approved instructors will gain access to the Nexnoon Expert Dashboard.
                      </p>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search instructor applications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {/* Instructor Approvals Grid */}
                  <div className="grid gap-6">
                    {pendingInstructorApprovals.map((instructor) => (
                      <div
                        key={instructor.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Instructor Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                  {instructor.name}
                                </h3>
                                <p className="text-gray-600">{instructor.email}</p>
                              </div>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                <Clock className="h-3 w-3" />
                                Pending Review
                              </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <div className="text-sm text-gray-600 mb-1">Expertise</div>
                                <div className="flex items-center gap-2">
                                  <Award className="h-4 w-4 text-[#889dd1]" />
                                  <span className="font-medium text-gray-900">{instructor.expertise}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 mb-1">Experience</div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-[#889dd1]" />
                                  <span className="font-medium text-gray-900">{instructor.experience}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="text-sm text-gray-600 mb-1">Bio</div>
                              <p className="text-gray-900">{instructor.bio}</p>
                            </div>

                            <div className="text-sm text-gray-500">
                              Applied on {instructor.joinedDate}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex lg:flex-col gap-3 lg:w-48">
                            <Button
                              className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                // TODO: Implement approval logic
                                console.log('Approve instructor:', instructor.id);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 lg:flex-none text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                // TODO: Implement rejection logic
                                console.log('Reject instructor:', instructor.id);
                              }}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 lg:flex-none"
                              onClick={() => navigate(`/profile/${instructor.userId}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {pendingInstructorApprovals.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No Pending Approvals
                      </h3>
                      <p className="text-gray-600">
                        All instructor applications have been reviewed.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Button
              className="bg-black text-white hover:bg-gray-900 h-16"
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              View Detailed Analytics
            </Button>
            <Button
              variant="outline"
              className="h-16"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-5 w-5 mr-2" />
              Platform Settings
            </Button>
            <Button
              variant="outline"
              className="h-16"
              onClick={() => {/* Export reports */}}
            >
              <Download className="h-5 w-5 mr-2" />
              Export Reports
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}