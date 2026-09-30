import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  Wallet,
  Tag,
  Headphones,
  Video,
  Star,
  Eye,
  EyeOff,
  X,
  Moon,
  Sun,
} from "lucide-react";

const API_BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://skillforge-backend-5qln.onrender.com";

type View = "dashboard" | "students" | "courses" | "offers" | "payments" | "reviews";
type StudentReview = {
  id:number;
  student_name:string;
  review_text:string;
  video_url:string;
  thumbnail_url:string|null;
  rating:number;
  is_published:boolean;
  display_order:number;
  created_at:string;
  updated_at:string;
};
type ReviewForm = {
  studentName:string;
  reviewText:string;
  videoUrl:string;
  thumbnailUrl:string;
  rating:string;
  displayOrder:string;
  isPublished:boolean;
};
type OverviewFeature = { icon: string; title: string; description: string };
type CourseOverviewForm = { overviewIntro: string; whatYouLearn: string[]; requirements: string[]; targetAudience: string; skillsCovered: string[]; features: OverviewFeature[] };

type DashboardStats = { students: number; enrollments: number; successfulPayments: number; revenue: number };
type Payment = { id:number; userId:number; studentName:string; studentEmail:string; studentPhone:string|null; razorpayOrderId:string; razorpayPaymentId:string|null; amount:number; currency:string; paymentType:string; courseIds:string[]; courseNames:string[]; status:string; createdAt:string; paidAt:string|null };
type PaymentSummary = { total:number; paid:number; pending:number; failed:number; revenue:number };
type AdminInfo = { id: number; name: string; email: string };
type Student = { id: number; name: string; email: string; phone: string; created_at: string; enrollment_count: number; enrolled_course_ids: string[] };
type Course = { id: number; title: string; description: string | null; category: string | null; level: string | null; price: number; original_price: number | null; thumbnail: string | null; is_published: boolean; created_at: string; updated_at: string; module_count: number; lecture_count: number; quiz_count: number };
type ModuleItem = { id: number; course_id: number; title: string; description: string | null; module_order: number; created_at: string; updated_at: string };
type LectureItem = { id: number; module_id: number; title: string; description: string | null; video_url: string | null; lecture_order: number; duration: number; is_free: boolean; created_at: string; updated_at: string };
type QuizItem = { id: number; lecture_id: number; question: string; options: string[]; correct_answer: string; created_at?: string };
type CourseForm = { title: string; description: string; category: string; level: string; price: string; originalPrice: string; thumbnail: string; isPublished: boolean };
type ModuleForm = { title: string; description: string; moduleOrder: string };
type LectureForm = { title: string; description: string; videoUrl: string; lectureOrder: string; duration: string; isFree: boolean };
type QuizForm = { question: string; options: string[]; correctAnswer: string };
type Offer = { id:number; title:string; description:string|null; badge_text:string|null; button_text:string; price:number; original_price:number|null; banner_image:string|null; course_ids:string[]; is_active:boolean; show_home:boolean; show_dashboard:boolean; start_at:string|null; end_at:string|null; created_at:string; updated_at:string };
type OfferForm = { title:string; description:string; badgeText:string; buttonText:string; price:string; originalPrice:string; bannerImage:string; courseIds:string[]; isActive:boolean; showHome:boolean; showDashboard:boolean; startAt:string; endAt:string };
type SupportSettings = { name:string; email:string; phone:string; message:string };

const emptyCourse: CourseForm = { title: "", description: "", category: "", level: "Beginner", price: "799", originalPrice: "1699", thumbnail: "", isPublished: false };
const emptyModule: ModuleForm = { title: "", description: "", moduleOrder: "1" };
const emptyLecture: LectureForm = { title: "", description: "", videoUrl: "", lectureOrder: "1", duration: "10", isFree: false };
const emptyQuiz: QuizForm = { question: "", options: ["", "", "", ""], correctAnswer: "" };
const emptyOffer: OfferForm = { title:"", description:"", badgeText:"", buttonText:"Get Offer Now", price:"", originalPrice:"", bannerImage:"", courseIds:[], isActive:false, showHome:true, showDashboard:true, startAt:"", endAt:"" };
const emptyReview: ReviewForm = { studentName:"", reviewText:"", videoUrl:"", thumbnailUrl:"", rating:"5", displayOrder:"0", isPublished:false };
const emptyOverview: CourseOverviewForm = { overviewIntro:"", whatYouLearn:[""], requirements:[""], targetAudience:"", skillsCovered:[""], features:[
  { icon:"BookOpen", title:"Structured Curriculum", description:"A clear learning path from fundamentals to practical concepts." },
  { icon:"PlayCircle", title:"Practical Learning", description:"Course lectures and demonstrations are available after purchase." },
  { icon:"Award", title:"Quizzes & Certificate", description:"Assess your learning and complete the course requirements." },
  { icon:"TrendingUp", title:"Career Foundation", description:"Build skills that can support further projects and career learning." },
] };
const offerTemplate = (count: 2 | 3): OfferForm => ({ title:`Any ${count} Courses`, description:`Choose any ${count} courses and unlock them together at one offer price.`, badgeText:"SPECIAL OFFER", buttonText:"Get Offer Now", price:count === 2 ? "899" : "999", originalPrice:"", bannerImage:"", courseIds:[], isActive:false, showHome:true, showDashboard:true, startAt:"", endAt:"" });

function token() { return localStorage.getItem("skillforge_token"); }
async function api(path: string, init: RequestInit = {}) {
  const t = token();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (t) headers.set("Authorization", `Bearer ${t}`);
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) throw new Error(data?.message || "Request failed");
  return data;
}
function date(value: string) { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(d); }
function money(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }

function Input({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span><input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400/60 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600" /></label>;
}
function Textarea({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span><textarea rows={4} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400/60 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600" /></label>;
}
function Modal({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm dark:bg-black/70" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className={`max-h-[92vh] w-full ${wide ? "max-w-5xl" : "max-w-2xl"} overflow-y-auto rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-white/10 dark:bg-[#0b1222] dark:text-white`}>{children}</div></div>;
}
function Header({ onRefresh, busy, dark, onToggleTheme }: { onRefresh: () => void; busy: boolean; dark: boolean; onToggleTheme: () => void }) {
  return <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#020617]/95"><div className="mx-auto flex min-h-[88px] max-w-[1210px] items-center justify-between gap-5 px-5 lg:px-0"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500 dark:text-indigo-400"><Shield size={25}/></div><div><h1 className="text-xl font-black text-slate-900 dark:text-white">SkillForge Admin</h1><p className="text-xs text-slate-500">Complete course management</p></div></div><div className="flex items-center gap-2"><button onClick={onToggleTheme} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" title={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? <Sun size={16}/> : <Moon size={16}/>}<span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span></button><button onClick={onRefresh} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"><RefreshCw size={16} className={busy ? "animate-spin" : ""}/> Refresh</button></div></div></header>;
}
function Stat({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{title}</p><p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{value}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">{icon}</div></div></div>; }

export default function AdminDashboard() {
  const [view, setView] = useState<View>("dashboard");
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({ total:0, paid:0, pending:0, failed:0, revenue:0 });
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentFrom, setPaymentFrom] = useState("");
  const [paymentTo, setPaymentTo] = useState("");
  const [offerSearch, setOfferSearch] = useState("");
  const [offerModal, setOfferModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const [offerForm, setOfferForm] = useState<OfferForm>(emptyOffer);
  const [offerSaving, setOfferSaving] = useState(false);

  const [courseModal, setCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourse);
  const [courseSaving, setCourseSaving] = useState(false);
  const [overviewModal, setOverviewModal] = useState(false);
  const [overviewCourse, setOverviewCourse] = useState<Course | null>(null);
  const [overviewForm, setOverviewForm] = useState<CourseOverviewForm>(emptyOverview);
  const [overviewSaving, setOverviewSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("skillforge_admin_theme") !== "light");
  const [supportModal, setSupportModal] = useState(false);
  const [supportSettings, setSupportSettings] = useState<SupportSettings>({ name:"Naimish Singh", email:"snera980@gmail.com", phone:"+91 8960513302", message:"For course, account or payment support, contact the SkillForge support team." });
  const [supportSaving, setSupportSaving] = useState(false);

  const [reviews, setReviews] = useState<StudentReview[]>([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewForm>(emptyReview);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewSearch, setReviewSearch] = useState("");

  const [contentCourse, setContentCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [lectures, setLectures] = useState<Record<number, LectureItem[]>>({});
  const [quizzes, setQuizzes] = useState<Record<number, QuizItem[]>>({});
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [expandedLecture, setExpandedLecture] = useState<number | null>(null);
  const [contentBusy, setContentBusy] = useState(false);

  const [moduleModal, setModuleModal] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleForm>(emptyModule);
  const [moduleSaving, setModuleSaving] = useState(false);

  const [lectureModal, setLectureModal] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState<number | null>(null);
  const [lectureModuleId, setLectureModuleId] = useState<number | null>(null);
  const [lectureForm, setLectureForm] = useState<LectureForm>(emptyLecture);
  const [lectureSaving, setLectureSaving] = useState(false);

  const [quizModal, setQuizModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [quizLectureId, setQuizLectureId] = useState<number | null>(null);
  const [quizForm, setQuizForm] = useState<QuizForm>(emptyQuiz);
  const [quizSaving, setQuizSaving] = useState(false);

  const loadDashboard = async () => { try { setLoading(true); const d = await api("/api/admin/dashboard"); setAdmin(d.admin); setStats(d.stats); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load dashboard"); } finally { setLoading(false); } };
  const loadStudents = async () => { try { setLoading(true); const d = await api("/api/admin/students"); setStudents(d.students || []); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load students"); } finally { setLoading(false); } };
  const loadCourses = async () => { try { setLoading(true); const d = await api("/api/admin/courses"); setCourses(d.courses || []); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load courses"); } finally { setLoading(false); } };
  const loadOffers = async () => { try { setLoading(true); const d = await api("/api/offers"); setOffers(d.offers || []); } catch (e) { setError(e instanceof Error ? e.message : "Unable to load offers"); } finally { setLoading(false); } };
  const loadPayments = async () => { try { setLoading(true); const params = new URLSearchParams(); if(paymentSearch.trim()) params.set("search", paymentSearch.trim()); if(paymentStatus !== "all") params.set("status", paymentStatus); if(paymentFrom) params.set("from", paymentFrom); if(paymentTo) params.set("to", paymentTo); const d = await api(`/api/admin/payments?${params.toString()}`); setPayments(d.payments || []); setPaymentSummary(d.summary || {total:0,paid:0,pending:0,failed:0,revenue:0}); } catch(e) { setError(e instanceof Error ? e.message : "Unable to load payments"); } finally { setLoading(false); } };
  const loadReviews = async () => {
    try {
      setLoading(true);
      const d = await api("/api/admin/reviews");
      setReviews(d.reviews || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load student reviews");
    } finally {
      setLoading(false);
    }
  };
  const loadSupportSettings = async () => {
    try {
      const d = await api("/api/admin/support-settings");
      if (d.support) {
        setSupportSettings({
          name: d.support.name || "Naimish Singh",
          email: d.support.email || "snera980@gmail.com",
          phone: d.support.phone || "+91 8960513302",
          message: d.support.message || "For course, account or payment support, contact the SkillForge support team.",
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load support settings");
    }
  };

  const openSupportSettings = async () => {
    setSupportModal(true);
    await loadSupportSettings();
  };

  const saveSupportSettings = async () => {
    if (!supportSettings.name.trim()) return setError("Support name is required");
    if (!supportSettings.email.trim()) return setError("Support email is required");
    if (!supportSettings.phone.trim()) return setError("Support phone is required");
    if (!supportSettings.message.trim()) return setError("Support message is required");

    try {
      setSupportSaving(true);
      setError("");
      const d = await api("/api/admin/support-settings", {
        method: "PUT",
        body: JSON.stringify({
          name: supportSettings.name.trim(),
          email: supportSettings.email.trim(),
          phone: supportSettings.phone.trim(),
          message: supportSettings.message.trim(),
        }),
      });

      if (d.support) {
        setSupportSettings({
          name: d.support.name,
          email: d.support.email,
          phone: d.support.phone,
          message: d.support.message,
        });
      }

      setSupportModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save support settings");
    } finally {
      setSupportSaving(false);
    }
  };
  useEffect(() => { void loadDashboard(); }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", darkMode); localStorage.setItem("skillforge_admin_theme", darkMode ? "dark" : "light"); }, [darkMode]);
  useEffect(() => { if (view === "students") void loadStudents(); if (view === "courses") void loadCourses(); if (view === "offers") { void loadOffers(); void loadCourses(); } if (view === "payments") void loadPayments();
    if (view === "reviews") void loadReviews();
  }, [view]);

  const filteredStudents = useMemo(() => { const q = studentSearch.toLowerCase().trim(); return !q ? students : students.filter(s => [s.name,s.email,s.phone,String(s.id)].some(v => v.toLowerCase().includes(q))); }, [students, studentSearch]);
  const filteredOffers = useMemo(() => { const q=offerSearch.toLowerCase().trim(); return !q ? offers : offers.filter(o=>[o.title,o.description||"",o.badge_text||"",String(o.id)].some(v=>v.toLowerCase().includes(q))); }, [offers, offerSearch]);
  const filteredCourses = useMemo(() => { const q = courseSearch.toLowerCase().trim(); return !q ? courses : courses.filter(c => [c.title,c.description || "",c.category || "",c.level || "",String(c.id)].some(v => v.toLowerCase().includes(q))); }, [courses, courseSearch]);
  const filteredReviews = useMemo(() => {
    const q = reviewSearch.toLowerCase().trim();
    return !q ? reviews : reviews.filter(r =>
      [r.student_name, r.review_text, r.video_url, String(r.id)]
        .some(v => v.toLowerCase().includes(q))
    );
  }, [reviews, reviewSearch]);

  const paymentStatusLabel = (status:string) => status === "paid" ? "Paid" : status === "failed" ? "Failed" : status === "created" ? "Pending" : status;
  const paymentStatusClass = (status:string) => status === "paid" ? "bg-emerald-500/10 text-emerald-400" : status === "failed" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400";

  const openCreateCourse = () => { setEditingCourseId(null); setCourseForm(emptyCourse); setCourseModal(true); };
  const openEditCourse = (c: Course) => { setEditingCourseId(c.id); setCourseForm({ title:c.title, description:c.description || "", category:c.category || "", level:c.level || "Beginner", price:String(c.price), originalPrice:c.original_price == null ? "" : String(c.original_price), thumbnail:c.thumbnail || "", isPublished:c.is_published }); setCourseModal(true); };
  const saveCourse = async () => {
    if (!courseForm.title.trim()) return setError("Course title is required");
    if (!courseForm.category.trim()) return setError("Course category is required");
    const price = Number(courseForm.price); if (!Number.isFinite(price) || price < 0) return setError("Invalid offer price"); const originalPrice = Number(courseForm.originalPrice); if (!Number.isFinite(originalPrice) || originalPrice < 0) return setError("Invalid actual price"); if (originalPrice < price) return setError("Actual price cannot be lower than offer price");
    try { setCourseSaving(true); setError(""); const path = editingCourseId ? `/api/admin/courses/${editingCourseId}` : "/api/admin/courses"; await api(path, { method: editingCourseId ? "PUT" : "POST", body: JSON.stringify({ ...courseForm, title:courseForm.title.trim(), description:courseForm.description.trim() || null, category:courseForm.category.trim(), level:courseForm.level.trim(), price, originalPrice, thumbnail:courseForm.thumbnail.trim() || null }) }); setCourseModal(false); await loadCourses(); } catch(e) { setError(e instanceof Error ? e.message : "Unable to save course"); } finally { setCourseSaving(false); }
  };
  const openOverview = async (c: Course) => {
    setOverviewCourse(c);
    setOverviewForm(emptyOverview);
    setOverviewModal(true);
    setOverviewSaving(true);
    setError("");

    try {
      const d = await api(`/api/admin/courses/${c.id}/overview`);
      const overview = d.overview || d.course || d;

      setOverviewForm({
        overviewIntro: overview.overviewIntro || "",
        whatYouLearn:
          Array.isArray(overview.whatYouLearn) && overview.whatYouLearn.length
            ? overview.whatYouLearn
            : [""],
        requirements:
          Array.isArray(overview.requirements) && overview.requirements.length
            ? overview.requirements
            : [""],
        targetAudience: overview.targetAudience || "",
        skillsCovered: Array.isArray(overview.skillsCovered) && overview.skillsCovered.length ? overview.skillsCovered : [""],
        features: Array.isArray(overview.overviewFeatures) && overview.overviewFeatures.length
          ? overview.overviewFeatures.map((item: any) => ({ icon:item?.icon || "BookOpen", title:item?.title || "", description:item?.description || "" }))
          : emptyOverview.features,
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to load course overview"
      );
    } finally {
      setOverviewSaving(false);
    }
  };

  const saveOverview = async () => {
    if (!overviewCourse) return;
    const whatYouLearn = overviewForm.whatYouLearn.map(v => v.trim()).filter(Boolean);
    const requirements = overviewForm.requirements.map(v => v.trim()).filter(Boolean);
    const skillsCovered = overviewForm.skillsCovered.map(v => v.trim()).filter(Boolean);
    const features = overviewForm.features.map(item => ({ icon:item.icon.trim() || "BookOpen", title:item.title.trim(), description:item.description.trim() })).filter(item => item.title && item.description);

    if (!overviewForm.overviewIntro.trim()) return setError("Overview introduction is required");
    if (!whatYouLearn.length) return setError("Add at least one learning outcome");
    if (!overviewForm.targetAudience.trim()) return setError("Target audience is required");

    try {
      setOverviewSaving(true);
      setError("");
      await api(`/api/admin/courses/${overviewCourse.id}/overview`, {
        method: "PUT",
        body: JSON.stringify({
          overviewIntro: overviewForm.overviewIntro.trim(),
          whatYouLearn,
          requirements,
          targetAudience: overviewForm.targetAudience.trim(),
          skillsCovered,
          overviewFeatures: features,
        }),
      });
      setOverviewForm(v => ({
        ...v,
        whatYouLearn: whatYouLearn.length ? whatYouLearn : [""],
        requirements: requirements.length ? requirements : [""],
        skillsCovered: skillsCovered.length ? skillsCovered : [""],
        features: features.length ? features : emptyOverview.features,
      }));
      setOverviewModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save course overview");
    } finally {
      setOverviewSaving(false);
    }
  };

  const updateOverviewList = (field: "whatYouLearn" | "requirements", index: number, value: string) => {
    setOverviewForm(current => {
      const next = [...current[field]];
      next[index] = value;
      return { ...current, [field]: next };
    });
  };

  const addOverviewListItem = (field: "whatYouLearn" | "requirements") => {
    setOverviewForm(current => ({ ...current, [field]: [...current[field], ""] }));
  };

  const removeOverviewListItem = (field: "whatYouLearn" | "requirements", index: number) => {
    setOverviewForm(current => {
      const next = current[field].filter((_, i) => i !== index);
      return { ...current, [field]: next.length ? next : [""] };
    });
  };
  const updateSkill = (index:number, value:string) => setOverviewForm(current => { const next=[...current.skillsCovered]; next[index]=value; return {...current, skillsCovered:next}; });
  const addSkill = () => setOverviewForm(current => ({...current, skillsCovered:[...current.skillsCovered, ""]}));
  const removeSkill = (index:number) => setOverviewForm(current => { const next=current.skillsCovered.filter((_,i)=>i!==index); return {...current, skillsCovered:next.length?next:[""]}; });
  const updateFeature = (index:number, field:keyof OverviewFeature, value:string) => setOverviewForm(current => ({...current, features:current.features.map((item,i)=>i===index?{...item,[field]:value}:item)}));
  const addFeature = () => setOverviewForm(current => ({...current, features:[...current.features,{icon:"BookOpen",title:"",description:""}]}));
  const removeFeature = (index:number) => setOverviewForm(current => ({...current, features:current.features.filter((_,i)=>i!==index)}));

  const togglePublish = async (c: Course) => { try { await api(`/api/admin/courses/${c.id}`, { method:"PUT", body:JSON.stringify({ isPublished: !c.is_published }) }); await loadCourses(); if (contentCourse?.id === c.id) setContentCourse({...contentCourse,is_published:!c.is_published}); } catch(e) { setError(e instanceof Error ? e.message : "Unable to update publish status"); } };
  const deleteCourse = async (c: Course) => { if (!window.confirm(`Delete "${c.title}"? This will delete its modules, lectures and quizzes. Enrolled courses cannot be deleted.`)) return; try { await api(`/api/admin/courses/${c.id}`, { method:"DELETE" }); await loadCourses(); } catch(e) { setError(e instanceof Error ? e.message : "Unable to delete course"); } };

  const openCreateOffer = () => { setEditingOfferId(null); setOfferForm(emptyOffer); setOfferModal(true); };
  const openCreateOfferTemplate = (count: 2 | 3) => { setEditingOfferId(null); setOfferForm(offerTemplate(count)); setOfferModal(true); };
  const openEditOffer = (o:Offer) => {
    const iso=(v:string|null)=>{
      if(!v) return "";
      const raw=String(v).trim();
      if(/Z$/i.test(raw)||/[+-]\d{2}:?\d{2}$/.test(raw)){
        const d=new Date(raw);
        return Number.isFinite(d.getTime())?d.toISOString().slice(0,16):"";
      }
      return raw.replace(" ","T").slice(0,16);
    };
    setEditingOfferId(o.id); setOfferForm({title:o.title,description:o.description||"",badgeText:o.badge_text||"",buttonText:o.button_text,price:String(o.price),originalPrice:o.original_price==null?"":String(o.original_price),bannerImage:o.banner_image||"",courseIds:Array.isArray(o.course_ids)?o.course_ids:[],isActive:o.is_active,showHome:o.show_home,showDashboard:o.show_dashboard,startAt:iso(o.start_at),endAt:iso(o.end_at)}); setOfferModal(true); };
  const saveOffer = async () => { if(!offerForm.title.trim()) return setError("Offer title is required"); const price=Number(offerForm.price); if(!Number.isFinite(price)||price<=0) return setError("Invalid offer price"); const original=offerForm.originalPrice.trim()===""?null:Number(offerForm.originalPrice); if(original!==null&&(!Number.isFinite(original)||original<0)) return setError("Invalid original price"); const mixMatch=offerForm.title.match(/any\s+(2|3)\s+courses?/i); if(mixMatch){const required=Number(mixMatch[1]); if(offerForm.courseIds.length<required) return setError(`Select at least ${required} eligible courses for this offer`); if(required===2 && price<=0) return setError("Invalid Any 2 offer price"); if(required===3 && price<=0) return setError("Invalid Any 3 offer price");} try{setOfferSaving(true);setError("");const path=editingOfferId?`/api/offers/${editingOfferId}`:"/api/offers";await api(path,{method:editingOfferId?"PUT":"POST",body:JSON.stringify({title:offerForm.title.trim(),description:offerForm.description.trim()||null,badgeText:offerForm.badgeText.trim()||null,buttonText:offerForm.buttonText.trim()||"Get Offer Now",price,originalPrice:original,bannerImage:offerForm.bannerImage.trim()||null,courseIds:offerForm.courseIds,isActive:offerForm.isActive,showHome:offerForm.showHome,showDashboard:offerForm.showDashboard,startAt:offerForm.startAt||null,endAt:offerForm.endAt||null})});setOfferModal(false);await loadOffers();}catch(e){setError(e instanceof Error?e.message:"Unable to save offer");}finally{setOfferSaving(false);} };
  const toggleOffer = async (o:Offer) => { try{await api(`/api/offers/${o.id}/status`,{method:"PATCH",body:JSON.stringify({isActive:!o.is_active})});await loadOffers();}catch(e){setError(e instanceof Error?e.message:"Unable to update offer");} };
  const deleteOffer = async (o:Offer) => { if(!window.confirm(`Delete "${o.title}"?`))return; try{await api(`/api/offers/${o.id}`,{method:"DELETE"});await loadOffers();}catch(e){setError(e instanceof Error?e.message:"Unable to delete offer");} };

  const loadContent = async (c: Course) => { try { setContentBusy(true); const d = await api(`/api/admin/courses/${c.id}/content`); setContentCourse(d.course); setModules(d.modules || []); setLectures({}); setQuizzes({}); setExpandedModule(null); setExpandedLecture(null); } catch(e) { setError(e instanceof Error ? e.message : "Unable to load content"); } finally { setContentBusy(false); } };
  const closeContent = () => { if (contentBusy || moduleSaving || lectureSaving || quizSaving) return; setContentCourse(null); setModules([]); setLectures({}); setQuizzes({}); };
  const loadLectures = async (moduleId:number) => { try { setContentBusy(true); const d = await api(`/api/admin/modules/${moduleId}/lectures`); setLectures(v=>({...v,[moduleId]:d.lectures || []})); setExpandedModule(moduleId); } catch(e) { setError(e instanceof Error ? e.message : "Unable to load lectures"); } finally { setContentBusy(false); } };
  const loadQuizzes = async (lectureId:number) => { try { const d = await api(`/api/admin/lectures/${lectureId}/quizzes`); setQuizzes(v=>({...v,[lectureId]:d.quizzes || []})); setExpandedLecture(lectureId); } catch(e) { setError(e instanceof Error ? e.message : "Unable to load quizzes"); } };
  const refreshContent = async () => { if (contentCourse) await loadContent(contentCourse); await loadCourses(); };

  const openCreateModule = () => { setEditingModuleId(null); setModuleForm({ ...emptyModule, moduleOrder:String(modules.length + 1) }); setModuleModal(true); };
  const openEditModule = (m:ModuleItem) => { setEditingModuleId(m.id); setModuleForm({title:m.title,description:m.description || "",moduleOrder:String(m.module_order)}); setModuleModal(true); };
  const saveModule = async () => { if (!contentCourse || !moduleForm.title.trim()) return setError("Module title is required"); try { setModuleSaving(true); const path=editingModuleId?`/api/admin/modules/${editingModuleId}`:`/api/admin/courses/${contentCourse.id}/modules`; await api(path,{method:editingModuleId?"PUT":"POST",body:JSON.stringify({...moduleForm,title:moduleForm.title.trim(),description:moduleForm.description.trim()||null,moduleOrder:Number(moduleForm.moduleOrder)})}); setModuleModal(false); await refreshContent(); } catch(e){setError(e instanceof Error?e.message:"Unable to save module");} finally{setModuleSaving(false);} };
  const deleteModule = async (m:ModuleItem) => { if(!window.confirm(`Delete "${m.title}" and all lectures/quizzes inside it?`)) return; try{await api(`/api/admin/modules/${m.id}`,{method:"DELETE"}); await refreshContent();}catch(e){setError(e instanceof Error?e.message:"Unable to delete module");} };

  const openCreateLecture = (m:ModuleItem) => { const arr=lectures[m.id]||[]; const first=modules.length===0 || (m.module_order===Math.min(...modules.map(x=>x.module_order)) && arr.length===0); setLectureModuleId(m.id); setEditingLectureId(null); setLectureForm({...emptyLecture,lectureOrder:String(arr.length+1),isFree:first}); setLectureModal(true); };
  const openEditLecture = (m:ModuleItem,l:LectureItem) => { setLectureModuleId(m.id); setEditingLectureId(l.id); setLectureForm({title:l.title,description:l.description||"",videoUrl:l.video_url||"",lectureOrder:String(l.lecture_order),duration:String(l.duration||0),isFree:l.is_free}); setLectureModal(true); };
  const saveLecture = async () => { if(!lectureModuleId || !lectureForm.title.trim() || !lectureForm.videoUrl.trim()) return setError("Lecture title and video URL are required"); try{setLectureSaving(true); const path=editingLectureId?`/api/admin/lectures/${editingLectureId}`:`/api/admin/modules/${lectureModuleId}/lectures`; await api(path,{method:editingLectureId?"PUT":"POST",body:JSON.stringify({title:lectureForm.title.trim(),description:lectureForm.description.trim()||null,videoUrl:lectureForm.videoUrl.trim(),lectureOrder:Number(lectureForm.lectureOrder),duration:Number(lectureForm.duration),isFree:lectureForm.isFree})}); setLectureModal(false); if(contentCourse){await refreshContent(); const d=await api(`/api/admin/modules/${lectureModuleId}/lectures`); setLectures(v=>({...v,[lectureModuleId]:d.lectures||[]}));} }catch(e){setError(e instanceof Error?e.message:"Unable to save lecture");}finally{setLectureSaving(false);} };
  const deleteLecture = async (m:ModuleItem,l:LectureItem) => { if(!window.confirm(`Delete "${l.title}" and its quizzes?`))return; try{await api(`/api/admin/lectures/${l.id}`,{method:"DELETE"}); const d=await api(`/api/admin/modules/${m.id}/lectures`); setLectures(v=>({...v,[m.id]:d.lectures||[]})); await loadCourses();}catch(e){setError(e instanceof Error?e.message:"Unable to delete lecture");} };

  const openCreateQuiz = (l:LectureItem) => { setQuizLectureId(l.id); setEditingQuizId(null); setQuizForm(emptyQuiz); setQuizModal(true); };
  const openEditQuiz = (l:QuizItem) => { setQuizLectureId(l.lecture_id); setEditingQuizId(l.id); setQuizForm({question:l.question,options:Array.isArray(l.options)?l.options:["","","",""],correctAnswer:l.correct_answer}); setQuizModal(true); };
  const saveQuiz = async () => { if(!quizLectureId || !quizForm.question.trim()) return setError("Quiz question is required"); const opts=quizForm.options.map(x=>x.trim()).filter(Boolean); if(opts.length<2)return setError("Add at least 2 options"); if(!quizForm.correctAnswer || !opts.includes(quizForm.correctAnswer.trim()))return setError("Select a valid correct answer"); try{setQuizSaving(true); const path=editingQuizId?`/api/admin/quizzes/${editingQuizId}`:`/api/admin/lectures/${quizLectureId}/quizzes`; await api(path,{method:editingQuizId?"PUT":"POST",body:JSON.stringify({question:quizForm.question.trim(),options:opts,correctAnswer:quizForm.correctAnswer.trim()})}); setQuizModal(false); await loadQuizzes(quizLectureId); await loadCourses();}catch(e){setError(e instanceof Error?e.message:"Unable to save quiz");}finally{setQuizSaving(false);} };
  const deleteQuiz = async (q:QuizItem) => { if(!window.confirm("Delete this quiz question?"))return; try{await api(`/api/admin/quizzes/${q.id}`,{method:"DELETE"}); await loadQuizzes(q.lecture_id); await loadCourses();}catch(e){setError(e instanceof Error?e.message:"Unable to delete quiz");} };

  const openCreateReview = () => {
    setEditingReviewId(null);
    setReviewForm(emptyReview);
    setReviewModal(true);
  };

  const openEditReview = (r: StudentReview) => {
    setEditingReviewId(r.id);
    setReviewForm({
      studentName: r.student_name,
      reviewText: r.review_text,
      videoUrl: r.video_url,
      thumbnailUrl: r.thumbnail_url || "",
      rating: String(r.rating),
      displayOrder: String(r.display_order),
      isPublished: r.is_published,
    });
    setReviewModal(true);
  };

  const saveReview = async () => {
    const rating = Number(reviewForm.rating);
    const displayOrder = Number(reviewForm.displayOrder);

    if (!reviewForm.studentName.trim()) return setError("Student name is required");
    if (!reviewForm.reviewText.trim()) return setError("Review text is required");
    if (!reviewForm.videoUrl.trim()) return setError("Video URL is required");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return setError("Rating must be between 1 and 5");
    if (!Number.isInteger(displayOrder) || displayOrder < 0) return setError("Display order must be a non-negative integer");

    try {
      setReviewSaving(true);
      setError("");
      const path = editingReviewId
        ? `/api/admin/reviews/${editingReviewId}`
        : "/api/admin/reviews";

      await api(path, {
        method: editingReviewId ? "PUT" : "POST",
        body: JSON.stringify({
          studentName: reviewForm.studentName.trim(),
          reviewText: reviewForm.reviewText.trim(),
          videoUrl: reviewForm.videoUrl.trim(),
          thumbnailUrl: reviewForm.thumbnailUrl.trim() || null,
          rating,
          displayOrder,
          isPublished: reviewForm.isPublished,
        }),
      });

      setReviewModal(false);
      await loadReviews();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save student review");
    } finally {
      setReviewSaving(false);
    }
  };

  const toggleReviewPublish = async (r: StudentReview) => {
    try {
      await api(`/api/admin/reviews/${r.id}/publish`, {
        method: "PATCH",
        body: JSON.stringify({ isPublished: !r.is_published }),
      });
      await loadReviews();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update review status");
    }
  };

  const deleteReview = async (r: StudentReview) => {
    if (!window.confirm(`Delete review from "${r.student_name}"?`)) return;

    try {
      await api(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
      await loadReviews();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete student review");
    }
  };

  const busy = loading || contentBusy;
  return <div className={`min-h-screen bg-slate-50 text-slate-900 dark:bg-[#020617] dark:text-white ${darkMode ? "dark" : ""}`}><Header dark={darkMode} onToggleTheme={()=>setDarkMode(v=>!v)} onRefresh={()=>{if(view==="dashboard")void loadDashboard();else if(view==="students")void loadStudents();else if(view==="courses") void loadCourses(); else if(view==="offers") void loadOffers();
    else if(view==="payments") void loadPayments();
    else void loadReviews();}} busy={busy}/><main className="mx-auto max-w-[1210px] px-5 py-9 lg:px-0">
    {error && <div className="mb-6 flex items-start justify-between rounded-2xl border border-red-500/20 bg-red-50 px-5 py-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"><span>{error}</span><button onClick={()=>setError("")}><X size={18}/></button></div>}
    {view==="dashboard" && <><section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-emerald-50/60 to-indigo-50/70 p-7 shadow-sm dark:border-white/10 dark:from-[#10182d] dark:via-[#0d172c] dark:to-[#0b1325] dark:shadow-none">
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-400">Admin Access</span>
      <h2 className="mt-4 text-3xl font-black text-slate-950 dark:text-white">Welcome, {admin?.name||"Admin"} 👋</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{admin?.email||"Loading..."}</p>
    </section><section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><Stat title="Total Students" value={stats?.students??0} icon={<Users/>}/><Stat title="Enrollments" value={stats?.enrollments??0} icon={<BookOpen/>}/><Stat title="Successful Payments" value={stats?.successfulPayments??0} icon={<CreditCard/>}/><Stat title="Revenue" value={money(stats?.revenue??0)} icon={<Wallet/>}/></section><section className="mt-10"><h3 className="text-xl font-black">Management</h3><div className="mt-5 grid gap-5 lg:grid-cols-3"><button onClick={()=>setView("students")} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-6 text-left hover:border-indigo-400/30"><Users className="text-indigo-400"/><h4 className="mt-5 text-lg font-black">Students</h4><p className="mt-2 text-sm text-slate-400">View students and enrollments.</p></button><button onClick={()=>setView("courses")} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-6 text-left hover:border-cyan-400/30"><BookOpen className="text-cyan-400"/><h4 className="mt-5 text-lg font-black">Courses</h4><p className="mt-2 text-sm text-slate-400">Create and manage the complete course CMS.</p></button><button onClick={()=>setView("offers")} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-6 text-left hover:border-amber-400/30"><Tag className="text-amber-400"/><h4 className="mt-5 text-lg font-black">Offers</h4><p className="mt-2 text-sm text-slate-400">Create and manage promotional offers.</p></button><button onClick={()=>setView("payments")} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-6 text-left hover:border-emerald-400/30"><CreditCard className="text-emerald-400"/><h4 className="mt-5 text-lg font-black">Payments</h4><p className="mt-2 text-sm text-slate-400">View Razorpay payment reports, status and revenue.</p><span className="mt-4 inline-block rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400">Open Reports</span></button><button onClick={()=>void openSupportSettings()} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-6 text-left hover:border-amber-400/30"><Headphones className="text-amber-400"/><h4 className="mt-5 text-lg font-black">Support Settings</h4><p className="mt-2 text-sm text-slate-400">Manage the student Need Help contact information.</p><span className="mt-4 inline-block rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400">Manage Support</span></button><button onClick={()=>setView("reviews")} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-6 text-left hover:border-purple-400/30"><Video className="text-purple-400"/><h4 className="mt-5 text-lg font-black">Student Reviews</h4><p className="mt-2 text-sm text-slate-400">Add and manage student review videos for the website.</p><span className="mt-4 inline-block rounded-lg bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-400">Manage Reviews</span></button></div></section></>}
    {view==="payments" && <section>
      <button onClick={()=>setView("dashboard")} className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><ArrowLeft size={17}/> Back</button>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><h2 className="text-3xl font-black">Payments</h2><p className="mt-2 text-sm text-slate-500">Read-only Razorpay payment reporting.</p></div>
        <button onClick={()=>void loadPayments()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold"><RefreshCw size={16} className={loading?"animate-spin":""}/> Refresh</button>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat title="Total Orders" value={paymentSummary.total} icon={<CreditCard/>}/>
        <Stat title="Paid" value={paymentSummary.paid} icon={<CreditCard/>}/>
        <Stat title="Pending" value={paymentSummary.pending} icon={<RefreshCw/>}/>
        <Stat title="Failed" value={paymentSummary.failed} icon={<X/>}/>
        <Stat title="Revenue" value={money(paymentSummary.revenue)} icon={<Wallet/>}/>
      </div>
      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[1fr_170px_160px_160px_auto]">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-slate-950"><Search size={18} className="text-slate-500"/><input value={paymentSearch} onChange={e=>setPaymentSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void loadPayments();}} placeholder="Student, email, order or payment ID..." className="w-full bg-transparent text-sm outline-none"/></div>
          <select value={paymentStatus} onChange={e=>{setPaymentStatus(e.target.value);}} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950"><option value="all">All statuses</option><option value="paid">Paid</option><option value="created">Pending</option><option value="failed">Failed</option></select>
          <input type="date" value={paymentFrom} onChange={e=>setPaymentFrom(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950" />
          <input type="date" value={paymentTo} onChange={e=>setPaymentTo(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950" />
          <button onClick={()=>void loadPayments()} className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold">Apply</button>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="overflow-x-auto"><table className="min-w-[1050px] w-full text-left"><thead className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950"><tr><th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student</th><th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Course / Type</th><th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th><th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th><th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Razorpay</th><th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-white/10">{payments.map(p=><tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/60"><td className="px-5 py-4"><p className="font-bold">{p.studentName}</p><p className="mt-1 text-xs text-slate-500">{p.studentEmail}</p></td><td className="px-5 py-4"><p className="font-semibold">{p.courseNames.length ? p.courseNames.join(", ") : p.paymentType === "combo" ? `Course bundle (${p.courseIds.length})` : "Course purchase"}</p><p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{p.paymentType}</p></td><td className="px-5 py-4 font-black">{money(p.amount)}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ${paymentStatusClass(p.status)}`}>{paymentStatusLabel(p.status)}</span></td><td className="px-5 py-4"><p className="max-w-[230px] truncate text-xs text-slate-500" title={p.razorpayOrderId}>Order: {p.razorpayOrderId}</p><p className="mt-1 max-w-[230px] truncate text-xs text-slate-500" title={p.razorpayPaymentId||""}>Payment: {p.razorpayPaymentId||"—"}</p></td><td className="px-5 py-4"><p className="text-sm">{date(p.createdAt)}</p><p className="mt-1 text-xs text-slate-500">{p.paidAt ? `Paid ${date(p.paidAt)}` : "—"}</p></td></tr>)}{!payments.length&&<tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-500">No payment records found.</td></tr>}</tbody></table></div>
      </div>
    </section>}
    {view==="students" && <section><button onClick={()=>setView("dashboard")} className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-900 dark:text-white"><ArrowLeft size={17}/> Back</button><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-black">Students</h2><p className="mt-2 text-sm text-slate-500">Registered SkillForge students.</p></div><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 px-3 py-2.5"><Search size={18} className="text-slate-500"/><input value={studentSearch} onChange={e=>setStudentSearch(e.target.value)} placeholder="Search students..." className="bg-transparent text-sm text-slate-900 outline-none dark:text-slate-900 dark:text-white"/></div></div><div className="mt-7 divide-y divide-slate-200 dark:divide-white/10 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">{filteredStudents.map(s=><div key={s.id} className="p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h4 className="font-bold">{s.name}</h4><p className="mt-1 text-sm text-slate-400">{s.email} · {s.phone||"—"}</p><p className="mt-1 text-xs text-slate-600">Joined {date(s.created_at)}</p></div><div className="rounded-xl bg-indigo-500/10 px-4 py-3 text-sm text-indigo-300">{s.enrollment_count} enrollment{s.enrollment_count===1?"":"s"}</div></div></div>)}{!filteredStudents.length&&<div className="p-12 text-center text-slate-500">No students found.</div>}</div></section>}
    {view==="courses" && <section><button onClick={()=>setView("dashboard")} className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-900 dark:text-white"><ArrowLeft size={17}/> Back</button><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h2 className="text-3xl font-black">Courses</h2><p className="mt-2 text-sm text-slate-500">Manage courses, modules, lectures, videos and quizzes.</p></div><div className="flex flex-col gap-3 sm:flex-row"><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 px-3 py-2.5"><Search size={18} className="text-slate-500"/><input value={courseSearch} onChange={e=>setCourseSearch(e.target.value)} placeholder="Search courses..." className="w-72 bg-transparent text-sm text-slate-900 outline-none dark:text-slate-900 dark:text-white"/></div><button onClick={openCreateCourse} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold"><Plus size={18}/> Add Course</button></div></div><div className="mt-7 space-y-4">{filteredCourses.map(c=><div key={c.id} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-5"><div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{c.title}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${c.is_published?"bg-emerald-500/10 text-emerald-400":"bg-amber-500/10 text-amber-400"}`}>{c.is_published?"Published":"Draft"}</span></div><p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{c.description||"No description"}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-white">{c.category||"IT & Tech"}</span><span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-white">{c.level||"Beginner"}</span><span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs line-through text-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-500">{c.original_price != null ? money(c.original_price) : "—"}</span><span className="rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300">{money(c.price)}</span>{c.original_price != null && c.original_price > c.price && <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">{Math.round(((c.original_price - c.price) / c.original_price) * 100)}% OFF · Save {money(c.original_price - c.price)}</span>}</div></div><div className="grid grid-cols-3 gap-3"><div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-white/10 dark:bg-slate-950"><p className="text-[10px] text-slate-500 dark:text-slate-600">Modules</p><p className="mt-1 font-bold">{c.module_count}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-white/10 dark:bg-slate-950"><p className="text-[10px] text-slate-500 dark:text-slate-600">Lectures</p><p className="mt-1 font-bold">{c.lecture_count}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-white/10 dark:bg-slate-950"><p className="text-[10px] text-slate-500 dark:text-slate-600">Quizzes</p><p className="mt-1 font-bold">{c.quiz_count}</p></div></div></div><div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-white/10 pt-4"><button onClick={()=>openEditCourse(c)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 px-3 py-2 text-xs font-bold"><Pencil size={13}/> Edit Course</button><button onClick={()=>void togglePublish(c)} className={`rounded-lg px-3 py-2 text-xs font-bold ${c.is_published?"bg-amber-500/10 text-amber-300":"bg-emerald-500/10 text-emerald-300"}`}>{c.is_published?"Unpublish":"Publish"}</button><button onClick={()=>void openOverview(c)} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-300">Course Overview</button><button onClick={()=>void loadContent(c)} className="rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">Manage Content</button><button onClick={()=>void deleteCourse(c)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-300"><Trash2 size={13}/> Delete</button></div></div>)}{!filteredCourses.length&&<div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-white/10">No courses found.</div>}</div></section>}
    {view==="offers" && <section><button onClick={()=>setView("dashboard")} className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-900 dark:text-white"><ArrowLeft size={17}/> Back</button><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h2 className="text-3xl font-black">Offers</h2><p className="mt-2 text-sm text-slate-500">Manage promotional offers from the database.</p></div><div className="flex flex-col gap-3 sm:flex-row"><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 px-3 py-2.5"><Search size={18} className="text-slate-500"/><input value={offerSearch} onChange={e=>setOfferSearch(e.target.value)} placeholder="Search offers..." className="w-72 bg-transparent text-sm text-slate-900 outline-none dark:text-slate-900 dark:text-white"/></div><button onClick={()=>openCreateOfferTemplate(2)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-black"><Plus size={17}/> Any 2 · ₹899</button><button onClick={()=>openCreateOfferTemplate(3)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-300"><Plus size={17}/> Any 3 · ₹999</button><button onClick={openCreateOffer} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 px-4 py-2.5 text-sm font-bold"><Plus size={17}/> Custom Offer</button></div></div><div className="mt-7 space-y-4">{filteredOffers.map(o=><div key={o.id} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-5"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{o.title}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${o.is_active?"bg-emerald-500/10 text-emerald-400":"bg-slate-800 text-slate-500"}`}>{o.is_active?"Active":"Inactive"}</span>{o.badge_text&&<span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">{o.badge_text}</span>}</div><p className="mt-2 text-sm text-slate-400">{o.description||"No description"}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300">{money(o.price)}</span>{o.original_price!=null&&<span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs line-through text-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-500">{money(o.original_price)}</span>}<span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-white">{o.course_ids?.length||0} courses</span></div></div><div className="flex flex-wrap gap-2"><button onClick={()=>openEditOffer(o)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 px-3 py-2 text-xs font-bold"><Pencil size={13}/> Edit</button><button onClick={()=>void toggleOffer(o)} className={`rounded-lg px-3 py-2 text-xs font-bold ${o.is_active?"bg-amber-500/10 text-amber-300":"bg-emerald-500/10 text-emerald-300"}`}>{o.is_active?"Deactivate":"Activate"}</button><button onClick={()=>void deleteOffer(o)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-300"><Trash2 size={13}/> Delete</button></div></div></div>)}{!filteredOffers.length&&<div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-white/10">No offers found. Create your first offer.</div>}</div></section>}
    {view==="reviews" && <section>
      <button onClick={()=>setView("dashboard")} className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 dark:hover:text-white"><ArrowLeft size={17}/> Back</button>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-3xl font-black">Student Reviews</h2>
          <p className="mt-2 text-sm text-slate-500">Manage student review videos displayed on the SkillForge website.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 px-3 py-2.5">
            <Search size={18} className="text-slate-500"/>
            <input value={reviewSearch} onChange={e=>setReviewSearch(e.target.value)} placeholder="Search reviews..." className="w-72 bg-transparent text-sm text-slate-900 outline-none dark:text-white"/>
          </div>
          <button onClick={openCreateReview} className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-bold"><Plus size={18}/> Add Review</button>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        {filteredReviews.map(r=><div key={r.id} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black">{r.student_name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${r.is_published?"bg-emerald-500/10 text-emerald-400":"bg-amber-500/10 text-amber-400"}`}>{r.is_published?"Published":"Hidden"}</span>
                <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold text-purple-300">Order {r.display_order}</span>
              </div>
              <div className="mt-3 flex items-center gap-1">{[1,2,3,4,5].map(n=><Star key={n} size={15} className={n<=r.rating?"fill-amber-400 text-amber-400":"text-slate-600"}/>)}</div>
              <p className="mt-3 max-w-3xl text-sm text-slate-400 whitespace-pre-wrap">{r.review_text}</p>
              <p className="mt-3 max-w-2xl truncate text-xs text-slate-500" title={r.video_url}>Video: {r.video_url}</p>
              {r.thumbnail_url && <p className="mt-1 max-w-2xl truncate text-xs text-slate-500" title={r.thumbnail_url}>Thumbnail: {r.thumbnail_url}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>openEditReview(r)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 px-3 py-2 text-xs font-bold"><Pencil size={13}/> Edit</button>
              <button onClick={()=>void toggleReviewPublish(r)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${r.is_published?"bg-amber-500/10 text-amber-300":"bg-emerald-500/10 text-emerald-300"}`}>{r.is_published?<><EyeOff size={13}/> Hide</>:<><Eye size={13}/> Publish</>}</button>
              <button onClick={()=>void deleteReview(r)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300"><Trash2 size={13}/> Delete</button>
            </div>
          </div>
        </div>)}
        {!filteredReviews.length && <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-white/10">No student reviews found. Add your first review video.</div>}
      </div>
    </section>}
  </main>

  {reviewModal && <Modal onClose={()=>!reviewSaving&&setReviewModal(false)} wide>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black">{editingReviewId?"Edit Student Review":"Add Student Review"}</h3>
          <p className="mt-1 text-xs text-slate-500">Add a student testimonial video for the website.</p>
        </div>
        <button onClick={()=>!reviewSaving&&setReviewModal(false)}><X/></button>
      </div>

      <div className="mt-6 space-y-5">
        <Input label="Student Name" value={reviewForm.studentName} onChange={v=>setReviewForm(f=>({...f,studentName:v}))} placeholder="e.g. Rahul Sharma"/>
        <Textarea label="Review Text" value={reviewForm.reviewText} onChange={v=>setReviewForm(f=>({...f,reviewText:v}))} placeholder="Student testimonial..." />
        <Input label="Video URL" value={reviewForm.videoUrl} onChange={v=>setReviewForm(f=>({...f,videoUrl:v}))} placeholder="https://..." />
        <Input label="Thumbnail URL (Optional)" value={reviewForm.thumbnailUrl} onChange={v=>setReviewForm(f=>({...f,thumbnailUrl:v}))} placeholder="https://..." />

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Rating</span>
            <select value={reviewForm.rating} onChange={e=>setReviewForm(f=>({...f,rating:e.target.value}))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-white">
              <option value="5">5 Stars</option><option value="4">4 Stars</option><option value="3">3 Stars</option><option value="2">2 Stars</option><option value="1">1 Star</option>
            </select>
          </label>
          <Input label="Display Order" type="number" value={reviewForm.displayOrder} onChange={v=>setReviewForm(f=>({...f,displayOrder:v}))} placeholder="0"/>
        </div>

        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/50 p-4">
          <div><p className="font-bold">Publish Review</p><p className="text-xs text-slate-500">Published reviews can be shown on the public website.</p></div>
          <input type="checkbox" checked={reviewForm.isPublished} onChange={e=>setReviewForm(f=>({...f,isPublished:e.target.checked}))} className="h-5 w-5 accent-purple-500"/>
        </label>

        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 pt-5">
          <button onClick={()=>setReviewModal(false)} disabled={reviewSaving} className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold">Cancel</button>
          <button onClick={()=>void saveReview()} disabled={reviewSaving} className="rounded-xl bg-purple-500 px-6 py-3 text-sm font-black disabled:opacity-60">{reviewSaving?"Saving...":"Save Review"}</button>
        </div>
      </div>
    </div>
  </Modal>}

  {supportModal && <Modal onClose={()=>!supportSaving&&setSupportModal(false)}>
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black">Support Settings</h3>
          <p className="mt-1 text-xs text-slate-500">These details are shown in the student Need Help section.</p>
        </div>
        <button onClick={()=>!supportSaving&&setSupportModal(false)}><X/></button>
      </div>

      <div className="mt-6 space-y-5">
        <Input label="Support Name" value={supportSettings.name} onChange={v=>setSupportSettings(f=>({...f,name:v}))} />
        <Input label="Support Email" type="email" value={supportSettings.email} onChange={v=>setSupportSettings(f=>({...f,email:v}))} />
        <Input label="Support Phone" value={supportSettings.phone} onChange={v=>setSupportSettings(f=>({...f,phone:v}))} />
        <Textarea label="Need Help Message" value={supportSettings.message} onChange={v=>setSupportSettings(f=>({...f,message:v}))} />

        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 pt-5">
          <button onClick={()=>setSupportModal(false)} disabled={supportSaving} className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold">Cancel</button>
          <button onClick={()=>void saveSupportSettings()} disabled={supportSaving} className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-black text-black">{supportSaving?"Saving...":"Save Support Settings"}</button>
        </div>
      </div>
    </div>
  </Modal>}

  {offerModal && <Modal onClose={()=>!offerSaving&&setOfferModal(false)} wide><div className="p-6"><div className="flex items-center justify-between"><div><h3 className="text-xl font-black">{editingOfferId?"Edit Offer":"Create Offer"}</h3><p className="mt-1 text-xs text-slate-500">Promotion settings and course selection.</p></div><button onClick={()=>setOfferModal(false)}><X/></button></div><div className="mt-6 space-y-5"><Input label="Offer Title" value={offerForm.title} onChange={v=>setOfferForm(f=>({...f,title:v}))}/><Textarea label="Description" value={offerForm.description} onChange={v=>setOfferForm(f=>({...f,description:v}))}/><div className="grid gap-5 sm:grid-cols-3"><Input label="Badge Text" value={offerForm.badgeText} onChange={v=>setOfferForm(f=>({...f,badgeText:v}))}/><Input label="Offer Price (₹)" type="number" value={offerForm.price} onChange={v=>setOfferForm(f=>({...f,price:v}))}/><Input label="Original Price (₹)" type="number" value={offerForm.originalPrice} onChange={v=>setOfferForm(f=>({...f,originalPrice:v}))}/></div><Input label="Button Text" value={offerForm.buttonText} onChange={v=>setOfferForm(f=>({...f,buttonText:v}))}/><Input label="Banner Image URL" value={offerForm.bannerImage} onChange={v=>setOfferForm(f=>({...f,bannerImage:v}))}/><div><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Eligible Courses</span><p className="mb-3 text-xs text-slate-500">For Any 2/Any 3 offers, select all courses students are allowed to choose from. The student will choose exactly 2 or 3 at checkout.</p><div className="grid gap-2 sm:grid-cols-2">{courses.map(c=><label key={c.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 p-3"><input type="checkbox" checked={offerForm.courseIds.includes(String(c.id))} onChange={e=>setOfferForm(f=>({...f,courseIds:e.target.checked?[...f.courseIds,String(c.id)]:f.courseIds.filter(id=>id!==String(c.id))}))} className="h-4 w-4 accent-amber-500"/><span className="text-sm">{c.title}</span></label>)}</div></div><div className="grid gap-5 sm:grid-cols-2"><Input label="Start Date & Time" type="datetime-local" value={offerForm.startAt} onChange={v=>setOfferForm(f=>({...f,startAt:v}))}/><Input label="End Date & Time" type="datetime-local" value={offerForm.endAt} onChange={v=>setOfferForm(f=>({...f,endAt:v}))}/></div><div className="grid gap-3 sm:grid-cols-3"><label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 p-4"><span className="text-sm font-bold">Active</span><input type="checkbox" checked={offerForm.isActive} onChange={e=>setOfferForm(f=>({...f,isActive:e.target.checked}))} className="h-5 w-5 accent-emerald-500"/></label><label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 p-4"><span className="text-sm font-bold">Show Home</span><input type="checkbox" checked={offerForm.showHome} onChange={e=>setOfferForm(f=>({...f,showHome:e.target.checked}))} className="h-5 w-5 accent-indigo-500"/></label><label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 p-4"><span className="text-sm font-bold">Show Dashboard</span><input type="checkbox" checked={offerForm.showDashboard} onChange={e=>setOfferForm(f=>({...f,showDashboard:e.target.checked}))} className="h-5 w-5 accent-indigo-500"/></label></div><div className="flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 pt-5"><button onClick={()=>setOfferModal(false)} className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold">Cancel</button><button onClick={()=>void saveOffer()} disabled={offerSaving} className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-black text-black">{offerSaving?"Saving...":"Save Offer"}</button></div></div></div></Modal>}

  {overviewModal && overviewCourse && <Modal onClose={()=>!overviewSaving&&setOverviewModal(false)} wide>
    <div className="overflow-hidden">
      {/* Premium overview header */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50/70 to-indigo-50/70 px-6 py-6 dark:border-white/10 dark:from-[#0b1222] dark:via-emerald-950/20 dark:to-indigo-950/20 sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl"/>
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl"/>

        <div className="relative flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
              {overviewCourse.thumbnail ? (
                <img src={overviewCourse.thumbnail} alt="" className="h-full w-full object-cover"/>
              ) : (
                <BookOpen className="text-emerald-500" size={28}/>
              )}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Course Overview</span>
                {overviewCourse.is_published && <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Published</span>}
              </div>
              <h3 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">{overviewCourse.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create the student-facing overview without changing your existing course content.</p>
            </div>
          </div>
          <button onClick={()=>setOverviewModal(false)} className="shrink-0 rounded-xl border border-slate-200 bg-white/80 p-2.5 text-slate-500 transition hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-slate-900 dark:hover:text-white"><X size={19}/></button>
        </div>
      </div>

      {/* Editor body */}
      <div className="grid max-h-[calc(92vh-145px)] overflow-y-auto lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <div className="space-y-6 p-6 sm:p-8">
          <section>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><BookOpen size={18}/></div>
              <div>
                <h4 className="font-black">Introduction</h4>
                <p className="text-xs text-slate-500">Give students a clear reason to start this course.</p>
              </div>
            </div>
            <Textarea
              label="Overview Introduction"
              value={overviewForm.overviewIntro}
              onChange={v=>setOverviewForm(f=>({...f,overviewIntro:v}))}
              placeholder="Example: Master Linux administration through practical labs, real-world commands and hands-on system management..."
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><Plus size={18}/></div>
                <div>
                  <h4 className="font-black">What You'll Learn</h4>
                  <p className="mt-1 text-xs text-slate-500">Add the outcomes students will achieve.</p>
                </div>
              </div>
              <button onClick={()=>addOverviewListItem("whatYouLearn")} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-500/10"><Plus size={14}/> Add</button>
            </div>
            <div className="mt-4 space-y-3">
              {overviewForm.whatYouLearn.map((item,index)=><div key={`learn-${index}`} className="group flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-black text-emerald-600 dark:text-emerald-300">{index+1}</span>
                <input value={item} onChange={e=>updateOverviewList("whatYouLearn",index,e.target.value)} placeholder={`Learning outcome ${index+1}`} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 dark:border-white/10 dark:bg-slate-950 dark:text-white"/>
                <button onClick={()=>removeOverviewListItem("whatYouLearn",index)} className="rounded-xl border border-transparent p-2.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:hover:border-red-500/20 dark:hover:bg-red-500/10"><Trash2 size={16}/></button>
              </div>)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"><Shield size={18}/></div>
                <div>
                  <h4 className="font-black">Requirements</h4>
                  <p className="mt-1 text-xs text-slate-500">Keep prerequisites short and easy to understand.</p>
                </div>
              </div>
              <button onClick={()=>addOverviewListItem("requirements")} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-black text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-500/20 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-500/10"><Plus size={14}/> Add</button>
            </div>
            <div className="mt-4 space-y-3">
              {overviewForm.requirements.map((item,index)=><div key={`req-${index}`} className="group flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-black text-indigo-600 dark:text-indigo-300">{index+1}</span>
                <input value={item} onChange={e=>updateOverviewList("requirements",index,e.target.value)} placeholder={`Requirement ${index+1}`} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 dark:border-white/10 dark:bg-slate-950 dark:text-white"/>
                <button onClick={()=>removeOverviewListItem("requirements",index)} className="rounded-xl border border-transparent p-2.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:hover:border-red-500/20 dark:hover:bg-red-500/10"><Trash2 size={16}/></button>
              </div>)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex items-center justify-between gap-3">
              <div><h4 className="font-black">Skills Covered</h4><p className="mt-1 text-xs text-slate-500">Skills shown in the student course overview.</p></div>
              <button type="button" onClick={addSkill} className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-black text-indigo-700 dark:border-indigo-500/20 dark:bg-slate-900 dark:text-indigo-300"><Plus size={14}/> Add Skill</button>
            </div>
            <div className="mt-4 space-y-3">
              {overviewForm.skillsCovered.map((item,index)=><div key={`skill-${index}`} className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-black text-indigo-600 dark:text-indigo-300">{index+1}</span>
                <input value={item} onChange={e=>updateSkill(index,e.target.value)} placeholder={`Skill ${index+1}`} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"/>
                <button type="button" onClick={()=>removeSkill(index)} className="rounded-xl p-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-500"><Trash2 size={16}/></button>
              </div>)}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-slate-950/40">
            <div className="flex items-center justify-between gap-3">
              <div><h4 className="font-black">Overview Feature Cards</h4><p className="mt-1 text-xs text-slate-500">Editable cards displayed below the course introduction.</p></div>
              <button type="button" onClick={addFeature} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-700 dark:border-emerald-500/20 dark:bg-slate-900 dark:text-emerald-300"><Plus size={14}/> Add Feature</button>
            </div>
            <div className="mt-4 space-y-4">
              {overviewForm.features.map((feature,index)=><div key={`feature-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40">
                <div className="grid gap-3 sm:grid-cols-[150px_1fr_auto]">
                  <label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Icon</span><select value={feature.icon} onChange={e=>updateFeature(index,"icon",e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-900 dark:text-white"><option value="BookOpen">Book</option><option value="PlayCircle">Play</option><option value="Award">Award</option><option value="TrendingUp">Trending</option></select></label>
                  <Input label="Title" value={feature.title} onChange={v=>updateFeature(index,"title",v)} placeholder="Feature title"/>
                  <button type="button" onClick={()=>removeFeature(index)} className="mt-6 rounded-xl p-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
                <div className="mt-3"><Textarea label="Description" value={feature.description} onChange={v=>updateFeature(index,"description",v)} placeholder="Short feature description"/></div>
              </div>)}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300"><Users size={18}/></div>
              <div>
                <h4 className="font-black">Target Audience</h4>
                <p className="text-xs text-slate-500">Describe who will benefit from this course.</p>
              </div>
            </div>
            <Textarea
              label="Who Is This Course For?"
              value={overviewForm.targetAudience}
              onChange={v=>setOverviewForm(f=>({...f,targetAudience:v}))}
              placeholder="Example: Students, beginners, IT professionals and career switchers..."
            />
          </section>
        </div>

        {/* Live preview */}
        <aside className="border-t border-slate-200 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-[#07101f]/80 sm:p-8 lg:border-l lg:border-t-0">
          <div className="sticky top-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">Live Preview</p>
                <h4 className="mt-1 text-lg font-black">Student Course Overview</h4>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:bg-slate-900">TEMPLATE</div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/20">
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-500/20 via-indigo-500/10 to-slate-100 dark:from-emerald-500/20 dark:via-indigo-500/10 dark:to-slate-950">
                {overviewCourse.thumbnail ? <img src={overviewCourse.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55"/> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-slate-900 dark:via-slate-900/20"/>
                <div className="absolute bottom-3 left-4 rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-black text-white">{overviewCourse.category || "IT & Tech"}</div>
              </div>

              <div className="p-5">
                <h5 className="text-xl font-black leading-tight">{overviewCourse.title}</h5>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{overviewForm.overviewIntro || "Your course introduction will appear here..."}</p>

                <div className="mt-5">
                  <p className="text-sm font-black">What you'll learn</p>
                  <div className="mt-3 space-y-2">
                    {overviewForm.whatYouLearn.filter(Boolean).slice(0,5).map((item,index)=><div key={`preview-learn-${index}`} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"/><span>{item}</span></div>)}
                    {!overviewForm.whatYouLearn.filter(Boolean).length && <p className="text-xs text-slate-400">Add learning outcomes to preview them here.</p>}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Requirements</p>
                    <p className="mt-1 text-xs font-bold">{overviewForm.requirements.filter(Boolean).length || 0} items</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Level</p>
                    <p className="mt-1 text-xs font-bold">{overviewCourse.level || "Beginner"}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">Who it's for</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{overviewForm.targetAudience || "Target audience will appear here."}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 dark:border-white/10 dark:bg-[#0b1222] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-xs text-slate-500"><span className="font-bold text-slate-700 dark:text-slate-300">Tip:</span> Keep outcomes practical and student-focused.</p>
        <div className="flex justify-end gap-3">
          <button onClick={()=>setOverviewModal(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-900">Cancel</button>
          <button onClick={()=>void saveOverview()} disabled={overviewSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60">{overviewSaving?"Saving...":"Save Overview"}</button>
        </div>
      </div>
    </div>
  </Modal>}

  {courseModal && <Modal onClose={()=>!courseSaving&&setCourseModal(false)}><div className="p-6"><div className="flex items-center justify-between"><div><h3 className="text-xl font-black">{editingCourseId?"Edit Course":"Add New Course"}</h3><p className="mt-1 text-xs text-slate-500">Course details and publishing settings.</p></div><button onClick={()=>setCourseModal(false)}><X/></button></div><div className="mt-6 space-y-5"><Input label="Course Title" value={courseForm.title} onChange={v=>setCourseForm(f=>({...f,title:v}))}/><Textarea label="Description" value={courseForm.description} onChange={v=>setCourseForm(f=>({...f,description:v}))}/><div className="grid gap-5 sm:grid-cols-2"><Input label="Category" value={courseForm.category} onChange={v=>setCourseForm(f=>({...f,category:v}))}/><label><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Level</span><select value={courseForm.level} onChange={e=>setCourseForm(f=>({...f,level:e.target.value}))} className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 px-4 py-3 text-sm"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div><div className="grid gap-5 sm:grid-cols-3"><Input label="Offer Price (₹)" type="number" value={courseForm.price} onChange={v=>setCourseForm(f=>({...f,price:v}))}/><Input label="Actual Price (₹)" type="number" value={courseForm.originalPrice} onChange={v=>setCourseForm(f=>({...f,originalPrice:v}))}/><Input label="Thumbnail URL" value={courseForm.thumbnail} onChange={v=>setCourseForm(f=>({...f,thumbnail:v}))}/></div><div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Offer Preview</p>{Number(courseForm.originalPrice) > Number(courseForm.price) && Number(courseForm.originalPrice) > 0 ? <div className="mt-2 flex flex-wrap items-center gap-2 text-sm"><span className="line-through text-slate-500">{money(Number(courseForm.originalPrice))}</span><span className="font-black text-emerald-300">{money(Number(courseForm.price))}</span><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300">{Math.round(((Number(courseForm.originalPrice) - Number(courseForm.price)) / Number(courseForm.originalPrice)) * 100)}% OFF</span><span className="text-slate-400">Save {money(Number(courseForm.originalPrice) - Number(courseForm.price))}</span></div> : <p className="mt-2 text-xs text-slate-500">Enter an actual price higher than the offer price to show the discount.</p>}</div><label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/50 p-4"><div><p className="font-bold">Publish Course</p><p className="text-xs text-slate-500">Published courses appear on the student catalog.</p></div><input type="checkbox" checked={courseForm.isPublished} onChange={e=>setCourseForm(f=>({...f,isPublished:e.target.checked}))} className="h-5 w-5 accent-indigo-500"/></label><div className="flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 pt-5"><button onClick={()=>setCourseModal(false)} className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold">Cancel</button><button onClick={()=>void saveCourse()} disabled={courseSaving} className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-black disabled:opacity-60">{courseSaving?"Saving...":"Save Course"}</button></div></div></div></Modal>}

  {contentCourse && <Modal onClose={closeContent} wide><div className="p-6"><div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-5"><div><div className="flex items-center gap-2"><span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-cyan-300">Course CMS</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${contentCourse.is_published?"bg-emerald-500/10 text-emerald-400":"bg-amber-500/10 text-amber-400"}`}>{contentCourse.is_published?"Published":"Draft"}</span></div><h3 className="mt-2 text-xl font-black">{contentCourse.title}</h3><p className="mt-1 text-xs text-slate-500">Course #{contentCourse.id}</p></div><button onClick={closeContent}><X/></button></div><div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/50 p-5"><div><p className="font-bold">Modules</p><p className="text-xs text-slate-500">Build Module → Lecture → Video → Quiz.</p></div><button onClick={openCreateModule} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold"><Plus size={16}/> Add Module</button></div><div className="mt-4 space-y-3">{modules.map(m=><div key={m.id} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 font-black text-indigo-400">{m.module_order}</div><div><h4 className="font-black">{m.title}</h4><p className="mt-1 text-xs text-slate-600">Module #{m.id}</p><p className="mt-2 text-sm text-slate-400">{m.description||"No description"}</p></div></div><div className="flex gap-2"><button onClick={()=>openEditModule(m)} className="rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-bold">Edit</button><button onClick={()=>void deleteModule(m)} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">Delete</button></div></div><div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-slate-200 dark:border-white/10 pt-4"><span className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300">{(lectures[m.id]||[]).length} lectures</span><div className="flex gap-2"><button onClick={()=>void loadLectures(m.id)} className="rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-bold">{expandedModule===m.id?"Refresh Lectures":"View Lectures"}</button><button onClick={()=>openCreateLecture(m)} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300"><Plus size={14}/> Add Lecture</button></div></div>{expandedModule===m.id&&<div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/50 p-3">{(lectures[m.id]||[]).map(l=><div key={l.id} className="rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{l.lecture_order}. {l.title}</p>{l.is_free&&<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">FREE</span>}</div><p className="mt-1 text-xs text-slate-500">{l.duration} min · {l.video_url?"Video URL added":"No video URL"}</p></div><div className="flex flex-wrap gap-2"><button onClick={()=>openEditLecture(m,l)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-bold"><Pencil size={12}/> Edit</button><button onClick={()=>void deleteLecture(m,l)} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">Delete</button><button onClick={()=>{setExpandedLecture(expandedLecture===l.id?null:l.id); if(expandedLecture!==l.id) void loadQuizzes(l.id)}} className="rounded-lg bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-300">{expandedLecture===l.id?"Hide Quiz":"Manage Quiz"}</button></div></div>{expandedLecture===l.id&&<div className="mt-3 border-t border-slate-200 dark:border-white/10 pt-3"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quiz Questions ({(quizzes[l.id]||[]).length})</p><button onClick={()=>openCreateQuiz(l)} className="inline-flex items-center gap-1 rounded-lg bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-300"><Plus size={12}/> Add Question</button></div><div className="space-y-2">{(quizzes[l.id]||[]).map(q=><div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{q.question}</p><div className="mt-2 flex flex-wrap gap-2">{q.options.map(o=><span key={o} className={`rounded-lg px-2 py-1 text-[11px] ${o===q.correct_answer?"bg-emerald-500/10 text-emerald-300":"bg-slate-900 text-slate-500"}`}>{o}</span>)}</div></div><div className="flex gap-2"><button onClick={()=>openEditQuiz(q)} className="rounded-lg border border-slate-200 dark:border-white/10 p-2"><Pencil size={12}/></button><button onClick={()=>void deleteQuiz(q)} className="rounded-lg bg-red-500/10 p-2 text-red-300"><Trash2 size={12}/></button></div></div></div>)}{!(quizzes[l.id]||[]).length&&<p className="py-4 text-center text-xs text-slate-600">No quiz questions yet.</p>}</div></div>}</div>)}{!(lectures[m.id]||[]).length&&<p className="py-6 text-center text-xs text-slate-600">No lectures yet.</p>}</div>}</div>)}{!modules.length&&<div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-white/10">No modules yet. Add the first module.</div>}</div></div></Modal>}

  {moduleModal && <Modal onClose={()=>!moduleSaving&&setModuleModal(false)}><div className="p-6"><div className="flex justify-between"><div><h3 className="text-xl font-black">{editingModuleId?"Edit Module":"Add Module"}</h3><p className="text-xs text-slate-500">Course structure.</p></div><button onClick={()=>setModuleModal(false)}><X/></button></div><div className="mt-6 space-y-5"><Input label="Module Title" value={moduleForm.title} onChange={v=>setModuleForm(f=>({...f,title:v}))}/><Textarea label="Description" value={moduleForm.description} onChange={v=>setModuleForm(f=>({...f,description:v}))}/><Input label="Module Order" type="number" value={moduleForm.moduleOrder} onChange={v=>setModuleForm(f=>({...f,moduleOrder:v}))}/><div className="flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 pt-5"><button onClick={()=>setModuleModal(false)} className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold">Cancel</button><button onClick={()=>void saveModule()} disabled={moduleSaving} className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-black">{moduleSaving?"Saving...":"Save Module"}</button></div></div></div></Modal>}

  {lectureModal && <Modal onClose={()=>!lectureSaving&&setLectureModal(false)}><div className="p-6"><div className="flex justify-between"><div><h3 className="text-xl font-black">{editingLectureId?"Edit Lecture":"Add Lecture"}</h3><p className="text-xs text-slate-500">Video and access settings.</p></div><button onClick={()=>setLectureModal(false)}><X/></button></div><div className="mt-6 space-y-5"><Input label="Lecture Title" value={lectureForm.title} onChange={v=>setLectureForm(f=>({...f,title:v}))}/><Textarea label="Description" value={lectureForm.description} onChange={v=>setLectureForm(f=>({...f,description:v}))}/><Input label="Video URL" value={lectureForm.videoUrl} onChange={v=>setLectureForm(f=>({...f,videoUrl:v}))} placeholder="https://..."/><div className="grid gap-5 sm:grid-cols-2"><Input label="Lecture Order" type="number" value={lectureForm.lectureOrder} onChange={v=>setLectureForm(f=>({...f,lectureOrder:v}))}/><Input label="Duration (minutes)" type="number" value={lectureForm.duration} onChange={v=>setLectureForm(f=>({...f,duration:v}))}/></div><label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950/50 p-4"><div><p className="font-bold">Free Lecture</p><p className="text-xs text-slate-500">First lecture is automatically free by backend.</p></div><input type="checkbox" checked={lectureForm.isFree} onChange={e=>setLectureForm(f=>({...f,isFree:e.target.checked}))} className="h-5 w-5 accent-indigo-500"/></label><div className="flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 pt-5"><button onClick={()=>setLectureModal(false)} className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold">Cancel</button><button onClick={()=>void saveLecture()} disabled={lectureSaving} className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-black">{lectureSaving?"Saving...":"Save Lecture"}</button></div></div></div></Modal>}

  {quizModal && <Modal onClose={()=>!quizSaving&&setQuizModal(false)}><div className="p-6"><div className="flex justify-between"><div><h3 className="text-xl font-black">{editingQuizId?"Edit Quiz Question":"Add Quiz Question"}</h3><p className="text-xs text-slate-500">Question, options and correct answer.</p></div><button onClick={()=>setQuizModal(false)}><X/></button></div><div className="mt-6 space-y-5"><Textarea label="Question" value={quizForm.question} onChange={v=>setQuizForm(f=>({...f,question:v}))}/>{quizForm.options.map((o,i)=><Input key={i} label={`Option ${i+1}`} value={o} onChange={v=>setQuizForm(f=>{const options=[...f.options]; options[i]=v; return {...f,options,correctAnswer:f.correctAnswer===o?v:f.correctAnswer};})}/>) }<label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Correct Answer</span><select value={quizForm.correctAnswer} onChange={e=>setQuizForm(f=>({...f,correctAnswer:e.target.value}))} className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-slate-950 px-4 py-3 text-sm"><option value="">Select correct option</option>{quizForm.options.filter(Boolean).map(o=><option key={o} value={o}>{o}</option>)}</select></label><div className="flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 pt-5"><button onClick={()=>setQuizModal(false)} className="rounded-xl border border-slate-200 dark:border-white/10 px-5 py-3 text-sm font-bold">Cancel</button><button onClick={()=>void saveQuiz()} disabled={quizSaving} className="rounded-xl bg-purple-500 px-6 py-3 text-sm font-black">{quizSaving?"Saving...":"Save Quiz"}</button></div></div></div></Modal>}
  </div>;
}
