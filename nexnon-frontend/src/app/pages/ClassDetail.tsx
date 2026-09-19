import { CertificatePreview } from '@/app/components/CertificatePreview';
import { useParams, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Calendar, Clock, Users, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import LiveClasses from '@/app/components/LiveClasses';
import BackendState from '@/app/components/BackendState';
import { CountdownTimer } from '@/app/components/CountdownTimer';
import { classService } from '@/lib/api';
import { classDetailUrl, slugify } from '@/lib/url';
import { useAuth } from '@/contexts/AuthContext';
import { useMyEnrollments } from '@/hooks/api/useClasses';
import type { Class, Review } from '@/types/api';
const heroBackground = "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1080";
export default function ClassDetail() {
  const { id, titleSlug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: myEnrollments } = useMyEnrollments({ pageSize: 100 }, { enabled: isAuthenticated });
  const [apiClass, setApiClass] = useState<Class | null>(null);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewError, setReviewError] = useState(false);
  useEffect(() => { let active = true; setReviews([]); setReviewError(false); if (id) classService.getClassReviews(id, { pageSize: 100 }).then(r => { if (active) setReviews(r.data); }).catch(() => { if (active) setReviewError(true); }); return () => { active = false; }; }, [id]);
  const [isCardFixed, setIsCardFixed] = useState(true);
  const relatedCoursesRef = useRef<HTMLDivElement>(null);
  const videoCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true; setApiClass(null); setError(''); window.scrollTo(0, 0);
    if (!id) { setError('Select a class to view its details.'); return; }
    classService.getClass(id).then(c => { if (active) setApiClass(c); }).catch(() => { if (active) setError('Unable to load this class. Please try again.'); });
    return () => { active = false; };
  }, [id]);
  useEffect(() => { if (id && apiClass && slugify(apiClass.title) !== titleSlug) navigate(classDetailUrl(id, apiClass.title), { replace: true }); }, [id, apiClass, titleSlug, navigate]);
  useEffect(() => {
    const update = () => setIsCardFixed(!relatedCoursesRef.current || relatedCoursesRef.current.getBoundingClientRect().top > window.innerHeight);
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => window.removeEventListener('scroll', update);
  }, [apiClass]);
  if (error) return <BackendState title="Class Details" message={error} />;
  if (!apiClass) return <BackendState title="Class Details" loading message="Loading Nexnoon" />;
  const details = apiClass.details || {};
  const classData = { ...apiClass, students: apiClass.enrolledStudents, duration: apiClass.totalSessions, durationBase: 'Sessions', format: apiClass.isLive ? 'Live' : 'Online', startDate: apiClass.startDate || apiClass.schedule?.[0]?.startTime || '', instructor: { ...apiClass.instructor, title: details.instructorTitle || 'Nexnoon Expert', bio: details.instructorBio || apiClass.instructor.bio || 'The instructor has not added a biography yet.', image: details.instructorImage || apiClass.instructor.avatar || '' } };
  const modules = details.curriculum?.length ? details.curriculum : (apiClass.schedule || []).map(s => ({ title: s.title, topics: s.description ? [s.description] : [new Date(s.startTime).toLocaleString()], project: 'Project details to be provided by the instructor.' }));
  const paymentId = apiClass.id;
  const activeEnrollment = myEnrollments?.data.find(e => e.classId === apiClass.id && e.status !== 'dropped');
  const isOwnClass = !!user && user.id === apiClass.instructor.id;
  const formatPrice = (price: number) => price === 0 ? 'Free' : new Intl.NumberFormat(undefined, { style: 'currency', currency: apiClass.currency || 'USD' }).format(price);
  const formatDate = (value: string) => value ? new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'To be announced';
    return (
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section with Video Card */}
        <div
          className="pt-10 pb-12 min-h-[70vh] flex items-center relative overflow-hidden"
          style={{
            backgroundImage: `url(${apiClass.thumbnail || heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/55 to-black/50"></div>

          <div className="w-[90vw] mx-auto py-8 relative z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white/80 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Back to courses</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="inline-block px-3 py-1 bg-[#889dd1]/30 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full mb-4">
                  Live Online Class
                </div>

                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  {classData.title}
                </h1>

                <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                  {classData.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{classData.students?.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{classData.duration} {classData.durationBase}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Starts {formatDate(classData.startDate)}</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-white/20">
                    <span className="text-2xl font-bold text-black">N</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Nexnoon Expert</p>
                    <p className="text-white font-medium">{classData.instructor.name}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div
                  ref={videoCardRef}
                  className={`transition-all duration-300 ${
                    isCardFixed
                      ? 'lg:fixed lg:top-32 lg:w-[340px] lg:right-[5vw] z-20'
                      : 'relative'
                  }`}
                >
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 max-h-[220px]">
                      {details.previewVideoUrl ? <video controls preload="metadata" poster={apiClass.thumbnail} src={details.previewVideoUrl} className="w-full h-full object-cover" /> : apiClass.thumbnail ? <img src={apiClass.thumbnail} alt={apiClass.title} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-white text-3xl font-bold">Nexnoon</div>}
                    </div>

                    <div className="p-3">
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(classData.price)}
                          </span>
                          <span className="text-gray-400 text-xs font-medium">{apiClass.currency}</span>
                        </div>
                      </div>

                      {isOwnClass ? (
                        <Button
                          onClick={() => navigate(`/edit-class/${apiClass.id}`)}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold mb-3 shadow-lg hover:shadow-xl transition-all"
                        >
                          Manage This Class
                        </Button>
                      ) : activeEnrollment ? (
                        <Button
                          onClick={() => navigate(`/classroom/${apiClass.id}`)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold mb-3 shadow-lg hover:shadow-xl transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Already Enrolled &middot; Go to Classroom
                        </Button>
                      ) : (
                        <Button
                          onClick={() => navigate(`/payment/${paymentId}`)}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold mb-3 shadow-lg hover:shadow-xl transition-all"
                        >
                          Enroll Now
                        </Button>
                      )}

                      <div className="border-t border-gray-100 mb-3"></div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Live Class Details</h4>

                        <div className="space-y-2">
                          <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-3.5 w-3.5 text-[#889dd1]" />
                              <p className="text-xs font-medium text-gray-500">Duration</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{classData.duration} {classData.durationBase}</p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Play className="h-3.5 w-3.5 text-[#889dd1]" />
                              <p className="text-xs font-medium text-gray-500">Format</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{classData.format} Online</p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-3.5 w-3.5 text-[#889dd1]" />
                              <p className="text-xs font-medium text-gray-500">Starts</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{formatDate(classData.startDate).split(',')[0]}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-[90vw] mx-auto py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Course Details */}
            <div className="lg:col-span-2 space-y-16">

              {/* What You'll Learn - Bento Box Grid */}
              <section>
                <h2 className="text-3xl font-bold text-black mb-10">What you'll learn</h2>
                <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {!apiClass.learningOutcomes?.length && <p className="text-gray-600">Learning details will be provided by the instructor.</p>}
                    {(apiClass.learningOutcomes || []).map((item, index) => (
                      <div
                        key={index}
                        className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-xl bg-white border-2 border-gray-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg p-2 flex-shrink-0 bg-black/10">
                            <CheckCircle2 className="h-5 w-5 text-black" />
                          </div>
                          <p className="font-medium leading-relaxed text-black">
                            {item}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Countdown Timer */}
              {classData.startDate && new Date(classData.startDate).getTime() > Date.now() && (
                <section>
                  <CountdownTimer targetDate={classData.startDate} />
                </section>
              )}

              {/* Course Overview - Split Card */}
              <section>
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 transition-all">
                  <div className="grid md:grid-cols-5">
                    {/* Left accent */}
                    <div className="md:col-span-2 bg-gray-100 p-8 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{classData.duration}</div>
                        <div className="text-gray-700 text-sm uppercase tracking-wider">{classData.durationBase}</div>
                        <div className="mt-6 pt-6 border-t border-gray-300">
                          <div className="text-3xl font-bold text-gray-900 mb-1">Live</div>
                          <div className="text-gray-700 text-sm">Interactive Sessions</div>
                        </div>
                      </div>
                    </div>

                    {/* Right content */}
                    <div className="md:col-span-3 p-8 text-black">
                      <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{details.overview || apiClass.description}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Course Structure - Timeline Style */}
              <section>
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-black mb-2">
                    Course Structure
                  </h2>
                  <p className="text-gray-600">{details.curriculumIntro || "Explore the course curriculum and projects"}</p>
                </div>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-black to-gray-200"></div>

                  <div className="space-y-8">
                    {!modules.length && <p className="text-gray-600">The instructor has not added the curriculum yet.</p>}
                    {modules.map((module, index) => (
                      <div key={index} className="relative pl-16 group">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-white border-4 border-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-black font-bold text-lg">{index + 1}</span>
                        </div>

                        {/* Content card */}
                        <div className="bg-white rounded-xl p-6 border-2 border-gray-100 transition-all shadow-sm hover:shadow-md">
                          <h3 className="text-xl font-bold text-black mb-4">{module.title}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Topics Covered</span>
                              </div>
                              <ul className="space-y-2">
                                {module.topics.map((topic, i) => (
                                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2 pl-4">
                                    <span className="text-black font-bold">•</span>
                                    <span>{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hands-On Project</span>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <p className="text-sm text-gray-900 font-medium">{module.project}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Nexnoon Expert - Feature Card */}
              <section>
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 transition-all shadow-lg">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
                      <span className="text-xs font-bold text-black uppercase tracking-wider">Your Nexnoon Expert</span>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex flex-col sm:flex-row items-start gap-8">
                      {/* Profile image with decorative elements */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute -inset-2 bg-gradient-to-br from-black/20 to-transparent rounded-2xl"></div>
                        <div className="relative w-32 h-32 rounded-xl bg-white flex items-center justify-center shadow-lg border-2 border-gray-100">
                          {classData.instructor.image ? <img src={classData.instructor.image} alt={classData.instructor.name} className="w-full h-full object-cover rounded-xl" /> : <span className="text-5xl font-bold text-black">{classData.instructor.name.charAt(0)}</span>}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          Expert
                        </div>
                      </div>

                      {/* Text content */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-black mb-1">
                          {classData.instructor.name}
                        </h3>
                        <p className="text-gray-500 text-sm font-medium mb-4">
                          {classData.instructor.title}
                        </p>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {classData.instructor.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-8">
                <h2 className="text-3xl font-bold mb-6">Class Information</h2>
                <dl className="grid sm:grid-cols-2 gap-6">
                  <div><dt className="text-sm text-gray-500">Level</dt><dd className="font-semibold">{apiClass.level}</dd></div>
                  <div><dt className="text-sm text-gray-500">Language</dt><dd className="font-semibold">{apiClass.language || 'To be announced'}</dd></div>
                  <div><dt className="text-sm text-gray-500">Duration</dt><dd className="font-semibold">{apiClass.duration} minutes</dd></div>
                  <div><dt className="text-sm text-gray-500">Class size</dt><dd className="font-semibold">{apiClass.maxStudents ? `Up to ${apiClass.maxStudents} students` : 'To be announced'}</dd></div>
                </dl>
                {!!apiClass.schedule?.length && <div className="mt-8 space-y-4"><h3 className="text-xl font-bold">Session Schedule</h3>{apiClass.schedule.map(session => <div key={session.id} className="bg-white border rounded-xl p-4"><p className="font-semibold">{session.title}</p><p className="text-sm text-gray-600">{new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleTimeString()}</p><p className="text-gray-600 whitespace-pre-line">{session.description}</p></div>)}</div>}
              </section>
              {/* Prerequisites */}
              {true && (
                <section>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                    <h2 className="text-3xl font-bold mb-6">Prerequisites</h2>
                    <p className="text-gray-300 mb-6">
                      Before enrolling, make sure you have:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(apiClass.prerequisites || []).map((prereq, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="mt-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                          <p className="text-gray-200">{prereq}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Learning Outcomes */}
              {true && (
                <section>
                  <h2 className="text-3xl font-bold text-black mb-6">By the end of this course, you'll be able to:</h2>
                  <div className="space-y-3">
                    {(details.outcomes || apiClass.learningOutcomes || []).map((outcome, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">{index + 1}</span>
                          </div>
                          <p className="text-gray-900 font-medium">{outcome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certificate Preview */}
              {true && (
                <section>
                  <CertificatePreview title={apiClass.title} instructor={apiClass.instructor.name} information={details.certificateInfo || undefined} />
                </section>
              )}

              <section><h2 className="text-3xl font-bold text-black mb-10">Student Reviews</h2>
                {reviewError ? <p className="text-gray-600">Reviews could not be loaded.</p> : !reviews.length ? <p className="text-gray-600">No student reviews yet.</p> : <div className="space-y-6">{reviews.map(review => <article key={review.id} className="bg-white rounded-2xl p-6 border-2 border-gray-100"><div className="flex items-center gap-4 mb-4">{review.userAvatar && <img src={review.userAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />}<div><h3 className="font-bold">{review.userName}</h3><p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()} ? {review.rating} / 5</p></div></div><p className="text-gray-700 leading-relaxed whitespace-pre-line">{review.comment}</p></article>)}</div>}

              </section>
              {/* FAQ */}
              {true && (
                <section>
                  <h2 className="text-3xl font-bold text-black mb-10">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {!details.faqs?.length && <p className="text-gray-600">The instructor has not added FAQs yet.</p>}
                    {(details.faqs || []).map((faq, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-6 border-2 border-gray-100"
                      >
                        <h3 className="text-lg font-bold text-black mb-3">{faq.question}</h3>
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right: Spacer for sticky sidebar */}
            <div className="lg:col-span-1"></div>
          </div>
        </div>

        {/* Related Courses */}
        <div ref={relatedCoursesRef} className="bg-white border-t border-gray-100 py-16">
          <LiveClasses
            title="Related Courses"
            subtitle="Continue your learning journey with these courses"
            limit={4}
          />
        </div>

        <Footer />
      </div>
    );
}
