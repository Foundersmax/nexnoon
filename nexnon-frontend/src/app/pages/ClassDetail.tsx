import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Play,
  CheckCircle2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/app/components/ui/button";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import LiveClasses from "@/app/components/LiveClasses";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import { CertificatePreview } from "@/app/components/CertificatePreview";
import { classService } from "@/lib/api";
import { ENV } from "@/config/env";
import { classDetailUrl, slugify } from "@/lib/url";
import type { Class } from "@/types/api";
import { allCourses, courseToClassDetail, getCourseById } from "@/data/courses";

const heroBackground = "https://images.unsplash.com/photo-1762330910399-95caa55acf04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGFzc3Jvb20lMjBvbmxpbmUlMjBsZWFybmluZ3xlbnwxfHx8fDE3Njk1MzA3MjN8MA&ixlib=rb-4.1.0&q=80&w=1080";

function findClassDetailFromCourses(id: string | undefined) {
  if (!id) return undefined;
  const byId = getCourseById(id);
  if (byId) return courseToClassDetail(byId);
  const bySlug = allCourses.find((course) => slugify(course.title) === id);
  return bySlug ? courseToClassDetail(bySlug) : undefined;
}

export default function ClassDetail() {
  const { id, titleSlug } = useParams();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [isCardFixed, setIsCardFixed] = useState(true);
  const relatedCoursesRef = useRef(null);
  const videoCardRef = useRef(null);
  const useRealDataOnly = !ENV.ENABLE_DEMO_MODE;
  const [apiClass, setApiClass] = useState<Class | null>(null);
  const [apiLoadError, setApiLoadError] = useState<string | null>(null);

  const classData = useRealDataOnly ? null : findClassDetailFromCourses(id);

  // Fetch class from API only in real (non-demo) mode
  useEffect(() => {
    if (!id || !useRealDataOnly) return;
    setApiLoadError(null);
    classService
      .getClass(id)
      .then((data) => setApiClass(data))
      .catch(() => setApiLoadError("Class not found"));
  }, [id, useRealDataOnly]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Replace URL with title slug when we have class data so URL shows title instead of just id
  useEffect(() => {
    const title = apiClass?.title ?? classData?.title;
    if (id && title && slugify(title) !== titleSlug) {
      navigate(classDetailUrl(id, title), { replace: true });
    }
  }, [id, titleSlug, apiClass?.title, classData?.title, navigate]);

  const paymentId = apiClass?.id ?? classData?.id ?? id ?? "";

  useEffect(() => {
    if (useRealDataOnly && !apiClass && apiLoadError) return; // show not found below
    if (useRealDataOnly && !id) {
      navigate("/");
      return;
    }
    if (!classData && !apiClass && !useRealDataOnly) {
      navigate("/");
    }
  }, [classData, apiClass, apiLoadError, useRealDataOnly, id, navigate]);

  // Helpers used for both API and dummy
  const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;
  const formatDate = (dateStr: string | undefined) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

  // Build display data from API class (instructor input) — same shape as dummy for layout
  const displayFromApi = apiClass
    ? {
        title: apiClass.title,
        description: apiClass.description,
        instructor: {
          name: apiClass.instructor?.name ?? "Instructor",
          title: "Nexnoon Expert",
          bio: apiClass.instructor?.bio ?? "",
          image: apiClass.instructor?.avatar ?? "",
        },
        duration: String(apiClass.totalSessions),
        durationBase: "Sessions",
        format: "Live",
        startDate: apiClass.startDate ?? "",
        students: apiClass.enrolledStudents ?? 0,
        price: apiClass.price,
        video: apiClass.thumbnail || "https://www.youtube.com/embed/Ke90Tje7VS0",
        level: apiClass.level,
        category: apiClass.category,
      }
    : null;

  // Real mode: show loading, then API class with full dummy-style layout, or not found
  if (useRealDataOnly) {
    if (apiClass && displayFromApi) {
      const d = displayFromApi;
      const schedule = apiClass.schedule ?? [];
      const whatYouLearn = d.description
        ? d.description.split(/\n|\. /).filter((s) => s.trim().length > 10).slice(0, 6)
        : ["Live sessions with expert instruction", "Hands-on practice", "Q&A and feedback", "Recordings and materials"];
      return (
        <div className="min-h-screen bg-white">
          <Header variant="light" />
          <div
            className="pt-20 h-[70vh] flex items-center relative overflow-hidden"
            style={{
              backgroundImage: `url(${apiClass.thumbnail || "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1080"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/55 to-black/50" />
            <div className="w-[90vw] mx-auto py-8 relative z-10">
              <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white transition-colors mb-8">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="text-sm">Back to courses</span>
              </button>
              <div className="grid grid-cols-3 gap-12">
                <div className="col-span-2">
                  <div className="inline-block px-3 py-1 bg-[#889dd1]/30 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full mb-4">
                    Live Online Class · Zoom
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{d.title}</h1>
                  <p className="text-lg text-gray-200 mb-6 leading-relaxed line-clamp-3">{d.description}</p>
                  <div className="flex items-center gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{d.students?.toLocaleString()} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{d.duration} {d.durationBase} · {apiClass.duration} min total</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{d.startDate ? formatDate(d.startDate) : "—"}</span>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-white/20 overflow-hidden">
                      {d.instructor.image ? (
                        <img src={d.instructor.image} alt={d.instructor.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-black">N</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Nexnoon Expert</p>
                      <p className="text-white font-medium">{d.instructor.name}</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <div ref={videoCardRef} className="relative">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                      <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 max-h-[220px]">
                        {d.video.startsWith("http") && !d.video.includes("youtube") && !d.video.includes("embed") ? (
                          <img src={d.video} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <iframe
                            className="w-full h-full"
                            src={d.video.includes("embed") ? d.video : "https://www.youtube.com/embed/Ke90Tje7VS0"}
                            title="Course preview"
                            frameBorder={0}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-gray-900">{formatPrice(d.price)}</span>
                          <span className="text-gray-400 text-xs font-medium ml-2">USD</span>
                        </div>
                        <Button onClick={() => navigate(`/payment/${apiClass.id}`)} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold mb-3 shadow-lg">
                          Enroll Now
                        </Button>
                        <div className="border-t border-gray-100 mb-3" />
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Live Class Details (Zoom)</h4>
                        <div className="space-y-2">
                          <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-3.5 w-3.5 text-[#889dd1]" />
                              <p className="text-xs font-medium text-gray-500">Duration</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{d.duration} {d.durationBase} · {apiClass.duration} min</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Play className="h-3.5 w-3.5 text-[#889dd1]" />
                              <p className="text-xs font-medium text-gray-500">Format</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{d.format} on Zoom</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-3.5 w-3.5 text-[#889dd1]" />
                              <p className="text-xs font-medium text-gray-500">Starts</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{d.startDate ? formatDate(d.startDate).split(",")[0] : "—"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[90vw] mx-auto py-16">
            <div className="grid grid-cols-3 gap-12">
              <div className="col-span-2 space-y-16">
                <section>
                  <h2 className="text-3xl font-bold text-black mb-10">What you'll learn</h2>
                  <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-8">
                    <div className="grid grid-cols-2 gap-4">
                      {whatYouLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 rounded-2xl p-6 bg-white border-2 border-gray-100">
                          <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
                          <p className="font-medium leading-relaxed text-black">{item.trim()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
                {schedule.length > 0 && (
                  <section>
                    <div className="mb-10">
                      <h2 className="text-3xl font-bold text-black mb-2">Course structure</h2>
                      <p className="text-gray-600">Live sessions on Zoom — set by your instructor</p>
                    </div>
                    <div className="relative">
                      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-black to-gray-200" />
                      <div className="space-y-8">
                        {schedule.map((s, index) => (
                          <div key={s.id || index} className="relative pl-16">
                            <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-white border-4 border-black flex items-center justify-center shadow-lg">
                              <span className="text-black font-bold text-lg">{s.sessionNumber ?? index + 1}</span>
                            </div>
                            <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
                              <h3 className="text-xl font-bold text-black mb-2">{s.title}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(s.startTime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                                {s.zoomLink && " · Zoom link provided"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                <section>
                  <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100">
                    <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                        <span className="text-xs font-bold text-black uppercase tracking-wider">Your Nexnoon Expert</span>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-start gap-8">
                        <div className="relative flex-shrink-0">
                          {d.instructor.image ? (
                            <img src={d.instructor.image} alt={d.instructor.name} className="w-32 h-32 rounded-xl object-cover shadow-lg border-2 border-gray-100" />
                          ) : (
                            <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-gray-100">
                              <span className="text-5xl font-bold text-black">N</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-black mb-1">{d.instructor.name}</h3>
                          <p className="text-gray-500 text-sm font-medium mb-4">{d.instructor.title}</p>
                          <p className="text-gray-600 leading-relaxed">{d.instructor.bio || "Expert instructor for this live class."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="col-span-1" />
            </div>
          </div>
          <div className="py-24 bg-gray-900">
            <div className="w-[90vw] mx-auto max-w-4xl text-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Join this live class on Zoom</h2>
              <p className="text-xl text-gray-400 mb-10">{d.students?.toLocaleString()} students enrolled</p>
              <Button onClick={() => navigate(`/payment/${apiClass.id}`)} className="bg-[#889dd1] hover:bg-[#7a8ec5] text-white px-12 py-6 text-lg rounded-xl font-bold">
                Enroll for {formatPrice(d.price)}
              </Button>
              <p className="text-gray-500 mt-6 text-sm">Live sessions via Zoom · Instructor-led</p>
            </div>
          </div>
          <div ref={relatedCoursesRef} className="bg-white border-t border-gray-100 py-16">
            <LiveClasses title="Related Courses" subtitle="Continue your learning" limit={4} />
          </div>
          <Footer />
        </div>
      );
    }
    if (apiLoadError || (id && !apiClass)) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{apiLoadError || "Class not found"}</p>
            <Button onClick={() => navigate("/")}>Back to home</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#889dd1] border-r-transparent mb-4" />
          <p className="text-gray-600">Loading class...</p>
        </div>
      </div>
    );
  }

  // Demo mode: full dummy-style layout when we have API class but no mock (same as real mode)
  if (apiClass && !classData && displayFromApi) {
    const d = displayFromApi;
    const schedule = apiClass.schedule ?? [];
    const whatYouLearn = d.description
      ? d.description.split(/\n|\. /).filter((s) => s.trim().length > 10).slice(0, 6)
      : ["Live sessions with expert instruction", "Hands-on practice", "Q&A and feedback", "Recordings and materials"];
    return (
      <div className="min-h-screen bg-white">
        <Header variant="light" />
        <div
          className="pt-20 h-[70vh] flex items-center relative overflow-hidden"
          style={{
            backgroundImage: `url(${apiClass.thumbnail || "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1080"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/55 to-black/50" />
          <div className="w-[90vw] mx-auto py-8 relative z-10">
            <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white transition-colors mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Back to courses</span>
            </button>
            <div className="grid grid-cols-3 gap-12">
              <div className="col-span-2">
                <div className="inline-block px-3 py-1 bg-[#889dd1]/30 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full mb-4">
                  Live Online Class · Zoom
                </div>
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{d.title}</h1>
                <p className="text-lg text-gray-200 mb-6 leading-relaxed line-clamp-3">{d.description}</p>
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{d.students?.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{d.duration} {d.durationBase} · {apiClass.duration} min total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{d.startDate ? formatDate(d.startDate) : "—"}</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-2 border-white/20 overflow-hidden">
                    {d.instructor.image ? (
                      <img src={d.instructor.image} alt={d.instructor.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-black">N</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Nexnoon Expert</p>
                    <p className="text-white font-medium">{d.instructor.name}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-1">
                <div ref={videoCardRef} className="relative">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 max-h-[220px]">
                      {d.video.startsWith("http") && !d.video.includes("youtube") && !d.video.includes("embed") ? (
                        <img src={d.video} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <iframe
                          className="w-full h-full"
                          src={d.video.includes("embed") ? d.video : "https://www.youtube.com/embed/Ke90Tje7VS0"}
                          title="Course preview"
                          frameBorder={0}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="mb-3">
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(d.price)}</span>
                        <span className="text-gray-400 text-xs font-medium ml-2">USD</span>
                      </div>
                      <Button onClick={() => navigate(`/payment/${apiClass.id}`)} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold mb-3 shadow-lg">
                        Enroll Now
                      </Button>
                      <div className="border-t border-gray-100 mb-3" />
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Live Class Details (Zoom)</h4>
                      <div className="space-y-2">
                        <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3.5 w-3.5 text-[#889dd1]" />
                            <p className="text-xs font-medium text-gray-500">Duration</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{d.duration} {d.durationBase} · {apiClass.duration} min</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Play className="h-3.5 w-3.5 text-[#889dd1]" />
                            <p className="text-xs font-medium text-gray-500">Format</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{d.format} on Zoom</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3.5 w-3.5 text-[#889dd1]" />
                            <p className="text-xs font-medium text-gray-500">Starts</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{d.startDate ? formatDate(d.startDate).split(",")[0] : "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[90vw] mx-auto py-16">
          <div className="grid grid-cols-3 gap-12">
            <div className="col-span-2 space-y-16">
              <section>
                <h2 className="text-3xl font-bold text-black mb-10">What you'll learn</h2>
                <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {whatYouLearn.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 rounded-2xl p-6 bg-white border-2 border-gray-100">
                        <CheckCircle2 className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
                        <p className="font-medium leading-relaxed text-black">{item.trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              {schedule.length > 0 && (
                <section>
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-black mb-2">Course structure</h2>
                    <p className="text-gray-600">Live sessions on Zoom — set by your instructor</p>
                  </div>
                  <div className="relative">
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-black to-gray-200" />
                    <div className="space-y-8">
                      {schedule.map((s, index) => (
                        <div key={s.id || index} className="relative pl-16">
                          <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-white border-4 border-black flex items-center justify-center shadow-lg">
                            <span className="text-black font-bold text-lg">{s.sessionNumber ?? index + 1}</span>
                          </div>
                          <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
                            <h3 className="text-xl font-bold text-black mb-2">{s.title}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(s.startTime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                              {s.zoomLink && " · Zoom link provided"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
              <section>
                <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                      <span className="text-xs font-bold text-black uppercase tracking-wider">Your Nexnoon Expert</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-start gap-8">
                      <div className="relative flex-shrink-0">
                        {d.instructor.image ? (
                          <img src={d.instructor.image} alt={d.instructor.name} className="w-32 h-32 rounded-xl object-cover shadow-lg border-2 border-gray-100" />
                        ) : (
                          <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-gray-100">
                            <span className="text-5xl font-bold text-black">N</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-black mb-1">{d.instructor.name}</h3>
                        <p className="text-gray-500 text-sm font-medium mb-4">{d.instructor.title}</p>
                        <p className="text-gray-600 leading-relaxed">{d.instructor.bio || "Expert instructor for this live class."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="col-span-1" />
          </div>
        </div>
        <div className="py-24 bg-gray-900">
          <div className="w-[90vw] mx-auto max-w-4xl text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Join this live class on Zoom</h2>
            <p className="text-xl text-gray-400 mb-10">{d.students?.toLocaleString()} students enrolled</p>
            <Button onClick={() => navigate(`/payment/${apiClass.id}`)} className="bg-[#889dd1] hover:bg-[#7a8ec5] text-white px-12 py-6 text-lg rounded-xl font-bold">
              Enroll for {formatPrice(d.price)}
            </Button>
            <p className="text-gray-500 mt-6 text-sm">Live sessions via Zoom · Instructor-led</p>
          </div>
        </div>
        <div ref={relatedCoursesRef} className="bg-white border-t border-gray-100 py-16">
          <LiveClasses title="Related Courses" subtitle="Continue your learning" limit={4} />
        </div>
        <Footer />
      </div>
    );
  }

  // Intersection Observer for Related Courses section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCardFixed(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-100px 0px 0px 0px",
      }
    );

    if (relatedCoursesRef.current) {
      observer.observe(relatedCoursesRef.current);
    }

    return () => {
      if (relatedCoursesRef.current) {
        observer.unobserve(relatedCoursesRef.current);
      }
    };
  }, []);

  // Content data specific to UI/UX Design
  const whatYouLearnUIUX = [
    "Create effective wireframes and interactive prototypes",
    "Conduct user research and usability testing",
    "Build comprehensive design systems from scratch",
    "Learn industry-standard tools: Figma, Sketch, Adobe XD",
    "Design responsive interfaces for web and mobile",
    "Master design thinking and user-centered design",
  ];

  const whatYouLearnDev = [
    "Design scalable React applications with clean architecture",
    "Master advanced hooks and custom hook patterns",
    "Implement state management with Context and Redux",
    "Build reusable component libraries",
    "Testing strategies with Jest and React Testing Library",
    "Performance optimization and code splitting",
  ];

  const outcomesUIUX = [
    { 
      title: "Data Fundamentals",
      topics: ["Introduction to business analytics", "Data types and sources", "Data cleaning basics"],
      project: "Clean and prepare a messy dataset"
    },
    { 
      title: "Statistical Analysis",
      topics: ["Descriptive statistics", "Probability distributions", "Hypothesis testing"],
      project: "Analyze sales trends and forecast revenue"
    },
    { 
      title: "Data Visualization",
      topics: ["Chart selection principles", "Dashboard design", "Storytelling with data"],
      project: "Create interactive business dashboards"
    }
  ];

  const outcomesDev = [
    "A production-ready React application (portfolio-grade)",
    "A reusable component library you can use in projects",
    "Confidence building complex frontend features end-to-end",
  ];

  // Advanced React specific content
  const advancedReactModules = [
    { 
      title: "Week 1: Component Architecture & Patterns",
      topics: [
        "Compound Components pattern",
        "Render Props and Higher-Order Components",
        "Custom Hooks design patterns",
        "Component composition strategies"
      ],
      project: "Build a flexible, reusable Dropdown component system"
    },
    { 
      title: "Week 2: State Management at Scale",
      topics: [
        "Context API with performance optimization",
        "Redux Toolkit modern patterns",
        "State machines with XState",
        "Server state with React Query"
      ],
      project: "Implement a production-grade shopping cart with optimistic updates"
    },
    { 
      title: "Week 3: Performance & Testing",
      topics: [
        "React.memo, useMemo, useCallback strategies",
        "Code splitting and lazy loading",
        "Testing with React Testing Library",
        "E2E testing fundamentals"
      ],
      project: "Optimize a slow dashboard application and achieve 95+ Lighthouse score"
    },
  ];

  const advancedReactOutcomes = [
    "Architect scalable React applications following industry patterns",
    "Debug complex performance issues in production apps",
    "Write maintainable, testable component libraries",
    "Confidently discuss advanced React concepts in technical interviews",
    "Ship features faster with proven architectural patterns"
  ];

  const advancedReactPrerequisites = [
    "Solid understanding of JavaScript ES6+",
    "Basic React knowledge (components, props, state, hooks)",
    "Familiarity with npm/yarn and command line",
    "Experience building at least one React project"
  ];

  const advancedReactFAQ = [
    {
      question: "Is this course suitable for beginners?",
      answer: "This is an advanced course. You should have at least 6 months of React experience and be comfortable with hooks, components, and basic state management."
    },
    {
      question: "Will I get live code reviews?",
      answer: "Yes! Each week includes a live session where Sarah reviews student code, answers questions, and provides personalized feedback on your projects."
    },
    {
      question: "What if I can't attend live sessions?",
      answer: "All sessions are recorded and available immediately after class. You'll also get access to a dedicated Slack community for async support."
    },
    {
      question: "Do I get a certificate?",
      answer: "Yes! Upon completing all projects and assessments, you'll receive a verified certificate you can add to LinkedIn and your portfolio."
    }
  ];

  if (!classData) {
    return null;
  }

  // formatPrice and formatDate already declared at component level above

  // All courses now use the UI/UX Design style (black/white + blue accent)
  // Remove old conditional rendering - all courses use same template
  const isUIUXCourse = true; // Apply to all courses

  // Render UI/UX Design style for all courses
  if (!isUIUXCourse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header variant="light" />
        
        {/* Hero Section with Video Card */}
        <div 
          className="pt-20 h-[70vh] flex items-center relative overflow-hidden"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/75 to-black/70"></div>
          
          <div className="w-[90vw] mx-auto py-8 relative z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white/80 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Back to courses</span>
            </button>

            <div className="grid grid-cols-3 gap-12">
              <div className="col-span-2">
                <div className="inline-block px-3 py-1 bg-[#889dd1]/30 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full mb-4">
                  Live Online Class
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  {classData.title}
                </h1>
                
                <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                  {classData.description}
                </p>

                <div className="flex items-center gap-6 text-white/90">
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
                  <img
                    src={classData.instructor.image}
                    alt={classData.instructor.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <p className="text-sm text-gray-300">Nexnoon Expert</p>
                    <p className="text-white font-medium">{classData.instructor.name}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div 
                  ref={videoCardRef}
                  className={`transition-all duration-300 ${
                    isCardFixed 
                      ? 'fixed top-32 w-[340px]' 
                      : 'relative'
                  }`}
                  style={isCardFixed ? { 
                    maxWidth: '340px',
                    right: 'calc((100vw - 90vw) / 2)'
                  } : {}}
                >
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 max-h-[220px]">
                      <iframe
                        className="w-full h-full"
                        src={classData.video}
                        title="Course preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <div className="p-3">
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(classData.price)}
                          </span>
                          <span className="text-gray-400 text-xs font-medium">USD</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => navigate(`/payment/${paymentId}`)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold mb-3 shadow-lg hover:shadow-xl transition-all"
                      >
                        Enroll Now
                      </Button>

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

        {/* Content Sections */}
        <div className="w-[90vw] mx-auto py-16">
          <div className="grid grid-cols-3 gap-12">
            {/* Left: Main Content */}
            <div className="col-span-2 space-y-16">
              
              {/* Skills Section - Clean Cards */}
              <section>
                <div className="mb-10">
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">Skills you'll gain</h2>
                  <p className="text-gray-600">Core competencies for modern data professionals</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { title: "Data Analysis", desc: "Master statistical methods, hypothesis testing, and data cleaning techniques" },
                    { title: "Visualization", desc: "Create compelling dashboards and charts that tell data stories" },
                    { title: "Business Intelligence", desc: "Transform data into strategic insights that drive decisions" },
                    { title: "SQL & Databases", desc: "Query and manipulate data from enterprise database systems" },
                    { title: "Excel & Tools", desc: "Advanced Excel, Power BI, Tableau, and modern analytics tools" },
                    { title: "Communication", desc: "Present findings to stakeholders with clarity and impact" }
                  ].map((skill, index) => (
                    <div 
                      key={index} 
                      className="group relative overflow-hidden bg-white border-2 border-gray-100 rounded-2xl p-6 transition-all hover:shadow-lg"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#889dd1]/5 rounded-full -mr-8 -mt-8 group-hover:bg-[#889dd1]/10 transition-colors"></div>
                      <div className="relative">
                        <div className="w-10 h-10 bg-[#889dd1]/10 rounded-lg flex items-center justify-center mb-3">
                          <div className="w-5 h-5 bg-[#889dd1] rounded-sm"></div>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">{skill.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{skill.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Course Structure - Timeline Design */}
              <section>
                <div className="mb-10">
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">5-Week Course Structure</h2>
                  <p className="text-gray-600">Live sessions every week with hands-on exercises</p>
                </div>
                
                <div className="relative space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-[21px] top-8 bottom-8 w-0.5 bg-[#889dd1]/30"></div>
                  
                  {[
                    { 
                      week: 1, 
                      title: "Data Fundamentals",
                      topics: ["Introduction to business analytics", "Data types and sources", "Data cleaning basics"],
                      project: "Clean and prepare a messy dataset"
                    },
                    { 
                      week: 2, 
                      title: "Statistical Analysis",
                      topics: ["Descriptive statistics", "Probability distributions", "Hypothesis testing"],
                      project: "Conduct A/B testing analysis"
                    },
                    { 
                      week: 3, 
                      title: "Data Visualization",
                      topics: ["Chart selection principles", "Dashboard design", "Storytelling with data"],
                      project: "Build an executive dashboard"
                    },
                    { 
                      week: 4, 
                      title: "SQL & Databases",
                      topics: ["Database fundamentals", "Complex queries", "Data aggregation"],
                      project: "Analyze sales data with SQL"
                    },
                    { 
                      week: 5, 
                      title: "Business Applications",
                      topics: ["KPI frameworks", "Predictive analytics intro", "Communication strategies"],
                      project: "Present insights to stakeholders"
                    }
                  ].map((module, index) => (
                    <div key={index} className="relative pl-16">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-6 w-11 h-11 bg-[#889dd1] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                        <span className="text-white font-bold text-sm">{module.week}</span>
                      </div>
                      
                      {/* Card */}
                      <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden transition-all hover:shadow-lg">
                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">{module.title}</h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#889dd1]"></div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Topics Covered</span>
                              </div>
                              <ul className="space-y-2">
                                {module.topics.map((topic, i) => (
                                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2 pl-4">
                                    <span className="text-[#889dd1] font-bold">•</span>
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
                    </div>
                  ))}
                </div>
              </section>

              {/* Nexnoon Expert - Minimalist Card */}
              <section>
                <div className="mb-10">
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">Meet your Nexnoon Expert</h2>
                </div>
                
                <div className="relative overflow-hidden bg-white rounded-3xl border-2 border-gray-100 p-10">
                  {/* Subtle accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#889dd1]"></div>
                  
                  <div className="grid lg:grid-cols-5 gap-10 mt-4">
                    <div className="lg:col-span-2">
                      <div className="relative">
                        <img
                          src={classData.instructor.image}
                          alt={classData.instructor.name}
                          className="relative w-full aspect-square object-cover rounded-2xl shadow-lg"
                        />
                      </div>
                    </div>
                    <div className="lg:col-span-3">
                      <div className="inline-block px-3 py-1 bg-gray-100 rounded-full mb-4">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Chief Data Officer</span>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-3">{classData.instructor.name}</h3>
                      <p className="text-lg text-gray-600 mb-6">{classData.instructor.title}</p>
                      <p className="text-gray-700 leading-relaxed mb-8">{classData.instructor.bio}</p>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">15+</div>
                          <div className="text-xs text-gray-600">Years in Data</div>
                        </div>
                        <div className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">100K+</div>
                          <div className="text-xs text-gray-600">Students</div>
                        </div>
                        <div className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">4.9</div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Spacer for sticky sidebar */}
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-24 bg-gray-900">
          <div className="w-[90vw] mx-auto max-w-4xl text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Transform data into decisions
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Start your analytics journey • {classData.students?.toLocaleString()} students enrolled
            </p>
            <Button 
              onClick={() => navigate(`/payment/${paymentId}`)}
              className="bg-[#889dd1] hover:bg-[#7a8ec5] text-white px-12 py-6 text-lg rounded-xl transition-all shadow-2xl hover:shadow-3xl font-bold"
            >
              Enroll for {formatPrice(classData.price)}
            </Button>
            <p className="text-gray-500 mt-6 text-sm">30-day money-back guarantee • Lifetime access</p>
          </div>
        </div>

        <div ref={relatedCoursesRef} className="bg-gray-50 border-t border-gray-100 py-16">
          <LiveClasses title="More business courses" subtitle="" />
        </div>
        
        <Footer />
      </div>
    );
  }

  // Remove Marketing-specific design - all use UI/UX style
  if (false) {
    return (
      <div className="min-h-screen bg-white">
        <Header variant="light" />
        
        {/* Hero Section with Video Card */}
        <div 
          className="pt-20 h-[70vh] flex items-center relative overflow-hidden"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/75 to-black/70"></div>
          
          <div className="w-[90vw] mx-auto py-8 relative z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white/80 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Back to courses</span>
            </button>

            <div className="grid grid-cols-3 gap-12">
              <div className="col-span-2">
                <div className="inline-block px-3 py-1 bg-[#889dd1]/30 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full mb-4">
                  Live Online Class
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  {classData.title}
                </h1>
                
                <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                  {classData.description}
                </p>

                <div className="flex items-center gap-6 text-white/90">
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
                  <img
                    src={classData.instructor.image}
                    alt={classData.instructor.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <p className="text-sm text-gray-300">Nexnoon Expert</p>
                    <p className="text-white font-medium">{classData.instructor.name}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div 
                  ref={videoCardRef}
                  className={`transition-all duration-300 ${
                    isCardFixed 
                      ? 'fixed top-32 w-[340px]' 
                      : 'relative'
                  }`}
                  style={isCardFixed ? { 
                    maxWidth: '340px',
                    right: 'calc((100vw - 90vw) / 2)'
                  } : {}}
                >
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 max-h-[220px]">
                      <iframe
                        className="w-full h-full"
                        src={classData.video}
                        title="Course preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <div className="p-3">
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(classData.price)}
                          </span>
                          <span className="text-gray-400 text-xs font-medium">USD</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => navigate(`/payment/${paymentId}`)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold mb-3 shadow-lg hover:shadow-xl transition-all"
                      >
                        Enroll Now
                      </Button>

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

        {/* Content Sections */}
        <div className="w-[90vw] mx-auto py-16">
          <div className="grid grid-cols-3 gap-12">
            {/* Left: Main Content */}
            <div className="col-span-2 space-y-16">
              
              {/* What You'll Master - Gradient Cards */}
              <section>
                <h2 className="text-4xl font-bold text-gray-900 mb-10">What You'll Master</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    "SEO strategies that rank on Google first page",
                    "Content marketing frameworks that convert",
                    "Social media advertising ROI optimization",
                    "Email marketing automation and segmentation",
                    "Analytics and data-driven decision making",
                    "Growth hacking techniques for rapid scaling"
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="relative group overflow-hidden rounded-2xl bg-white border-2 border-gray-100 p-6 transition-all hover:shadow-lg"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#889dd1] to-[#7a8ec5] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-start gap-4">
                        <div className="bg-[#889dd1]/10 rounded-lg p-2 flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-[#889dd1]" />
                        </div>
                        <p className="text-gray-700 font-medium leading-relaxed">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Real Results - Stats Grid */}
              <section>
                <h2 className="text-4xl font-bold text-gray-900 mb-10">Real Results</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#889dd1] to-[#7a8ec5] p-8 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <div className="text-5xl font-bold mb-3">250%</div>
                      <div className="text-white/90 text-sm leading-relaxed">Average traffic increase</div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#889dd1]/20 rounded-full -ml-16 -mb-16"></div>
                    <div className="relative">
                      <div className="text-5xl font-bold mb-3">$50K+</div>
                      <div className="text-gray-300 text-sm leading-relaxed">Revenue from campaigns</div>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 p-8">
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#889dd1]/10 rounded-full"></div>
                    <div className="relative">
                      <div className="text-5xl font-bold text-gray-900 mb-3">92%</div>
                      <div className="text-gray-600 text-sm leading-relaxed">Apply skills week 1</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Course Curriculum - Modern Cards */}
              <section>
                <h2 className="text-4xl font-bold text-gray-900 mb-10">Course Curriculum</h2>
                <div className="space-y-4">
                  {[
                    { week: 1, title: "Marketing Fundamentals", topics: "Strategy, Positioning, Customer Research", color: "from-blue-500 to-blue-600" },
                    { week: 2, title: "Content & SEO", topics: "Content Strategy, SEO Optimization, Keyword Research", color: "from-purple-500 to-purple-600" },
                    { week: 3, title: "Growth & Analytics", topics: "Growth Hacking, Analytics, ROI Tracking", color: "from-[#889dd1] to-[#7a8ec5]" }
                  ].map((module, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-2xl bg-white border-2 border-gray-100 transition-all">
                      <div className="flex">
                        <div className={`w-24 flex items-center justify-center bg-gradient-to-br ${module.color}`}>
                          <div className="text-center">
                            <div className="text-xs text-white/70 font-medium mb-1">Week</div>
                            <div className="text-3xl font-bold text-white">{module.week}</div>
                          </div>
                        </div>
                        <div className="flex-1 p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{module.topics}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Nexnoon Expert - Premium Card */}
              <section>
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 shadow-2xl">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#889dd1]/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-3 h-3 rounded-full bg-[#889dd1] animate-pulse"></div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Nexnoon Expert</span>
                    </div>
                    
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                      <div className="lg:col-span-1">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-br from-[#889dd1]/30 to-purple-500/30 rounded-2xl blur-xl"></div>
                          <div className="relative w-full aspect-square bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                            <span className="text-8xl font-bold text-gray-900">N</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-2">
                        <h3 className="text-3xl font-bold text-white mb-2">Nexnoon Expert</h3>
                        <p className="text-[#889dd1] font-semibold text-lg mb-6">{classData.instructor.title}</p>
                        <p className="text-gray-300 leading-relaxed mb-8">{classData.instructor.bio}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Spacer for sticky sidebar */}
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-24 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="w-[90vw] mx-auto max-w-4xl text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Start Growing Your Business Today
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join {classData.students?.toLocaleString()} marketers already enrolled
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => navigate(`/payment/${paymentId}`)}
                className="bg-[#889dd1] hover:bg-[#7a8ec5] text-white px-12 py-6 text-lg rounded-xl transition-all shadow-2xl hover:shadow-3xl font-bold"
              >
                Enroll for {formatPrice(classData.price)}
              </Button>
            </div>
            <p className="text-gray-500 mt-6 text-sm">30-day money-back guarantee • Lifetime access</p>
          </div>
        </div>

        <div ref={relatedCoursesRef} className="bg-gray-50 border-t border-gray-100 py-16">
          <LiveClasses title="More marketing courses" subtitle="" />
        </div>
        
        <Footer />
      </div>
    );
  }

  // If it's the UI/UX course, render the new minimalistic design
  if (isUIUXCourse) {
    return (
      <div className="min-h-screen bg-white">
        <Header variant="light" />
        
        {/* Hero Section with Video Card */}
        <div 
          className="pt-20 h-[70vh] flex items-center relative overflow-hidden"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1572044162444-ad60f128bdea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1aSUyMHV4JTIwZGVzaWdufGVufDF8fHx8MTc2ODc0MTczNHww&ixlib=rb-4.1.0&q=80&w=1080)`,
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

            <div className="grid grid-cols-3 gap-12">
              <div className="col-span-2">
                <div className="inline-block px-3 py-1 bg-[#889dd1]/30 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full mb-4">
                  Live Online Class
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  {classData.title}
                </h1>
                
                <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                  {classData.description}
                </p>

                <div className="flex items-center gap-6 text-white/90">
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
                    <p className="text-white font-medium">Nexnoon Expert</p>
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div 
                  ref={videoCardRef}
                  className={`transition-all duration-300 ${
                    isCardFixed 
                      ? 'fixed top-32 w-[340px]' 
                      : 'relative'
                  }`}
                  style={isCardFixed ? { 
                    maxWidth: '340px',
                    right: 'calc((100vw - 90vw) / 2)'
                  } : {}}
                >
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 max-h-[220px]">
                      <iframe
                        className="w-full h-full"
                        src={classData.video}
                        title="Course preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <div className="p-3">
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(classData.price)}
                          </span>
                          <span className="text-gray-400 text-xs font-medium">USD</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => navigate(`/payment/${paymentId}`)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-semibold mb-3 shadow-lg hover:shadow-xl transition-all"
                      >
                        Enroll Now
                      </Button>

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
          <div className="grid grid-cols-3 gap-12">
            {/* Left: Course Details */}
            <div className="col-span-2 space-y-16">
              
              {/* What You'll Learn - Bento Box Grid */}
              <section>
                <h2 className="text-3xl font-bold text-black mb-10">What you'll learn</h2>
                <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {(classData.id === 1 ? whatYouLearnDev : whatYouLearnUIUX).map((item, index) => (
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

              {/* Countdown Timer - Only for Advanced React */}
              {classData.id === 1 && (
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
                      {classData.id === 1 ? (
                        <>
                          <p className="text-gray-700 leading-relaxed mb-4">
                            Move beyond basic React to production-ready patterns used at companies like Meta, Netflix, and Airbnb. 
                            This intensive course covers advanced component design, state management strategies, and performance optimization techniques.
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            Through hands-on projects and live code reviews with Sarah Johnson, you'll build real-world applications 
                            that showcase architectural patterns employers look for. Perfect for developers ready to level up from 
                            junior to mid-level roles.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-700 leading-relaxed mb-4">
                            This comprehensive UI/UX design course takes you from fundamentals to advanced concepts through hands-on projects. 
                            You'll work with real design challenges and build a professional portfolio that showcases your skills.
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            Each week includes live sessions, design critiques, and personalized feedback to ensure you're mastering 
                            industry-standard practices used by top design teams.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* 5-Week Course Structure - Timeline Style */}
              <section>
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-black mb-2">
                    {classData.id === 1 ? '3-Week Course Structure' : '5-Week Course Structure'}
                  </h2>
                  <p className="text-gray-600">Live sessions every week with hands-on exercises</p>
                </div>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-black to-gray-200"></div>
                  
                  <div className="space-y-8">
                    {(classData.id === 1 ? advancedReactModules : outcomesUIUX).map((module, index) => (
                      <div key={index} className="relative pl-16 group">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-white border-4 border-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-black font-bold text-lg">{index + 1}</span>
                        </div>
                        
                        {/* Content card */}
                        <div className="bg-white rounded-xl p-6 border-2 border-gray-100 transition-all shadow-sm hover:shadow-md">
                          <h3 className="text-xl font-bold text-black mb-4">{module.title}</h3>
                          <div className="grid grid-cols-2 gap-6">
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
                    <div className="flex items-start gap-8">
                      {/* Profile image with decorative elements */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute -inset-2 bg-gradient-to-br from-black/20 to-transparent rounded-2xl"></div>
                        <div className="relative w-32 h-32 rounded-xl bg-white flex items-center justify-center shadow-lg border-2 border-gray-100">
                          <span className="text-5xl font-bold text-black">N</span>
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
                        <p className="text-gray-600 leading-relaxed">
                          {classData.instructor.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Prerequisites - Only for Advanced React */}
              {classData.id === 1 && (
                <section>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                    <h2 className="text-3xl font-bold mb-6">Prerequisites</h2>
                    <p className="text-gray-300 mb-6">
                      This is an advanced course designed for developers with React experience. 
                      Before enrolling, make sure you have:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {advancedReactPrerequisites.map((prereq, index) => (
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

              {/* Learning Outcomes - Only for Advanced React */}
              {classData.id === 1 && (
                <section>
                  <h2 className="text-3xl font-bold text-black mb-6">By the end of this course, you'll be able to:</h2>
                  <div className="space-y-3">
                    {advancedReactOutcomes.map((outcome, index) => (
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

              {/* Certificate Preview - Only for Advanced React */}
              {classData.id === 1 && (
                <section>
                  <CertificatePreview />
                </section>
              )}

              {/* Student Reviews - Only for Advanced React */}
              {classData.id === 1 && (
                <section>
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-black mb-3">Student Reviews</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="w-6 h-6 fill-current text-black"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-black">4.9</span>
                      <span className="text-gray-500">({classData.students?.toLocaleString()} reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        name: "Alex Thompson",
                        role: "Frontend Developer",
                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                        rating: 5,
                        date: "2 weeks ago",
                        review: "This course completely transformed how I approach React development. Sarah's explanations of compound components and custom hooks are crystal clear. The projects are challenging but incredibly rewarding. I'm now confidently implementing these patterns at work.",
                        helpful: 42
                      },
                      {
                        name: "Priya Sharma",
                        role: "Senior React Engineer",
                        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
                        rating: 5,
                        date: "1 month ago",
                        review: "The live code reviews were game-changing. Getting feedback directly from Sarah helped me understand not just what to do, but why. The performance optimization week alone was worth the entire course fee. Highly recommend for intermediate developers looking to level up.",
                        helpful: 38
                      },
                      {
                        name: "Marcus Chen",
                        role: "Full Stack Developer",
                        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
                        rating: 5,
                        date: "3 weeks ago",
                        review: "Best React course I've taken. The focus on real-world patterns used in production apps sets this apart. I landed a senior role at a tech company largely thanks to the confidence I gained from this course. The certificate also looks great on LinkedIn!",
                        helpful: 51
                      },
                      {
                        name: "Emily Rodriguez",
                        role: "UI Engineer",
                        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
                        rating: 4,
                        date: "2 months ago",
                        review: "Excellent content and well-structured curriculum. Sarah is an amazing instructor who really knows her stuff. The only minor drawback is that some weeks felt a bit rushed, but the recorded sessions helped me catch up. Overall, a fantastic investment in my career.",
                        helpful: 29
                      }
                    ].map((review, index) => (
                      <div 
                        key={index}
                        className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-gray-200 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={review.avatar}
                            alt={review.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-black">{review.name}</h4>
                                <p className="text-sm text-gray-500">{review.role}</p>
                              </div>
                              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{review.date}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 fill-current ${
                                    star <= review.rating ? 'text-black' : 'text-gray-300'
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-4">{review.review}</p>

                            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                <span>Helpful ({review.helpful})</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View All Reviews Button */}
                  <div className="mt-8 text-center">
                    <Button 
                      variant="outline" 
                      className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 rounded-xl font-semibold transition-all"
                    >
                      View All {classData.students?.toLocaleString()} Reviews
                    </Button>
                  </div>
                </section>
              )}

              {/* FAQ - Only for Advanced React */}
              {classData.id === 1 && (
                <section>
                  <h2 className="text-3xl font-bold text-black mb-10">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {advancedReactFAQ.map((faq, index) => (
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
            <div className="col-span-1"></div>
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

  // Original design for other courses
  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="light" />
      
      {/* Desktop View */}
      <div className="hidden lg:block">
        {/* Hero Section */}
        <div 
          className="pt-20 h-[70vh] flex items-center relative overflow-hidden"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/75 to-black/70"></div>
          
          <div className="w-[90vw] mx-auto py-8 relative z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white/80 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Back to courses</span>
            </button>

            <div className="grid grid-cols-3 gap-12">
              {/* Left: Course Info */}
              <div className="col-span-2">
                <div className="inline-block px-3 py-1 bg-[#889dd1]/30 backdrop-blur-sm border border-white/20 text-white text-sm rounded-full mb-4">
                  Live Online Class
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                  {classData.title}
                </h1>
                
                <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                  {classData.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-6 text-white/90">
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

                {/* Nexnoon Expert Preview */}
                <div className="mt-8 flex items-center gap-4">
                  <img
                    src={classData.instructor.image}
                    alt={classData.instructor.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <p className="text-sm text-gray-300">Nexnoon Expert</p>
                    <p className="text-white font-medium">{classData.instructor.name}</p>
                  </div>
                </div>
              </div>

              {/* Right: Video Card - Fixed/Sticky */}
              <div className="col-span-1">
                <div 
                  ref={videoCardRef}
                  className={`transition-all duration-300 ${
                    isCardFixed 
                      ? 'fixed top-32 w-[340px]' 
                      : 'relative'
                  }`}
                  style={isCardFixed ? { 
                    maxWidth: '340px',
                    right: 'calc((100vw - 1280px) / 2 + 24px)'
                  } : {}}
                >
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Video */}
                    <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 max-h-[220px]">
                      <iframe
                        className="w-full h-full"
                        src={classData.video}
                        title="Course preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Card Content */}
                    <div className="p-3">
                      {/* Price Section - Modern Bold Style */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(classData.price)}
                          </span>
                          <span className="text-gray-400 text-xs font-medium">USD</span>
                        </div>
                      </div>

                      {/* Enroll Button - Modern Style */}
                      <Button 
                        onClick={() => navigate(`/payment/${paymentId}`)}
                        className="w-full bg-[rgb(4,5,5)] hover:bg-[#7a8ec5] text-white py-2.5 rounded-xl text-sm font-semibold mb-3 shadow-lg shadow-[#889dd1]/20 hover:shadow-xl hover:shadow-[#889dd1]/30 transition-all"
                      >
                        Enroll Now
                      </Button>

                      {/* Divider */}
                      <div className="border-t border-gray-100 mb-3"></div>

                      {/* Course Details - Modern Grid */}
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
          <div className="grid grid-cols-3 gap-12">
            {/* Left: Course Details */}
            <div className="col-span-2 space-y-12">
              {/* What You'll Learn */}
              <section id="overview">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    {whatYouLearnDev.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#889dd1] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Course Overview */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    This live course is designed to help you build real production systems — not toy examples. 
                    You'll leave with a clean, deployable project template you can reuse for MVPs and client work. 
                    Each session includes live coding, Q&A, and hands-on exercises to reinforce what you learn.
                  </p>
                </div>
              </section>

              {/* Outcomes */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll build</h2>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <ul className="space-y-4">
                    {outcomesDev.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="bg-[#889dd1]/10 rounded-full p-1 mt-1">
                          <CheckCircle2 className="h-4 w-4 text-[#889dd1]" />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Nexnoon Expert */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Nexnoon Expert</h2>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-6">
                    <img
                      src={classData.instructor.image}
                      alt={classData.instructor.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {classData.instructor.name}
                      </h3>
                      <p className="text-[#889dd1] font-medium mb-3">
                        {classData.instructor.title}
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        {classData.instructor.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Spacer for sticky sidebar */}
            <div className="col-span-1"></div>
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
      </div>

      {/* Mobile View */}
      <div className="lg:hidden pt-16">
        <div 
          className="px-4 py-8 relative overflow-hidden"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/75 to-black/70"></div>
          
          <div className="relative z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white/80 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Back</span>
            </button>

            <div className="inline-block px-3 py-1 bg-[#889dd1]/30 backdrop-blur-sm border border-white/20 text-white text-xs rounded-full mb-3">
              Live Online Class
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-3 leading-tight">
              {classData.title}
            </h1>
            
            <p className="text-gray-200 mb-4 text-sm leading-relaxed">
              {classData.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-white/90 text-xs mb-6">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{classData.students?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{classData.duration} {classData.durationBase}</span>
              </div>
            </div>

            {/* Video Card */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="relative aspect-video bg-gray-900">
                <iframe
                  className="w-full h-full"
                  src={classData.video}
                  title="Course preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatPrice(classData.price)}
                </div>
                <p className="text-xs text-gray-500 mb-4">One-time payment</p>

                <Button 
                  onClick={() => navigate(`/payment/${paymentId}`)}
                  className="w-full bg-[#889dd1] hover:bg-[#7a8ec5] text-white py-5 rounded-lg font-medium mb-4"
                >
                  Enroll Now
                </Button>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-gray-500 mb-1">Duration</p>
                    <p className="font-medium text-gray-900">{classData.duration} {classData.durationBase}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-gray-500 mb-1">Format</p>
                    <p className="font-medium text-gray-900">{classData.format}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-8 space-y-8">
          {/* What You'll Learn */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">What you'll learn</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-3">
                {whatYouLearnDev.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#889dd1] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Course Overview */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Overview</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                This live course is designed to help you build real production systems — not toy examples. 
                You'll leave with a clean, deployable project template you can reuse for MVPs and client work.
              </p>
            </div>
          </section>

          {/* Nexnoon Expert */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Nexnoon Expert</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <img
                  src={classData.instructor.image}
                  alt={classData.instructor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {classData.instructor.name}
                  </h3>
                  <p className="text-xs text-[#889dd1] font-medium mb-2">
                    {classData.instructor.title}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {classData.instructor.bio}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Related Courses */}
        <div className="bg-white border-t border-gray-100 py-8">
          <LiveClasses
            title="Related Courses"
            subtitle="Continue learning"
            limit={4}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}