import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock,
  Calendar,
  Download,
  Eye,
  Star,
  MessageSquare,
  Award,
  Activity
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Analytics() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Mock analytics data
  const analyticsData = {
    week: {
      revenue: 1250,
      students: 12,
      sessions: 8,
      avgRating: 4.8,
      completionRate: 78,
      engagementRate: 85,
    },
    month: {
      revenue: 8500,
      students: 45,
      sessions: 32,
      avgRating: 4.9,
      completionRate: 82,
      engagementRate: 88,
    },
    quarter: {
      revenue: 24500,
      students: 128,
      sessions: 96,
      avgRating: 4.8,
      completionRate: 80,
      engagementRate: 86,
    },
    year: {
      revenue: 89500,
      students: 342,
      sessions: 384,
      avgRating: 4.9,
      completionRate: 84,
      engagementRate: 90,
    },
  };

  const currentData = analyticsData[timeRange];

  const revenueByClass = [
    { name: 'Advanced React Patterns', revenue: 46800, students: 156, percentage: 52 },
    { name: 'UI/UX Design Fundamentals', revenue: 19404, students: 98, percentage: 22 },
    { name: 'Digital Marketing Strategy', revenue: 15840, students: 88, percentage: 18 },
    { name: 'Python for Data Science', revenue: 7456, students: 32, percentage: 8 },
  ];

  const performanceMetrics = [
    { label: 'Average Session Duration', value: '1.8 hours', change: '+5%', trend: 'up' },
    { label: 'Student Retention Rate', value: '94%', change: '+2%', trend: 'up' },
    { label: 'Assignment Completion', value: '82%', change: '-3%', trend: 'down' },
    { label: 'Live Attendance Rate', value: '88%', change: '+7%', trend: 'up' },
  ];

  const monthlyTrend = [
    { month: 'Aug', revenue: 6200, students: 28 },
    { month: 'Sep', revenue: 7100, students: 35 },
    { month: 'Oct', revenue: 7800, students: 38 },
    { month: 'Nov', revenue: 8200, students: 42 },
    { month: 'Dec', revenue: 8900, students: 48 },
    { month: 'Jan', revenue: 8500, students: 45 },
  ];

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report for:', timeRange);
    alert(`Generating ${timeRange} report... (Demo mode)`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="light" />
      
      <main className="py-12">
        <div className="w-[90vw] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/instructor-dashboard')}
              className="flex items-center text-gray-600 hover:text-black mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Analytics & Reports</h1>
                <p className="text-gray-600">Detailed insights into your teaching performance</p>
              </div>
              <div className="flex gap-3">
                <div className="flex gap-2 bg-white border-2 border-black p-1">
                  {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 text-xs font-bold transition-colors ${
                        timeRange === range
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {range.toUpperCase()}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleExportReport}
                  className="bg-white text-black border-2 border-black rounded-none hover:bg-black hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> You're viewing sample analytics data.
                </p>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white border-2 border-black rounded-none p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-black">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              <div className="text-3xl font-bold text-black mb-1">
                ${currentData.revenue.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 font-medium">TOTAL REVENUE</div>
            </div>

            <div className="bg-white border-2 border-black rounded-none p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-black">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              <div className="text-3xl font-bold text-black mb-1">
                {currentData.students}
              </div>
              <div className="text-xs text-gray-600 font-medium">NEW STUDENTS</div>
            </div>

            <div className="bg-white border-2 border-black rounded-none p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-black">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              <div className="text-3xl font-bold text-black mb-1">
                {currentData.sessions}
              </div>
              <div className="text-xs text-gray-600 font-medium">LIVE SESSIONS</div>
            </div>

            <div className="bg-white border-2 border-black rounded-none p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-black">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              <div className="text-3xl font-bold text-black mb-1">
                {currentData.avgRating}★
              </div>
              <div className="text-xs text-gray-600 font-medium">AVG RATING</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Revenue Trend */}
            <div className="lg:col-span-2 bg-white border-2 border-black rounded-none p-6">
              <h2 className="text-xl font-bold text-black mb-6">REVENUE & STUDENT TREND</h2>
              
              {/* Simple bar chart visualization */}
              <div className="space-y-4">
                {monthlyTrend.map((data, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-black">{data.month}</span>
                      <div className="flex gap-4">
                        <span className="text-xs text-gray-600">${data.revenue}</span>
                        <span className="text-xs text-gray-600">{data.students} students</span>
                      </div>
                    </div>
                    <div className="relative h-3 bg-gray-200 border border-black">
                      <div
                        className="absolute h-full bg-black"
                        style={{ width: `${(data.revenue / 10000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t-2 border-black grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{currentData.completionRate}%</div>
                  <div className="text-xs text-gray-600 mt-1">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{currentData.engagementRate}%</div>
                  <div className="text-xs text-gray-600 mt-1">Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">94%</div>
                  <div className="text-xs text-gray-600 mt-1">Retention Rate</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white border-2 border-black rounded-none p-6">
              <h2 className="text-xl font-bold text-black mb-6">PERFORMANCE METRICS</h2>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-600 font-medium">{metric.label}</span>
                      <span className={`text-xs font-bold ${
                        metric.trend === 'up' ? 'text-black' : 'text-gray-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-black">{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue by Class */}
          <div className="bg-white border-2 border-black rounded-none p-6 mb-8">
            <h2 className="text-xl font-bold text-black mb-6">REVENUE BY CLASS</h2>
            <div className="space-y-5">
              {revenueByClass.map((cls, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-bold text-sm text-black">{cls.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {cls.students} students • ${cls.revenue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-black">{cls.percentage}%</div>
                  </div>
                  <div className="relative h-2 bg-gray-200 border border-black">
                    <div
                      className="absolute h-full bg-black"
                      style={{ width: `${cls.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white border-2 border-black rounded-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-black">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-black">PEAK HOURS</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Most Active</span>
                  <span className="font-bold text-black">2PM - 4PM EST</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Best Day</span>
                  <span className="font-bold text-black">Wednesday</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Duration</span>
                  <span className="font-bold text-black">1.8 hours</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-black rounded-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-black">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-black">ENGAGEMENT</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Questions Asked</span>
                  <span className="font-bold text-black">342</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Chat Messages</span>
                  <span className="font-bold text-black">1,824</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-bold text-black">96%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-black rounded-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-black">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-black">ACHIEVEMENTS</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Certificates Issued</span>
                  <span className="font-bold text-black">124</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">5-Star Reviews</span>
                  <span className="font-bold text-black">89%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-bold text-black">84%</span>
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
