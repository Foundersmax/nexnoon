import { useParams, useNavigate } from 'react-router';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';

const assignments = [
  {
    id: 1,
    title: 'Week 1: Build a Custom Hook',
    description: 'Create a custom hook for form handling with validation',
    dueDate: 'Jan 30, 2026',
    status: 'submitted',
    grade: 'A',
    points: '95/100',
  },
  {
    id: 2,
    title: 'Week 2: Performance Optimization',
    description: 'Optimize a React application using memoization techniques',
    dueDate: 'Feb 6, 2026',
    status: 'in-progress',
    points: '0/100',
  },
  {
    id: 3,
    title: 'Week 3: State Management Project',
    description: 'Build a shopping cart using Context API and reducers',
    dueDate: 'Feb 13, 2026',
    status: 'not-started',
    points: '0/100',
  },
];

export default function Assignments() {
  const { id } = useParams();
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="h-4 w-4" /> Submitted</span>;
      case 'in-progress':
        return <span className="flex items-center gap-1 text-yellow-600 text-sm"><Clock className="h-4 w-4" /> In Progress</span>;
      case 'not-started':
        return <span className="flex items-center gap-1 text-gray-600 text-sm"><AlertCircle className="h-4 w-4" /> Not Started</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      <main className="py-8">
        <div className="w-[90vw] max-w-5xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate(`/classroom/${id}`)} className="mb-4">
              ← Back to Class
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
            <p className="text-gray-600">Complete assignments to test your knowledge</p>
          </div>

          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h3>
                    <p className="text-gray-600 mb-4">{assignment.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-600">Due: {assignment.dueDate}</span>
                      {getStatusBadge(assignment.status)}
                      {assignment.grade && (
                        <span className="font-semibold text-[#889dd1]">Grade: {assignment.grade} ({assignment.points})</span>
                      )}
                    </div>
                  </div>
                  <FileText className="h-12 w-12 text-[#889dd1]" />
                </div>

                <div className="flex gap-3">
                  {assignment.status === 'submitted' ? (
                    <Button variant="outline">View Submission</Button>
                  ) : (
                    <Button className="bg-[#889dd1] hover:bg-[#7a8ec2]">
                      {assignment.status === 'in-progress' ? 'Continue' : 'Start Assignment'}
                    </Button>
                  )}
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
