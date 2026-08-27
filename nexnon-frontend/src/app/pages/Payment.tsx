import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { classService, getErrorMessage } from '@/lib/api';
import { ENV } from '@/config/env';
import { toast } from 'sonner';
import type { Class } from '@/types/api';
import { courseToApiClass, getCourseById } from '@/data/courses';

function PaymentForm({
  classData,
  paymentError,
  isProcessing,
  user,
  onPay,
  onCardholderChange,
  formatPrice,
}: {
  classData: Class;
  paymentError: string;
  isProcessing: boolean;
  user: { name?: string; email?: string } | null;
  onPay: () => void;
  onCardholderChange: (v: string) => void;
  formatPrice: (n: number) => string;
}) {
  const navigate = useNavigate();
  const instructorName = typeof classData.instructor === 'object' && classData.instructor?.name
    ? classData.instructor.name
    : 'Instructor';
  const durationDisplay = classData.duration
    ? `${Math.round(classData.duration / 60)} hr${classData.duration >= 120 ? 's' : ''} total`
    : `${classData.totalSessions || 0} sessions`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      <div className="relative h-64 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1758270704524-596810e891b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="Online Learning"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold text-white">Complete your enrollment</h1>
        </div>
      </div>
      <main className="py-12">
        <div className="w-[90vw] max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to class
          </button>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                  <Input
                    placeholder="John Doe"
                    defaultValue={user?.name || user?.email || ''}
                    onChange={(e) => onCardholderChange(e.target.value)}
                    className="w-full"
                  />
                </div>
                {paymentError && <p className="text-sm text-red-600 mb-2">{paymentError}</p>}
                <Button
                  onClick={onPay}
                  disabled={isProcessing}
                  className="w-full bg-[#889dd1] hover:bg-[#7a8ec2] text-white py-4 text-lg font-semibold"
                >
                  {isProcessing ? 'Processing...' : `Complete Payment • ${formatPrice(classData.price)}`}
                </Button>
                <p className="text-center text-gray-500 text-sm mt-4">30-day money-back guarantee</p>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-900">{classData.title}</h3>
                  <p className="text-sm text-gray-600">by {instructorName}</p>
                  <p className="text-sm text-gray-600">{durationDisplay}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(classData.price)}</span>
                  </div>
                </div>
                <div className="space-y-3 border-t border-gray-200 pt-6 mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Lifetime access to class materials</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Certificate of completion</span>
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

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [classData, setClassData] = useState<Class | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [cardholderName, setCardholderName] = useState(user?.name || user?.email || '');
  const classId = id || '';

  const useDemoData = ENV.ENABLE_DEMO_MODE;

  useEffect(() => {
    if (!classId) {
      setLoadError('Class ID is required.');
      return;
    }
    if (useDemoData) {
      const course = getCourseById(classId);
      if (course) {
        setClassData(courseToApiClass(course) as Class);
        setLoadError(null);
      } else {
        setLoadError('Class not found');
      }
      return;
    }
    let cancelled = false;
    classService
      .getClass(classId)
      .then((data) => {
        if (!cancelled) setClassData(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err));
      });
    return () => { cancelled = true; };
  }, [classId, useDemoData]);

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem('returnPath', `/payment/${id}`);
      navigate('/login');
    }
  }, [isAuthenticated, id, navigate]);

  const handlePayNoStripe = async () => {
    if (!classData || !classId) return;
    setIsProcessing(true);
    setPaymentError('');
    try {
      if (useDemoData) {
        toast.success('Enrollment successful!');
        navigate(`/enrollment-success/${id}`);
        return;
      }
      await classService.enrollInClass({ classId, paymentMethodId: undefined });
      toast.success('Enrollment successful!');
      navigate(`/enrollment-success/${id}`);
    } catch (err) {
      const msg = getErrorMessage(err);
      setPaymentError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;

  if (!classData && !loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#889dd1] border-r-transparent mb-4" />
          <p className="text-gray-600">Loading class...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError || 'Class not found'}</p>
          <Button onClick={() => navigate('/')}>Back to home</Button>
        </div>
      </div>
    );
  }

  return (
    <PaymentForm
      classData={classData}
      paymentError={paymentError}
      isProcessing={isProcessing}
      user={user}
      onPay={handlePayNoStripe}
      onCardholderChange={setCardholderName}
      formatPrice={formatPrice}
    />
  );
}
