import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, BookOpen, Calendar, Star, Download, Eye, MessageSquare, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { classDetailUrl } from '@/lib/url';

export default function InstructorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Redirect if instructor is not approved
  useEffect(() => {
    if (user && user.role === 'instructor') {
      if (user.approvalStatus === 'pending') {
        navigate('/instructor/pending-approval');
      } else if (user.approvalStatus === 'rejected') {
        navigate('/');
      }
    }
  }, [user, navigate]);

  // Sample earnings data
  const earningsData = {
    week: { total: 1250, change: 12.5, trend: 'up' },
    month: { total: 8500, change: 8.3, trend: 'up' },
    year: { total: 89500, change: -2.1, trend: 'down' },
  };

  const currentEarnings = earningsData[timeRange];

  // Sample recent transactions
  const transactions = [
    { id: 1, student: 'John Smith', class: 'Advanced React Patterns', amount: 299, date: 'Jan 20, 2026' },
    { id: 2, student: 'Emily Davis', class: 'Advanced React Patterns', amount: 299, date: 'Jan 19, 2026' },
    { id: 3, student: 'Michael Brown', class: 'UI/UX Design Fundamentals', amount: 199, date: 'Jan 18, 2026' },
    { id: 4, student: 'Sarah Wilson', class: 'Advanced React Patterns', amount: 299, date: 'Jan 17, 2026' },
    { id: 5, student: 'David Lee', class: 'UI/UX Design Fundamentals', amount: 199, date: 'Jan 15, 2026' },
  ];

  // Sample class performance
  const classPerformance = [
    {
      id: 1,
      title: 'Advanced React Patterns & Best Practices',
      students: 156,
      revenue: 4200,
      rating: 4.9,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    },
    {
      id: 2,
      title: 'UI/UX Design Fundamentals',
      students: 98,
      revenue: 2450,
      rating: 4.8,
      thumbnail: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400',
    },
    {
      id: 3,
      title: 'Digital Marketing Strategy 2026',
      students: 88,
      revenue: 1850,
      rating: 4.7,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header variant="light" />
      
      <main className="py-12">
        <div className="w-[90vw] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Nexnoon Expert Dashboard</h1>
            <p className="text-gray-600">Track your performance, earnings, and student engagement</p>
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo Mode:</strong> You're viewing sample instructor data.
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-[#889dd1]/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-[#889dd1]" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-green-600 font-medium">+12.5%</span>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">$8,500</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-[#889dd1]/10 rounded-lg">
                  <Users className="h-6 w-6 text-[#889dd1]" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-green-600 font-medium">+8.3%</span>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">342</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-[#889dd1]/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-[#889dd1]" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-gray-600 font-medium">5 Active</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">5</div>
              <div className="text-sm text-gray-600">Active Classes</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-[#889dd1]/10 rounded-lg">
                  <Star className="h-6 w-6 text-[#889dd1]" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-green-600 font-medium">Excellent</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">4.9★</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Earnings & Transactions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Earnings Chart Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Earnings Overview</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate('/earnings')}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      View Detailed Earnings
                    </Button>
                    {(['week', 'month', 'year'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          timeRange === range
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Earnings Display */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${currentEarnings.total.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    {currentEarnings.trend === 'up' ? (
                      <>
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">+{currentEarnings.change}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-medium">{currentEarnings.change}%</span>
                      </>
                    )}
                    <span className="text-gray-600">vs last {timeRange}</span>
                  </div>
                </div>

                {/* Simple Chart Placeholder */}
                <div className="h-48 bg-gradient-to-br from-[#889dd1]/5 to-white border border-[#889dd1]/20 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-[#889dd1]" />
                    <p className="text-sm">Earnings chart visualization</p>
                  </div>
                </div>

                <Button 
                  className="mt-4 w-full bg-black text-white hover:bg-black/90"
                  onClick={() => {
                    // TODO: Implement withdrawal/payout
                    console.log('Request payout');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{transaction.student}</div>
                        <div className="text-sm text-gray-600">{transaction.class}</div>
                        <div className="text-xs text-gray-500 mt-1">{transaction.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">${transaction.amount}</div>
                        <div className="text-xs text-green-600">Completed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Class Performance */}
            <div className="space-y-8">
              {/* Top Performing Classes */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top Classes</h2>
                <div className="space-y-4">
                  {classPerformance.map((cls, index) => (
                    <div
                      key={cls.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(classDetailUrl(String(cls.id), cls.title))}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative">
                          <ImageWithFallback
                            src={cls.thumbnail}
                            alt={cls.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#889dd1] text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                            {cls.title}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-lg font-bold text-gray-900">{cls.students}</div>
                          <div className="text-xs text-gray-600">Students</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-lg font-bold text-gray-900">${cls.revenue}</div>
                          <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-lg font-bold text-gray-900">{cls.rating}★</div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/students-management');
                        }}
                        className="mt-3 w-full py-2 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors rounded"
                      >
                        View Students
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-[#889dd1]/5 to-white border border-[#889dd1]/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/create-class')}
                    className="w-full bg-black text-white hover:bg-black/90 justify-start"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create New Class
                  </Button>
                  <Button
                    onClick={() => navigate('/my-classes')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All Classes
                  </Button>
                  <Button
                    onClick={() => navigate('/analytics')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics & Reports
                  </Button>
                  <Button
                    onClick={() => {
                      // TODO: Navigate to messages/Q&A
                      console.log('View messages');
                    }}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Student Messages
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