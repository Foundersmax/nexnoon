import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  DollarSign, TrendingUp, ArrowUpRight, Download, Calendar,
  CreditCard, Users, BookOpen, Eye 
} from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Earnings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month');

  // Mock earnings data - TODO: Fetch from backend
  const earningsData = {
    totalEarnings: 24750.50,
    thisMonth: 5420.00,
    pending: 1250.00,
    available: 4170.00,
    growth: 23.5,
  };

  const transactions = [
    {
      id: 1,
      date: 'Jan 20, 2026',
      description: 'Advanced React Patterns - 5 enrollments',
      amount: 399.95,
      status: 'completed',
      students: 5,
    },
    {
      id: 2,
      date: 'Jan 18, 2026',
      description: 'UI/UX Design Fundamentals - 8 enrollments',
      amount: 479.92,
      status: 'completed',
      students: 8,
    },
    {
      id: 3,
      date: 'Jan 15, 2026',
      description: 'Digital Marketing Strategy - 3 enrollments',
      amount: 209.97,
      status: 'pending',
      students: 3,
    },
    {
      id: 4,
      date: 'Jan 12, 2026',
      description: 'Advanced React Patterns - 12 enrollments',
      amount: 959.88,
      status: 'completed',
      students: 12,
    },
  ];

  const classBreakdown = [
    { name: 'Advanced React Patterns', students: 156, revenue: 12480.00, avgRating: 4.8 },
    { name: 'UI/UX Design Fundamentals', students: 98, revenue: 5880.00, avgRating: 4.9 },
    { name: 'Digital Marketing Strategy', students: 88, revenue: 6160.00, avgRating: 4.7 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      <main className="py-12">
        <div className="w-[90vw] max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Earnings & Payouts</h1>
                <p className="text-gray-600">Track your revenue and manage payouts</p>
              </div>
              <Button
                onClick={() => navigate('/instructor-dashboard')}
                variant="outline"
                className="border-gray-300 rounded-lg"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8" />
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold mb-1">
                ${earningsData.totalEarnings.toLocaleString()}
              </div>
              <div className="text-sm text-white/70">Total Earnings</div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-6 w-6 text-gray-600" />
                <span className="text-xs text-green-600 font-bold">+{earningsData.growth}%</span>
              </div>
              <div className="text-2xl font-bold text-black mb-1">
                ${earningsData.thisMonth.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-black mb-1">
                ${earningsData.available.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Available for Payout</div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-6 w-6 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-black mb-1">
                ${earningsData.pending.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Pending Clearance</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Transactions */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-300 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-black">Recent Transactions</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 rounded-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value as any)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-bold text-black mb-1">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-gray-600">{transaction.date}</div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-black mb-1">
                          +${transaction.amount.toFixed(2)}
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payout Method */}
              <div className="bg-white border border-gray-300 rounded-xl p-6 mt-6">
                <h2 className="text-xl font-bold text-black mb-4">Payout Method</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                    <div>
                      <div className="font-bold text-black">Bank Account</div>
                      <div className="text-sm text-gray-600">••••••••1234</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 rounded-lg">
                    Edit
                  </Button>
                </div>
                <Button
                  disabled={earningsData.available === 0}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-lg"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Request Payout (${earningsData.available.toLocaleString()})
                </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Payouts are processed within 3-5 business days
                </p>
              </div>
            </div>

            {/* Revenue by Class */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-300 rounded-xl p-6">
                <h2 className="text-xl font-bold text-black mb-6">Revenue by Class</h2>
                <div className="space-y-4">
                  {classBreakdown.map((cls, index) => (
                    <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-sm text-black flex-1 pr-2">
                          {cls.name}
                        </h3>
                        <button className="text-gray-400 hover:text-black">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-2xl font-bold text-black mb-2">
                        ${cls.revenue.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {cls.students} students
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          {cls.avgRating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-300 rounded-xl p-6 mt-6">
                <h3 className="font-bold text-black mb-4">This Month</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">New Students</span>
                    <span className="font-bold text-black">26</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Classes</span>
                    <span className="font-bold text-black">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg per Student</span>
                    <span className="font-bold text-black">$72.40</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (15%)</span>
                    <span className="font-bold text-red-600">-$813.00</span>
                  </div>
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