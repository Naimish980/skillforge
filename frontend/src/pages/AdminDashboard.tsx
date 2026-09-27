import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Mail,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Users,
  Wallet,
} from "lucide-react";

const API_BASE_URL = "https://skillforge-backend-5qln.onrender.com";

type DashboardStats = {
  students: number;
  enrollments: number;
  successfulPayments: number;
  revenue: number;
};

type AdminInfo = {
  id: number;
  name: string;
  email: string;
};

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  enrollment_count: number;
  enrolled_course_ids: string[];
};

type View = "dashboard" | "students";

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getToken() {
  return localStorage.getItem("skillforge_token");
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconClassName,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-4 text-3xl font-black tracking-tight text-white">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [view, setView] = useState<View>("dashboard");
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    const token = getToken();

    if (!token) {
      setError("Admin authentication token is missing.");
      setLoadingDashboard(false);
      return;
    }

    try {
      setLoadingDashboard(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load admin dashboard.");
      }

      setAdmin(data.admin ?? null);
      setStats(data.stats ?? null);
    } catch (err) {
      console.error("Admin dashboard loading error:", err);
      setError(err instanceof Error ? err.message : "Unable to load admin dashboard.");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const loadStudents = async () => {
    const token = getToken();

    if (!token) {
      setError("Admin authentication token is missing.");
      return;
    }

    try {
      setLoadingStudents(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/admin/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load students.");
      }

      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (err) {
      console.error("Admin students loading error:", err);
      setError(err instanceof Error ? err.message : "Unable to load students.");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (view === "students") {
      void loadStudents();
    }
  }, [view]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) =>
      [student.name, student.email, student.phone, String(student.id)]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [students, search]);

  const refreshCurrentView = () => {
    if (view === "students") {
      void loadStudents();
      void loadDashboard();
      return;
    }

    void loadDashboard();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[92px] max-w-[1210px] items-center justify-between gap-5 px-5 lg:px-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400">
              <Shield size={25} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">SkillForge Admin</h1>
              <p className="text-xs text-slate-500">Administration Dashboard</p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshCurrentView}
            disabled={loadingDashboard || loadingStudents}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loadingDashboard || loadingStudents ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1210px] px-5 py-9 lg:px-0">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {view === "dashboard" ? (
          <>
            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#10182d] to-[#0b1325] p-6 shadow-2xl shadow-black/10 sm:p-7">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Admin Access
                  </span>
                  <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                    Welcome, {admin?.name || "Admin"} <span>👋</span>
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {admin?.email || "Loading administrator details..."}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-4">
                  <BookOpen className="text-indigo-400" size={22} />
                  <div>
                    <p className="text-xs text-slate-500">Platform</p>
                    <p className="font-bold text-white">SkillForge</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Students"
                value={stats?.students ?? 0}
                description="Registered students"
                icon={<Users size={23} />}
                iconClassName="bg-indigo-500/10 text-indigo-400"
              />
              <StatCard
                title="Total Enrollments"
                value={stats?.enrollments ?? 0}
                description="Course enrollments"
                icon={<BookOpen size={23} />}
                iconClassName="bg-cyan-500/10 text-cyan-400"
              />
              <StatCard
                title="Successful Payments"
                value={stats?.successfulPayments ?? 0}
                description="Completed payments"
                icon={<CreditCard size={23} />}
                iconClassName="bg-emerald-500/10 text-emerald-400"
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats?.revenue ?? 0)}
                description="Successful payment revenue"
                icon={<Wallet size={23} />}
                iconClassName="bg-amber-500/10 text-amber-400"
              />
            </section>

            <section className="mt-10">
              <h3 className="text-xl font-black">Management</h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage the core SkillForge platform from one place.
              </p>

              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setView("students")}
                  className="group rounded-2xl border border-white/10 bg-slate-900 p-6 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-slate-800/80"
                >
                  <Users className="text-indigo-400" size={27} />
                  <h4 className="mt-5 text-lg font-black">Students</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    View registered students and their course activity.
                  </p>
                  <span className="mt-5 inline-flex rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300">
                    Manage Students →
                  </span>
                </button>

                <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
                  <BookOpen className="text-cyan-400" size={27} />
                  <h4 className="mt-5 text-lg font-black">Courses</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Create courses, modules, lectures, quizzes and resources.
                  </p>
                  <span className="mt-5 inline-flex rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-500">
                    Coming next
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
                  <CreditCard className="text-emerald-400" size={27} />
                  <h4 className="mt-5 text-lg font-black">Payments</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    View Razorpay payments, orders and transactions.
                  </p>
                  <span className="mt-5 inline-flex rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-500">
                    Coming next
                  </span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <button
                  type="button"
                  onClick={() => setView("dashboard")}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
                >
                  <ArrowLeft size={17} /> Back to Dashboard
                </button>
                <h2 className="text-3xl font-black">Students</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Registered SkillForge students and their enrollment activity.
                </p>
              </div>

              <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5">
                <Search size={18} className="shrink-0 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="font-bold text-white">All Students</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {filteredStudents.length} student{filteredStudents.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadStudents}
                  disabled={loadingStudents}
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  title="Refresh students"
                >
                  <RefreshCw size={16} className={loadingStudents ? "animate-spin" : ""} />
                </button>
              </div>

              {loadingStudents ? (
                <div className="flex min-h-64 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
                    <p className="mt-3 text-sm text-slate-500">Loading students...</p>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex min-h-64 items-center justify-center px-6 text-center">
                  <div>
                    <Users className="mx-auto text-slate-700" size={40} />
                    <p className="mt-4 font-semibold text-slate-300">No students found</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Try a different search term.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-5 transition hover:bg-slate-800/40"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-lg font-black text-indigo-400">
                            {student.name?.charAt(0).toUpperCase() || "S"}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-white">{student.name}</h4>
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                Student
                              </span>
                            </div>

                            <div className="mt-2 flex flex-col gap-1.5 text-sm text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-5">
                              <span className="inline-flex items-center gap-1.5">
                                <Mail size={14} /> {student.email}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Smartphone size={14} /> {student.phone || "—"}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} /> Joined {formatDate(student.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[360px]">
                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Student ID
                            </p>
                            <p className="mt-1 font-bold text-slate-200">#{student.id}</p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Enrollments
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 font-bold text-slate-200">
                              <BookOpen size={14} className="text-cyan-400" />
                              {student.enrollment_count}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Status
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 font-bold text-emerald-400">
                              <CheckCircle2 size={14} /> Active
                            </p>
                          </div>
                        </div>
                      </div>

                      {student.enrolled_course_ids.length > 0 && (
                        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Enrolled Course IDs
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {student.enrolled_course_ids.map((courseId) => (
                              <span
                                key={`${student.id}-${courseId}`}
                                className="rounded-lg border border-indigo-400/10 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-300"
                              >
                                {courseId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
