import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Download, Share2, Award, CheckCircle, Calendar, User } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Certificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Mock certificate data - TODO: Fetch from backend
  const certificateData = {
    id: 'CERT-NXN-2026-001234',
    studentName: user?.name || 'John Smith',
    classTitle: 'Advanced React Patterns & Best Practices',
    instructorName: 'Dr. Sarah Johnson',
    completionDate: 'January 15, 2026',
    issueDate: 'January 16, 2026',
    duration: '8 weeks',
    totalHours: '32 hours',
    grade: 'A+',
    skills: ['React Patterns', 'HOCs', 'Render Props', 'Performance Optimization'],
  };

  const handleDownload = () => {
    // TODO: Generate PDF certificate
    console.log('Downloading certificate...');
    alert('Certificate download will start... (Demo mode)');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Sharing certificate...');
    alert('Share certificate on social media... (Demo mode)');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header variant="light" />
      
      <main className="py-12">
        <div className="w-[90vw] max-w-5xl mx-auto">
          {/* Header Actions */}
          <div className="mb-8 no-print">
            <button
              onClick={() => navigate('/my-classes')}
              className="flex items-center text-gray-600 hover:text-black mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to My Classes
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Certificate of Completion</h1>
                <p className="text-gray-600">Congratulations on completing the course!</p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  className="bg-black text-white hover:bg-gray-800 rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Print
                </Button>
              </div>
            </div>
          </div>

          {/* Certificate */}
          <div 
            id="certificate" 
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-double border-gray-800 print:shadow-none print:border-4"
          >
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 py-8 px-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
              </div>
              
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
                  <Award className="h-10 w-10 text-black" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-2 tracking-wide">NEXNOON</h2>
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-white to-transparent mx-auto"></div>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="p-12 md:p-16 relative">
              {/* Decorative Corner Elements */}
              <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-gray-300 rounded-tl-lg"></div>
              <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-gray-300 rounded-tr-lg"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-gray-300 rounded-bl-lg"></div>
              <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-gray-300 rounded-br-lg"></div>

              <div className="text-center space-y-8">
                {/* Certificate Title */}
                <div>
                  <h3 className="text-2xl text-gray-600 mb-3 tracking-widest uppercase font-light">
                    Certificate of Completion
                  </h3>
                  <div className="h-0.5 w-48 bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto"></div>
                </div>

                {/* Recipient */}
                <div className="space-y-3">
                  <p className="text-gray-600 text-lg">This is to certify that</p>
                  <h1 className="text-5xl md:text-6xl font-serif font-bold text-black tracking-wide">
                    {certificateData.studentName}
                  </h1>
                  <p className="text-gray-600 text-lg">has successfully completed the course</p>
                </div>

                {/* Course Title */}
                <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-6 px-8 rounded-xl border-2 border-gray-200">
                  <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                    {certificateData.classTitle}
                  </h2>
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mt-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {certificateData.duration}
                    </span>
                    <span>•</span>
                    <span>{certificateData.totalHours}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-bold text-black">
                      <Award className="h-4 w-4" />
                      Grade: {certificateData.grade}
                    </span>
                  </div>
                </div>

                {/* Skills Acquired */}
                <div className="pt-4">
                  <p className="text-sm text-gray-600 mb-3 uppercase tracking-wider">Skills Mastered</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {certificateData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-black text-white text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Completion Date & Signatures */}
                <div className="pt-8 space-y-8">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-black" />
                    <span className="text-lg">
                      Completed on <span className="font-bold text-black">{certificateData.completionDate}</span>
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 pt-8 max-w-3xl mx-auto">
                    {/* Nexnoon Expert Signature */}
                    <div className="text-center">
                      <div className="border-b-2 border-gray-800 pb-2 mb-3">
                        <p className="text-3xl font-serif italic text-gray-800">
                          {certificateData.instructorName}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 font-medium uppercase tracking-wider">
                        Course Nexnoon Expert
                      </p>
                    </div>

                    {/* Platform Signature */}
                    <div className="text-center">
                      <div className="border-b-2 border-gray-800 pb-2 mb-3">
                        <p className="text-3xl font-serif italic text-gray-800">
                          Nexnoon Platform
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 font-medium uppercase tracking-wider">
                        Authorized By
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate ID & Verification */}
                <div className="pt-8 border-t-2 border-gray-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-gray-100 px-3 py-1 rounded border border-gray-300">
                        {certificateData.id}
                      </span>
                    </div>
                    <div>
                      Issued: {certificateData.issueDate}
                    </div>
                    <div className="text-xs">
                      Verify at: nexnoon.com/verify/{certificateData.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Footer */}
            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 py-4">
              <div className="text-center text-white text-sm opacity-75">
                www.nexnoon.com • Live Online Learning Platform
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 grid md:grid-cols-3 gap-6 no-print">
            <div className="bg-white border border-gray-300 rounded-xl p-6 text-center hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-black mb-2">Verified Certificate</h3>
              <p className="text-sm text-gray-600">
                This certificate is cryptographically signed and verified
              </p>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-6 text-center hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-black mb-2">Share Your Success</h3>
              <p className="text-sm text-gray-600">
                Add to LinkedIn, Twitter, or your professional portfolio
              </p>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-6 text-center hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-black mb-2">Download & Print</h3>
              <p className="text-sm text-gray-600">
                Available in high-resolution PDF format for printing
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          #certificate {
            page-break-inside: avoid;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
