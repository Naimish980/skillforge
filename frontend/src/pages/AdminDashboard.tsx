import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  CreditCard,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

type AdminData = {
  id: number;
  name: string;
  email: string;
};

type DashboardStats = {
  students: number;
  enrollments: number;
  successfulPayments: number;
  revenue: number;
};

type DashboardResponse = {
  success: boolean;
  message?: string;
  admin?: AdminData;
  stats?: DashboardStats;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://skillforge-backend-5qln.onrender.com";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("skillforge_token");

      if (!token) {
        setError("Admin login token not found.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data: DashboardResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load admin dashboard",
        );
      }

      setAdmin(data.admin || null);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Admin dashboard error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />

          <p className="text-slate-400">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <ShieldCheck className="h-7 w-7 text-red-400" />
          </div>

          <h2 className="text-xl font-semibold">
            Admin Dashboard Error
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                SkillForge Admin
              </h1>

              <p className="text-xs text-slate-400">
                Administration Dashboard
              </p>
            </div>
          </div>

          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <section className="mb-8">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-900 p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    ADMIN ACCESS
                  </span>
                </div>

                <h2 className="text-2xl font-bold">
                  Welcome, {admin?.name || "Admin"} 👋
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {admin?.email}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3">
                <GraduationCap className="h-5 w-5 text-indigo-400" />

                <div>
                  <p className="text-xs text-slate-500">
                    Platform
                  </p>

                  <p className="text-sm font-semibold">
                    SkillForge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Students */}
          <div className="group rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-indigo-400/30 hover:bg-slate-900/80">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Total Students
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {stats?.students ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-500/10 p-3">
                <Users className="h-6 w-6 text-indigo-400" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5" />
              Registered students
            </div>
          </div>

          {/* Enrollments */}
          <div className="group rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-cyan-400/30 hover:bg-slate-900/80">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Total Enrollments
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {stats?.enrollments ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-cyan-500/10 p-3">
                <BookOpen className="h-6 w-6 text-cyan-400" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <BookOpen className="h-3.5 w-3.5" />
              Course enrollments
            </div>
          </div>

          {/* Payments */}
          <div className="group rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-emerald-400/30 hover:bg-slate-900/80">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Successful Payments
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {stats?.successfulPayments ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-500/10 p-3">
                <CreditCard className="h-6 w-6 text-emerald-400" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" />
              Completed payments
            </div>
          </div>

          {/* Revenue */}
          <div className="group rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-amber-400/30 hover:bg-slate-900/80">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Total Revenue
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {formatRevenue(stats?.revenue ?? 0)}
                </p>
              </div>

              <div className="rounded-xl bg-amber-500/10 p-3">
                <IndianRupee className="h-6 w-6 text-amber-400" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <IndianRupee className="h-3.5 w-3.5" />
              Successful payment revenue
            </div>
          </div>
        </section>

        {/* Management cards */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              More admin modules will be added here.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <Users className="h-7 w-7 text-indigo-400" />

              <h3 className="mt-4 font-semibold">
                Students
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View registered students and their course
                activity.
              </p>

              <span className="mt-4 inline-block rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                Coming next
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <BookOpen className="h-7 w-7 text-cyan-400" />

              <h3 className="mt-4 font-semibold">
                Courses
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create courses, modules, lectures, quizzes
                and resources.
              </p>

              <span className="mt-4 inline-block rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                Coming next
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <CreditCard className="h-7 w-7 text-emerald-400" />

              <h3 className="mt-4 font-semibold">
                Payments
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View Razorpay payments, orders and
                transactions.
              </p>

              <span className="mt-4 inline-block rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                Coming next
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}