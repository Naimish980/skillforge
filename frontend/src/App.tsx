import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  GraduationCap,
  Award,
  BarChart3,
  ReceiptText,
  Headphones,
  Flame,
  Clock3,
  PlayCircle,
  TrendingUp,
  Lock,
  Cloud,
  LogIn,
  LogOut,
  KeyRound,
  Mail,
  Menu,
  Network,
  Play,
  Search,
  Shield,
  Phone,
  UserCircle,
  UserPlus,
  X,
  Sun,
  Moon,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

type Course = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  category: string;
  level: string;
  modules: string[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type Lecture = {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  questions: QuizQuestion[];
};

type CourseModule = {
  id: string;
  title: string;
  duration: string;
  lectures: Lecture[];
};

const securityModules: CourseModule[] = [
  {
    id: "module-1",
    title: "Module 1 — Introduction",
    duration: "2h 17m",
    lectures: [
      {
        id: "lecture-1",
        title: "Introduction to me & the Course",
        duration: "23:39",
        videoUrl: "https://www.youtube.com/embed/GTlmZPjacWs?rel=0&modestbranding=1",
        questions: [
          {
            question: "According to the lecture, what happens to the attack surface as IoT devices increase?",
            options: ["It decreases", "It increases", "It disappears", "It stays exactly the same"],
            answer: 1,
            explanation: "The lecture explains that increasing IoT devices create more possible points that attackers can target, increasing the attack surface."
          },
          {
            question: "What is the first step described in the penetration-testing process?",
            options: ["Exploitation", "Information gathering about the target", "Deleting data", "Installing antivirus"],
            answer: 1,
            explanation: "The lecture describes information gathering first, followed by identifying a vulnerability, choosing an appropriate technique and exploitation."
          },
          {
            question: "What does ransomware typically do to a victim's data?",
            options: ["Backs it up", "Encrypts or locks it and demands payment", "Improves it", "Publishes it automatically"],
            answer: 1,
            explanation: "The lecture explains that ransomware encrypts or locks data and displays a ransom demand for unlocking/decryption."
          },
          {
            question: "How is malware described in the lecture?",
            options: ["A security policy", "Malicious code", "A backup device", "A network protocol"],
            answer: 1,
            explanation: "Malware is described as malicious code used to compromise or harm a system."
          },
          {
            question: "In the phishing example, what is the attacker trying to steal?",
            options: ["A monitor", "User credentials", "A printer", "A backup drive"],
            answer: 1,
            explanation: "The fake Netflix example shows a user being directed to a legitimate-looking page where entering credentials results in credential theft."
          },
          {
            question: "Which three principles form the CIA Triad?",
            options: ["Control, Internet, Access", "Confidentiality, Integrity, Availability", "Cybersecurity, Intelligence, Authentication", "Confidentiality, Internet, Authorization"],
            answer: 1,
            explanation: "The lecture identifies Confidentiality, Integrity and Availability as the three main cybersecurity pillars."
          },
          {
            question: "What does Integrity protect against?",
            options: ["Unauthorized modification of information", "All internet access", "Physical theft only", "Lack of user training"],
            answer: 0,
            explanation: "Integrity means protecting information from unauthorized modification so that it remains accurate and unchanged."
          },
          {
            question: "Which three elements are discussed for implementing cybersecurity in an organization?",
            options: ["Hardware, Software, Internet", "People, Process, Technology", "Server, Client, Router", "Data, Cloud, VPN"],
            answer: 1,
            explanation: "The lecture explains People, Process and Technology as the three elements used to improve an organization's security posture."
          },
          {
            question: "What is the initial purpose of containment during incident response?",
            options: ["Spread the malware faster", "Prevent the threat from causing further damage", "Delete every company system", "Share passwords"],
            answer: 1,
            explanation: "Containment is used to stop the malware/threat from spreading to other systems and causing further damage."
          },
          {
            question: "According to the lecture, how is cybersecurity best learned?",
            options: ["Only by watching videos", "Only by memorizing theory", "Through hands-on practice and execution", "Only by collecting certificates"],
            answer: 2,
            explanation: "The lecture emphasizes that cybersecurity is a skill developed over time through hands-on practice and execution, not video watching alone."
          }
        ]
      }
    ]
  }
];

const courses: Course[] = [
  {
    id: "linux",
    emoji: "🐧",
    title: "Linux Administration",
    description:
      "Learn Linux from fundamentals to administration with practical labs.",
    lessons: 24,
    duration: "5+ Hours",
    category: "IT & Tech",
    level: "Beginner",
    modules: [
      "Linux Fundamentals",
      "File System & Permissions",
      "Users & Groups",
      "Package Management",
      "Process Management",
      "Networking",
    ],
  },
  {
    id: "aws",
    emoji: "☁️",
    title: "AWS Cloud Fundamentals",
    description:
      "Understand AWS services, cloud concepts and real-world infrastructure.",
    lessons: 22,
    duration: "6+ Hours",
    category: "Cloud",
    level: "Beginner",
    modules: [
      "Introduction to AWS",
      "Understanding EC2",
      "Amazon S3 Basics",
      "IAM Fundamentals",
      "VPC Fundamentals",
      "CloudWatch",
    ],
  },
  {
    id: "networking",
    emoji: "🌐",
    title: "Networking Fundamentals",
    description:
      "Master networking concepts, protocols, troubleshooting and infrastructure.",
    lessons: 20,
    duration: "5+ Hours",
    category: "Networking",
    level: "Beginner",
    modules: [
      "Networking Basics",
      "OSI Model",
      "TCP/IP",
      "IP Addressing",
      "DNS & DHCP",
      "Network Troubleshooting",
    ],
  },
  {
    id: "windows",
    emoji: "🪟",
    title: "Windows Administration",
    description:
      "Learn Windows administration, troubleshooting and Active Directory.",
    lessons: 18,
    duration: "4+ Hours",
    category: "IT & Tech",
    level: "Intermediate",
    modules: [
      "Windows Administration",
      "Active Directory",
      "Group Policy",
      "User Management",
      "Windows Troubleshooting",
      "System Security",
    ],
  },
  {
    id: "security",
    emoji: "🛡️",
    title: "Cyber Security Essentials",
    description:
      "Learn security fundamentals, threats and practical security concepts.",
    lessons: 57,
    duration: "27+ Hours",
    category: "Cyber Security",
    level: "Beginner",
    modules: [
      "Module 1 — Introduction",
      "Module 2 — Linux & Python Fundamentals",
      "Module 3 — Foundations of Information Security",
      "Module 4 — Application Security and Penetration Testing",
      "Module 5/6 — Network Defense & Penetration Testing",
      "Module 7 — Data Protection and Cryptography",
      "Module 8 — Governance, Risk & Compliance",
      "Module 9 — Securing Emerging Technologies",
      "Module 10 — Security Operations Center",
      "Module 11 — RCA & Cyber Breach Investigation",
      "Module 12 — SIEM Architecture & Hands-On Splunk",
      "Module 13 — Job Ready Module",
    ],
  },
  {
    id: "sysadmin",
    emoji: "⚙️",
    title: "System Administration",
    description:
      "Build practical system administration skills for modern IT environments.",
    lessons: 21,
    duration: "5+ Hours",
    category: "IT & Tech",
    level: "Intermediate",
    modules: [
      "System Administration",
      "Server Management",
      "Monitoring",
      "Backup & Recovery",
      "Automation Basics",
      "Troubleshooting",
    ],
  },
];

const API_BASE_URL = "https://skillforge-backend-5qln.onrender.com";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
};

async function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) {
    return true;
  }

  return new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [learningCourse, setLearningCourse] = useState<Course | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [introOpen, setIntroOpen] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [homeLearningProgress, setHomeLearningProgress] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("skillforge-theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("skillforge-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const resetToken = new URLSearchParams(window.location.search).get("token");

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("skillforge_user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      // Remove old string-only login data from previous frontend versions.
      localStorage.removeItem("skillforge_user");
      return null;
    }
  });

  useEffect(() => {
    const loadEnrollments = async () => {
      if (!user) {
        setEnrolledCourseIds([]);
        return;
      }

      const token = localStorage.getItem("skillforge_token");
      if (!token) {
        setEnrolledCourseIds([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/payment/enrollments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          setEnrolledCourseIds([]);
          return;
        }

        const ids = Array.isArray(data.enrolledCourseIds)
          ? data.enrolledCourseIds.filter(
              (id: unknown): id is string => typeof id === "string",
            )
          : [];

        setEnrolledCourseIds(ids);
        localStorage.setItem(`skillforge_enrollments_${user.id}`, JSON.stringify(ids));
      } catch (error) {
        console.error("Enrollment loading error:", error);
        const stored = localStorage.getItem(`skillforge_enrollments_${user.id}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setEnrolledCourseIds(
              Array.isArray(parsed)
                ? parsed.filter((id) => typeof id === "string")
                : [],
            );
          } catch {
            setEnrolledCourseIds([]);
          }
        } else {
          setEnrolledCourseIds([]);
        }
      }
    };

    loadEnrollments();
  }, [user]);

  // Load real progress for the user's first enrolled course so the
  // homepage "Your Learning" card is never hard-coded to AWS/68%.
  useEffect(() => {
    const loadHomeLearningProgress = async () => {
      const token = localStorage.getItem("skillforge_token");
      const firstCourse = courses.find((course) =>
        enrolledCourseIds.includes(course.id),
      );

      if (!token || !firstCourse) {
        setHomeLearningProgress(0);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/progress/${encodeURIComponent(firstCourse.id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          setHomeLearningProgress(0);
          return;
        }

        const data = await response.json();
        const progress = Array.isArray(data.progress) ? data.progress : [];
        const completed = progress.filter(
          (item: { passed?: boolean }) => item.passed === true,
        ).length;

        setHomeLearningProgress(
          Math.min(
            100,
            Math.round((completed / Math.max(firstCourse.lessons, 1)) * 100),
          ),
        );
      } catch (error) {
        console.error("Homepage progress loading error:", error);
        setHomeLearningProgress(0);
      }
    };

    void loadHomeLearningProgress();
  }, [enrolledCourseIds]);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);

    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const openLogin = () => {
    setMenuOpen(false);
    setAuthMode("login");
  };

  const openSignup = () => {
    setMenuOpen(false);
    setAuthMode("signup");
  };

  const handleLogout = () => {
    localStorage.removeItem("skillforge_user");
    localStorage.removeItem("skillforge_token");
    setUser(null);
  };

  const handleAuth = (loggedInUser: User) => {
    localStorage.setItem("skillforge_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setAuthMode(null);
  };

  const openDashboard = () => {
    setMenuOpen(false);

    if (!user) {
      setAuthMode("login");
      return;
    }

    setSelectedCourse(null);
    setLearningCourse(null);
    setDashboardOpen(true);
    window.history.pushState({ dashboard: true }, "", "#dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePurchase = async (courseIds: string[]) => {
    const token = localStorage.getItem("skillforge_token");

    if (!user || !token) {
      setAuthMode("login");
      return;
    }

    const uniqueCourseIds = [...new Set(courseIds)];

    if (uniqueCourseIds.length !== 1 && uniqueCourseIds.length !== 2) {
      alert("Please select one course or exactly two courses.");
      return;
    }

    const alreadyEnrolled = uniqueCourseIds.filter((id) =>
      enrolledCourseIds.includes(id),
    );

    if (alreadyEnrolled.length > 0) {
      alert("You are already enrolled in one of the selected courses.");
      return;
    }

    try {
      setPaymentLoading(true);

      const razorpayReady = await loadRazorpayScript();

      if (!razorpayReady || !window.Razorpay) {
        alert("Unable to load Razorpay Checkout. Please try again.");
        return;
      }

      const type = uniqueCourseIds.length === 1 ? "course" : "combo";

      const createOrderResponse = await fetch(
        `${API_BASE_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            type === "course"
              ? { type, courseId: uniqueCourseIds[0] }
              : { type, courseIds: uniqueCourseIds },
          ),
        },
      );

      const orderData = await createOrderResponse.json();

      if (!createOrderResponse.ok || !orderData.success) {
        alert(orderData.message || "Unable to create payment order.");
        return;
      }

      await new Promise<void>((resolve) => {
        const razorpay = new window.Razorpay!({
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "SkillForge",
          description:
            type === "course"
              ? `${courses.find((course) => course.id === uniqueCourseIds[0])?.title ?? "Course"} - SkillForge`
              : "SkillForge 2 Course Combo",
          order_id: orderData.order.id,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone,
          },
          theme: {
            color: "#a3e635",
          },
          handler: async (paymentResponse) => {
            try {
              const verifyResponse = await fetch(
                `${API_BASE_URL}/api/payment/verify`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(paymentResponse),
                },
              );

              const verifyData = await verifyResponse.json();

              if (!verifyResponse.ok || !verifyData.success) {
                alert(
                  verifyData.message ||
                    "Payment was received but verification failed. Please contact SkillForge support.",
                );
                return;
              }

              const verifiedIds = Array.isArray(verifyData.enrolledCourseIds)
                ? verifyData.enrolledCourseIds.filter(
                    (id: unknown): id is string => typeof id === "string",
                  )
                : uniqueCourseIds;

              setEnrolledCourseIds((current) => {
                const merged = [...new Set([...current, ...verifiedIds])];
                localStorage.setItem(
                  `skillforge_enrollments_${user.id}`,
                  JSON.stringify(merged),
                );
                return merged;
              });

              alert(
                type === "course"
                  ? "Payment successful! Your course is now unlocked."
                  : "Payment successful! Both courses are now unlocked.",
              );
            } catch (error) {
              console.error("Payment verification error:", error);
              alert(
                "Payment verification could not be completed. Please contact SkillForge support.",
              );
            } finally {
              setPaymentLoading(false);
              resolve();
            }
          },
          modal: {
            ondismiss: () => {
              setPaymentLoading(false);
              resolve();
            },
          },
        });

        razorpay.open();
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Unable to start payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  const openLearning = (course: Course) => {
    if (!user || !enrolledCourseIds.includes(course.id)) {
      return;
    }

    window.history.pushState(
      { learningCourseId: course.id },
      "",
      `#learn=${encodeURIComponent(course.id)}`,
    );
    setDashboardOpen(false);
    setSelectedCourse(null);
    setLearningCourse(course);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCourse = (course: Course) => {
    window.history.pushState({ courseId: course.id }, "", `#course=${course.id}`);
    setDashboardOpen(false);
    setSelectedCourse(course);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash === "#dashboard") {
        setSelectedCourse(null);
        setLearningCourse(null);
        setDashboardOpen(true);
        return;
      }

      const learnMatch = window.location.hash.match(/^#learn=(.+)$/);
      if (learnMatch) {
        const learnCourse = courses.find(
          (item) => item.id === decodeURIComponent(learnMatch[1]),
        );
        setSelectedCourse(null);
        setLearningCourse(learnCourse ?? null);
        return;
      }

      const match = window.location.hash.match(/^#course=(.+)$/);
      const course = match
        ? courses.find((item) => item.id === decodeURIComponent(match[1]))
        : undefined;

      setLearningCourse(null);
      setDashboardOpen(false);
      setSelectedCourse(course ?? null);
    };

    handlePopState();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;

    const query = searchText.toLowerCase().trim();

    const matchesSearch =
      !query ||
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  if (window.location.pathname === "/reset-password") {
    return <ResetPasswordPage token={resetToken} />;
  }

  if (dashboardOpen) {
    return (
      <DashboardPage
        user={user}
        enrolledCourseIds={enrolledCourseIds}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
        onBack={() => {
          setDashboardOpen(false);
          setSelectedCourse(null);
          setLearningCourse(null);
          const cleanUrl = `${window.location.pathname}${window.location.search}`;
          window.history.replaceState(null, "", cleanUrl);
          window.scrollTo({ top: 0, behavior: "auto" });
        }}
        onCourse={openCourse}
        onLearn={openLearning}
        onLogout={handleLogout}
      />
    );
  }

  if (learningCourse) {
    return (
      <CoursePlayer
        course={learningCourse}
        onBack={() => {
          window.history.back();
        }}
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseDetails
        course={selectedCourse}
        user={user}
        enrolled={enrolledCourseIds.includes(selectedCourse.id)}
        enrolledCourseIds={enrolledCourseIds}
        paymentLoading={paymentLoading}
        onPurchase={handlePurchase}
        onBack={() => {
          if (window.history.state?.courseId) {
            window.history.back();
          } else {
            setSelectedCourse(null);
          }
        }}
        onStart={() => openLearning(selectedCourse)}
      />
    );
  }

  return (
    <>
      <style>{`
        html.dark body { background:#0b1120 !important; color:#e5e7eb !important; }
        html.dark { background:#0b1120 !important; color:#e5e7eb !important; }
        html.dark .bg-white,
        html.dark .bg-white\\/95,
        html.dark .bg-white\\/90,
        html.dark .bg-white\\/80 { background-color:#111827 !important; }
        html.dark .bg-slate-50 { background-color:#172033 !important; }
        html.dark .bg-slate-100 { background-color:#1f2937 !important; }
        html.dark .text-\\[\\#0b1736\\],
        html.dark .text-slate-900 { color:#f8fafc !important; }
        html.dark .text-slate-800 { color:#e5e7eb !important; }
        html.dark .text-slate-700,
        html.dark .text-slate-600 { color:#cbd5e1 !important; }
        html.dark .text-slate-500 { color:#94a3b8 !important; }
        html.dark .text-slate-400 { color:#64748b !important; }
        html.dark .border-slate-200,
        html.dark .border-slate-100 { border-color:#334155 !important; }
        html.dark .border-slate-200\\/80 { border-color:rgba(51,65,85,.8) !important; }
        html.dark .border-emerald-100 { border-color:rgba(16,185,129,.25) !important; }
        html.dark .bg-gradient-to-br.from-white { background-image:linear-gradient(to bottom right,#0f172a,#101b2e,#0f2a22) !important; }
        html.dark .bg-gradient-to-br.from-emerald-50 { background-image:linear-gradient(to bottom right,#0d2a23,#111827,#10243a) !important; }
        html.dark .bg-emerald-50 { background-color:rgba(16,185,129,.12) !important; }
        html.dark .bg-sky-50 { background-color:rgba(14,165,233,.10) !important; }
        html.dark .bg-amber-50 { background-color:rgba(245,158,11,.10) !important; }
        html.dark .bg-red-50 { background-color:rgba(239,68,68,.10) !important; }
        html.dark header { background-color:rgba(15,23,42,.94) !important; border-color:#334155 !important; }
        html.dark input,
        html.dark textarea,
        html.dark select { color:#f8fafc !important; background-color:#172033 !important; border-color:#334155 !important; }
        html.dark .shadow-sm,
        html.dark .shadow-2xl { box-shadow:0 10px 35px rgba(0,0,0,.28) !important; }
      `}</style>
      <div className="skillforge-light min-h-screen bg-[#f8fbfa] text-[#0b1736]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center gap-6 px-5 lg:px-8">
          <button onClick={() => scrollToSection("home")} className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-50 text-emerald-600">
              <BookOpen size={23} />
            </div>
            <div className="text-left">
              <div className="text-[22px] font-black tracking-tight text-[#0b1736]">Skill<span className="text-emerald-600">Forge</span></div>
              <div className="text-[8px] font-semibold uppercase tracking-[0.28em] text-slate-400">LEARN • PRACTICE • GROW</div>
            </div>
          </button>

          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
            <button onClick={() => scrollToSection("home")} className="relative py-7 text-sm font-bold text-emerald-600 after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-8 after:-translate-x-1/2 after:bg-emerald-500">Home</button>
            <button onClick={() => scrollToSection("courses")} className="py-7 text-sm font-medium text-slate-600 hover:text-emerald-600">Courses</button>
            <button onClick={() => scrollToSection("categories")} className="py-7 text-sm font-medium text-slate-600 hover:text-emerald-600">Categories</button>
            <button onClick={() => scrollToSection("projects")} className="py-7 text-sm font-medium text-slate-600 hover:text-emerald-600">Projects</button>
            <button onClick={() => scrollToSection("resources")} className="py-7 text-sm font-medium text-slate-600 hover:text-emerald-600">Resources</button>
            <button onClick={() => scrollToSection("pricing")} className="py-7 text-sm font-medium text-slate-600 hover:text-emerald-600">Pricing</button>
            <button onClick={() => scrollToSection("about")} className="py-7 text-sm font-medium text-slate-600 hover:text-emerald-600">About</button>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button onClick={() => setSearchOpen(true)} className="flex h-10 w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-left text-xs text-slate-400 hover:border-emerald-300">
              <Search size={17} /> Search for courses, skills...
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <>
                <button onClick={openDashboard} className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">Dashboard</button>
                <div className="group relative">
                  <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-emerald-300">
                    <UserCircle size={17} className="text-emerald-600" /> Hi, <span className="font-bold text-emerald-700">{user.name}</span>
                  </button>
                  <div className="pointer-events-none invisible absolute right-0 top-full z-[70] w-80 pt-3 opacity-0 transition-all group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><UserCircle size={23}/></div><div className="min-w-0"><p className="font-bold text-slate-900">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div></div>
                      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600"><div className="flex gap-2"><Mail size={15} className="text-emerald-600"/>{user.email}</div><div className="flex gap-2"><Phone size={15} className="text-emerald-600"/>+91 {user.phone}</div></div>
                      <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs"><p className="font-bold text-emerald-700">Need Help?</p><p className="mt-1 text-slate-500">snera980@gmail.com</p><p className="text-slate-500">+91 8960513302</p></div>
                      <button onClick={handleLogout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={15}/> Logout</button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button onClick={openLogin} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-300">Log in</button>
                <button onClick={openSignup} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700">Sign up</button>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="ml-auto rounded-xl p-2 text-slate-600 lg:hidden">{menuOpen ? <X size={25}/> : <Menu size={25}/>}</button>
        </div>
        {menuOpen && <div className="border-t border-slate-200 bg-white p-5 lg:hidden"><div className="flex flex-col gap-4 text-sm font-semibold text-slate-700"><button onClick={() => scrollToSection("home")} className="text-left text-emerald-600">Home</button><button onClick={() => scrollToSection("courses")} className="text-left">Courses</button><button onClick={() => scrollToSection("categories")} className="text-left">Categories</button><button onClick={() => scrollToSection("projects")} className="text-left">Projects</button><button onClick={() => scrollToSection("resources")} className="text-left">Resources</button><button onClick={() => scrollToSection("pricing")} className="text-left">Pricing</button><button onClick={() => scrollToSection("about")} className="text-left">About</button>{user ? <button onClick={openDashboard} className="text-left text-emerald-600">Dashboard</button> : <><button onClick={openLogin} className="text-left">Log in</button><button onClick={openSignup} className="rounded-xl bg-emerald-600 py-3 text-white">Sign up</button></>}</div></div>}
      </header>

      <main>
        <section id="home" className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-[#f8fffc] to-[#effbf6]">
          <div className="pointer-events-none absolute -left-32 top-0 h-[520px] w-[520px] rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="pointer-events-none absolute right-[24%] top-12 h-[430px] w-[430px] rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="mx-auto grid max-w-[1380px] items-center gap-8 px-5 py-10 lg:grid-cols-[1.05fr_1fr_0.95fr] lg:px-8 lg:py-12">
            <div className="relative z-10 lg:pb-5">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"><span>✨</span> Learn skills that matter</div>
              <h1 className="max-w-xl text-[48px] font-black leading-[1.03] tracking-[-0.045em] text-[#0b1736] sm:text-[60px]">Build Real <span className="text-emerald-600">Skills</span> for a Better Future.</h1>
              <p className="mt-6 max-w-xl text-[17px] leading-7 text-slate-500">Learn practical IT and technology skills through structured courses, hands-on projects and real-world practice.</p>
              <div className="mt-7 flex flex-wrap gap-3"><button onClick={() => scrollToSection("courses")} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700">Explore Courses <ArrowRight size={17}/></button><button onClick={() => setIntroOpen(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:border-emerald-300"><Play size={16} className="fill-emerald-500 text-emerald-500"/> Watch Intro</button></div>
            </div>

            <div className="relative hidden min-h-[390px] items-end justify-center lg:flex">
              <div className="absolute bottom-5 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100/70 blur-3xl" />
              <img src="/hero-student.png" alt="SkillForge student learning" className="relative z-10 h-[390px] w-auto object-contain drop-shadow-[0_25px_30px_rgba(15,23,42,0.12)]" />
              <div className="absolute left-2 top-24 z-20 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><TrendingUp size={18}/></div><div><p className="text-[11px] font-bold text-slate-900">Practical</p><p className="text-[11px] text-slate-500">Learning</p></div></div>
              <div className="absolute right-0 top-32 z-20 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Shield size={18}/></div><div><p className="text-[11px] font-bold text-slate-900">Industry</p><p className="text-[11px] text-slate-500">Relevant</p></div></div>
              <div className="absolute right-5 bottom-16 z-20 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><GraduationCap size={18}/></div><div><p className="text-[11px] font-bold text-slate-900">Career</p><p className="text-[11px] text-slate-500">Focused</p></div></div>
            </div>

            <div className="relative z-10 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_25px_70px_rgba(15,118,110,0.10)] lg:p-6">
              <div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">Your Learning</p><h2 className="mt-1 text-xl font-black text-[#0b1736]">Continue where you left off</h2></div><button onClick={openDashboard} className="hidden text-xs font-bold text-emerald-600 sm:block">View Dashboard →</button></div>
              {(() => {
                const currentCourse = courses.find((course) =>
                  enrolledCourseIds.includes(course.id),
                );

                if (!currentCourse) {
                  return (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
                      <p className="text-xs text-slate-500">Your Learning</p>
                      <h3 className="mt-1 text-sm font-black text-[#0b1736]">No course enrolled yet</h3>
                      <p className="mt-2 text-[11px] leading-5 text-slate-500">Purchase a course and your actual course progress will appear here.</p>
                      <button onClick={() => scrollToSection("courses")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700">Explore Courses <ArrowRight size={16}/></button>
                    </div>
                  );
                }

                const completedLessons = Math.round(
                  (homeLearningProgress / 100) * currentCourse.lessons,
                );

                return (
                  <>
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Current Course</p>
                          <h3 className="mt-1 truncate text-sm font-black text-[#0b1736]">{currentCourse.title}</h3>
                          <p className="mt-1 text-[10px] text-slate-400">{currentCourse.category} · {currentCourse.level}</p>
                        </div>
                        <span className="shrink-0 text-lg font-black text-emerald-600">{homeLearningProgress}%</span>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${homeLearningProgress}%` }} />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">{completedLessons} of {currentCourse.lessons} lessons completed</p>
                      <button onClick={() => openLearning(currentCourse)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700">Continue Learning <ArrowRight size={16}/></button>
                    </div>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#0b1736]">{currentCourse.title}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{homeLearningProgress === 0 ? "Not Started" : homeLearningProgress >= 100 ? "Completed" : "In Progress"}</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600">{homeLearningProgress}%</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          <div className="mx-auto grid max-w-[1300px] grid-cols-2 gap-3 px-5 pb-10 sm:grid-cols-4 lg:px-8"><Metric icon={<GraduationCap/>} value="10+" label="Courses"/><Metric icon={<Shield/>} value="100%" label="Practical Learning"/><Metric icon={<Clock3/>} value="24/7" label="Access"/><Metric icon={<Award/>} value="Certificate" label="On Completion"/></div>
        </section>

        <section id="categories" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 py-12 lg:px-8">
          <div className="mb-5 flex items-end justify-between"><div><h2 className="text-2xl font-black text-[#0b1736]">Explore Categories</h2><p className="mt-1 text-sm text-slate-500">Choose a learning path and build practical technical skills.</p></div><button onClick={() => {setSelectedCategory("All"); scrollToSection("courses")}} className="hidden items-center gap-2 text-sm font-bold text-emerald-600 sm:flex">View All <ArrowRight size={16}/></button></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {[
                { t: "Cloud Computing", c: "Cloud", i: <Cloud /> },
                { t: "Cyber Security", c: "Cyber Security", i: <Shield /> },
                { t: "Networking", c: "Networking", i: <Network /> },
                { t: "Linux", c: "IT & Tech", i: <span className="text-xl">🐧</span> },
                { t: "IT Support", c: "IT & Tech", i: <BookOpen /> },
                { t: "DevOps", c: "Cloud", i: <TrendingUp /> },
              ].map((item) => {
                const count = courses.filter(
                  (course) => course.category === item.c,
                ).length;

                return (
                  <button
                    key={item.t}
                    onClick={() => {
                      setSelectedCategory(item.c);
                      scrollToSection("courses");
                    }}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      {item.i}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0b1736]">{item.t}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {count} {count === 1 ? "Course" : "Courses"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
        </section>

        <section id="courses" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 pb-14 lg:px-8">
          <div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Popular Courses</p><h2 className="mt-2 text-3xl font-black text-[#0b1736]">Start Learning Today</h2><p className="mt-2 text-sm text-slate-500">Beginner-friendly courses focused on practical skills.</p></div><button onClick={() => setSelectedCategory("All")} className="hidden items-center gap-2 text-sm font-bold text-emerald-600 sm:flex">View All <ArrowRight size={16}/></button></div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredCourses.slice(0,8).map((course,index)=><Course key={course.id} course={course} onClick={() => openCourse(course)} badge={index===0?"Bestseller":index===1?"Most Popular":index===2?"Beginner Friendly":index===3?"New":undefined}/>)}</div>
        </section>

        <section id="projects" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 pb-14 lg:px-8"><div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]"><div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-7"><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Hands-on Projects</p><h2 className="mt-3 text-2xl font-black text-[#0b1736]">Build projects you can actually showcase.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Practice through guided labs, infrastructure exercises, troubleshooting tasks and portfolio-ready projects.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">AWS Labs</span><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">Linux Labs</span><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">Networking</span><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">Cyber Security</span></div></div><div id="resources" className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Resources</p><h3 className="mt-3 text-xl font-black text-[#0b1736]">Learn beyond the lectures.</h3><p className="mt-2 text-sm leading-6 text-slate-500">Notes, practice material, interview preparation and career resources.</p><button onClick={() => scrollToSection("about")} className="mt-5 text-sm font-bold text-emerald-600">Explore resources →</button></div></div></section>

        <section id="pricing" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 pb-14 lg:px-8"><div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Simple Pricing</p><h2 className="mt-2 text-3xl font-black text-[#0b1736]">Learn without subscriptions.</h2><p className="mt-2 max-w-xl text-sm text-slate-500">Individual courses are ₹799 and the 2-course combo is ₹1,499 with lifetime access.</p></div><div className="flex gap-3"><button onClick={() => scrollToSection("courses")} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Browse Courses</button><span className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">Lifetime Access</span></div></div></div></section>

        <section id="about" className="scroll-mt-24 border-t border-slate-100 bg-white"><div className="mx-auto grid max-w-[1380px] gap-8 px-5 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:px-8"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Why SkillForge?</p><h2 className="mt-3 text-3xl font-black text-[#0b1736]">A learning platform built around practical outcomes.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">Structured learning, hands-on projects, industry-relevant skills and lifetime access — with progress tracking, quizzes and certificates.</p></div><div className="grid gap-3 sm:grid-cols-2"><Why icon={<BookOpen/>} title="Structured Learning" text="Step-by-step learning paths"/><Why icon={<TrendingUp/>} title="Hands-on Projects" text="Real-world practical experience"/><Why icon={<Shield/>} title="Industry Relevant" text="Skills employers need"/><Why icon={<Award/>} title="Lifetime Access" text="Learn at your own pace"/></div></div></section>

        <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-[1380px] flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><div className="font-black text-slate-900">Skill<span className="text-emerald-600">Forge</span></div><p className="mt-1 text-xs">Learn • Practice • Grow</p></div><p>© 2026 SkillForge. All rights reserved.</p></div></footer>
      </main>

      {searchOpen && <Modal onClose={() => setSearchOpen(false)}><div className="w-full max-w-2xl"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-emerald-600">SkillForge Search</p><h2 className="mt-2 text-2xl font-black text-[#0b1736]">Find a course</h2></div><button onClick={() => setSearchOpen(false)} className="rounded-lg p-2 text-slate-400 hover:text-slate-900"><X/></button></div><div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4"><Search className="text-slate-400" size={20}/><input autoFocus value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search AWS, Linux, Networking..." className="w-full bg-transparent py-4 text-slate-900 outline-none placeholder:text-slate-400"/></div><div className="mt-5 max-h-80 space-y-2 overflow-y-auto">{filteredCourses.map(course=><button key={course.id} onClick={()=>{setSearchOpen(false);openCourse(course)}} className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-200 hover:bg-emerald-50"><span className="text-3xl">{course.emoji}</span><div><p className="font-bold text-slate-900">{course.title}</p><p className="mt-1 text-xs text-slate-500">{course.category} • {course.lessons} Lessons</p></div><ChevronRight className="ml-auto text-slate-400" size={18}/></button>)}{filteredCourses.length===0&&<p className="py-8 text-center text-slate-500">No matching courses.</p>}</div></div></Modal>}
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} onSuccess={handleAuth}/>} 
      {introOpen && <Modal onClose={() => setIntroOpen(false)}><div className="w-full max-w-2xl text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50"><Play className="fill-emerald-600 text-emerald-600" size={28}/></div><h2 className="mt-6 text-3xl font-black text-[#0b1736]">Welcome to SkillForge</h2><p className="mx-auto mt-4 max-w-lg text-slate-500">Practical IT and technology learning with structured lessons, hands-on projects, quizzes and certificates.</p><button onClick={()=>{setIntroOpen(false);scrollToSection("courses")}} className="mt-7 rounded-xl bg-emerald-600 px-7 py-3 font-bold text-white hover:bg-emerald-700">Explore Courses</button></div></Modal>}
      </div>
    </>
  );
}


/* ================= STUDENT DASHBOARD ================= */

function DashboardPage({
  user,
  enrolledCourseIds,
  darkMode,
  onToggleTheme,
  onBack,
  onCourse,
  onLearn,
  onLogout,
}: {
  user: User | null;
  enrolledCourseIds: string[];
  darkMode: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
  onCourse: (course: Course) => void;
  onLearn: (course: Course) => void;
  onLogout: () => void;
}) {
  const enrolledCourses = courses.filter((course) =>
    enrolledCourseIds.includes(course.id),
  );

  const [progressByCourse, setProgressByCourse] = useState<Record<string, number>>({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    const loadProgress = async () => {
      const token = localStorage.getItem("skillforge_token");
      if (!token || enrolledCourses.length === 0) {
        setProgressByCourse({});
        return;
      }

      setLoadingProgress(true);
      const next: Record<string, number> = {};

      await Promise.all(
        enrolledCourses.map(async (course) => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/progress/${encodeURIComponent(course.id)}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (!response.ok) return;
            const data = await response.json();
            const progress = Array.isArray(data.progress) ? data.progress : [];
            const completed = progress.filter(
              (item: { passed?: boolean }) => item.passed === true,
            ).length;
            next[course.id] = Math.min(
              100,
              Math.round((completed / Math.max(course.lessons, 1)) * 100),
            );
          } catch (error) {
            console.error(`Progress loading error for ${course.id}:`, error);
          }
        }),
      );

      setProgressByCourse(next);
      setLoadingProgress(false);
    };

    void loadProgress();
  }, [enrolledCourseIds]);

  const totalProgress = enrolledCourses.length
    ? Math.round(
        enrolledCourses.reduce(
          (sum, course) => sum + (progressByCourse[course.id] ?? 0),
          0,
        ) / enrolledCourses.length,
      )
    : 0;

  const completedCourses = enrolledCourses.filter(
    (course) => (progressByCourse[course.id] ?? 0) >= 100,
  ).length;

  const [activeTab, setActiveTab] = useState<"dashboard" | "courses" | "progress" | "certificates" | "purchases" | "support">("dashboard");

  return (
    <>
      <div className={`dashboard-shell min-h-screen transition-colors duration-300 ${darkMode ? "dashboard-dark bg-[#070b14] text-slate-100" : "bg-[#f7faf8] text-[#0b1736]"}`}>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${darkMode ? "border-[#263449] bg-[#0d1422]/95" : "border-slate-200 bg-white/95"}`}>
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 lg:px-8">
          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onBack();
            }}
            className="flex items-center gap-3"
            type="button"
            title="Back to Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen size={21} />
            </div>
            <div className="text-left">
              <div className="text-xl font-black">
                Skill<span className="text-emerald-600">Forge</span>
              </div>
              <div className={`flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.24em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                <ArrowLeft size={11} />
                Back to Home · Student Dashboard
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleTheme();
              }}
              onMouseDown={(event) => event.stopPropagation()}
              className={`relative z-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${darkMode ? "border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600"}`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className={`hidden rounded-full border px-4 py-2 text-sm font-semibold sm:block ${darkMode ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>
              Hi, <span className="text-emerald-600">{user?.name ?? "Student"}</span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1380px] gap-6 px-5 py-7 lg:grid-cols-[230px_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="px-3 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Learning
            </p>
            <DashboardNav darkMode={darkMode} icon={<LayoutDashboard size={17} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
            <DashboardNav darkMode={darkMode} icon={<BookOpen size={17} />} label="My Courses" active={activeTab === "courses"} onClick={() => setActiveTab("courses")} />
            <DashboardNav darkMode={darkMode} icon={<BarChart3 size={17} />} label="My Progress" active={activeTab === "progress"} onClick={() => setActiveTab("progress")} />
            <DashboardNav darkMode={darkMode} icon={<Award size={17} />} label="Certificates" active={activeTab === "certificates"} onClick={() => setActiveTab("certificates")} />
            <DashboardNav darkMode={darkMode} icon={<ReceiptText size={17} />} label="Purchase History" active={activeTab === "purchases"} onClick={() => setActiveTab("purchases")} />
            <DashboardNav darkMode={darkMode} icon={<Headphones size={17} />} label="Support" active={activeTab === "support"} onClick={() => setActiveTab("support")} />
          </div>
        </aside>

        <main>
          {activeTab === "dashboard" ? (
            <>
          <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">
                  Student Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                  Welcome back, {user?.name?.split(" ")[0] ?? "Student"}! 👋
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Continue your courses, track your progress and complete your next learning milestone.
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Flame size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Learning Streak</p>
                    <p className="text-lg font-black text-[#0b1736]">Keep going!</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <DashboardStat icon={<BookOpen />} value={String(enrolledCourses.length)} label="Enrolled Courses" />
            <DashboardStat icon={<BarChart3 />} value={`${totalProgress}%`} label="Overall Progress" />
            <DashboardStat icon={<CheckCircle2 />} value={String(completedCourses)} label="Completed Courses" />
            <DashboardStat icon={<Award />} value={String(completedCourses)} label="Certificates" />
          </section>

          <section className="mt-7">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                  Your Learning
                </p>
                <h2 className="mt-1 text-2xl font-black">My Courses</h2>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="hidden text-sm font-bold text-emerald-600 sm:block"
              >
                Browse Courses →
              </button>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <GraduationCap size={28} />
                </div>
                <h3 className="mt-4 text-xl font-black">No courses yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Purchase a course to start learning and your enrolled course will appear here.
                </p>
                <button
                  type="button"
                  onClick={onBack}
                  className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  Explore Courses
                </button>
              </div>
            ) : (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {enrolledCourses.map((course) => {
                  const progress = progressByCourse[course.id] ?? 0;
                  return (
                    <div
                      key={course.id}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-3xl">
                          {course.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                            {course.category}
                          </p>
                          <h3 className="mt-1 truncate text-lg font-black">{course.title}</h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {course.lessons} lessons · {course.duration}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-500">Course Progress</span>
                          <span className="font-black text-emerald-600">
                            {loadingProgress ? "…" : `${progress}%`}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onLearn(course)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                          <PlayCircle size={16} />
                          Continue Learning
                        </button>
                        <button
                          type="button"
                          onClick={() => onCourse(course)}
                          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-600"
                          title="View course"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-7 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Progress</p>
                  <h3 className="mt-1 text-lg font-black">Learning Overview</h3>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                <ProgressLine label="Courses enrolled" value={`${enrolledCourses.length}`} />
                <ProgressLine label="Overall completion" value={`${totalProgress}%`} />
                <ProgressLine label="Certificates earned" value={`${completedCourses}`} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Headphones size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Support</p>
                  <h3 className="mt-1 text-lg font-black">Need help?</h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                For course, account or payment support, contact the SkillForge support team.
              </p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-bold text-slate-800">Naimish Singh</p>
                <p className="mt-1 text-slate-500">snera980@gmail.com</p>
                <p className="text-slate-500">+91 8960513302</p>
              </div>
            </div>
          </section>
            </>
          ) : (
            <DashboardTabContent
              activeTab={activeTab}
              enrolledCourses={enrolledCourses}
              progressByCourse={progressByCourse}
              totalProgress={totalProgress}
              completedCourses={completedCourses}
              loadingProgress={loadingProgress}
              onBack={onBack}
              onLearn={onLearn}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>
      </div>
    </>
  );
}

function DashboardTabContent({
  activeTab,
  enrolledCourses,
  progressByCourse,
  totalProgress,
  completedCourses,
  loadingProgress,
  onBack,
  onLearn,
  setActiveTab,
}: {
  activeTab: "courses" | "progress" | "certificates" | "purchases" | "support";
  enrolledCourses: Course[];
  progressByCourse: Record<string, number>;
  totalProgress: number;
  completedCourses: number;
  loadingProgress: boolean;
  onBack: () => void;
  onLearn: (course: Course) => void;
  setActiveTab: (tab: "dashboard" | "courses" | "progress" | "certificates" | "purchases" | "support") => void;
}) {
  const heading: Record<typeof activeTab, string> = {
    courses: "My Courses",
    progress: "My Progress",
    certificates: "Certificates",
    purchases: "Purchase History",
    support: "Support",
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Student Area</p>
          <h1 className="mt-2 text-3xl font-black">{heading[activeTab]}</h1>
          <p className="mt-2 text-sm text-slate-500">This section is connected to your SkillForge account.</p>
        </div>
        <button type="button" onClick={() => setActiveTab("dashboard")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-700">← Dashboard</button>
      </div>

      {activeTab === "courses" && (
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {enrolledCourses.length === 0 ? (
            <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 p-10 text-center">
              <GraduationCap className="mx-auto text-emerald-600" size={32} />
              <h3 className="mt-3 font-black">No courses yet</h3>
              <p className="mt-2 text-sm text-slate-500">Purchase a course and it will appear here automatically.</p>
              <button type="button" onClick={onBack} className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">Explore Courses</button>
            </div>
          ) : enrolledCourses.map(course => (
            <div key={course.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-2xl">{course.emoji}</div><div><h3 className="font-black">{course.title}</h3><p className="text-xs text-slate-500">{course.lessons} lessons · {course.duration}</p></div></div>
              <button type="button" onClick={() => onLearn(course)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700"><PlayCircle size={16}/> Continue Learning</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "progress" && (
        <div className="mt-7">
          <div className="grid gap-4 sm:grid-cols-3"><DashboardStat icon={<BookOpen/>} value={String(enrolledCourses.length)} label="Courses"/><DashboardStat icon={<BarChart3/>} value={`${totalProgress}%`} label="Overall Progress"/><DashboardStat icon={<CheckCircle2/>} value={String(completedCourses)} label="Completed"/></div>
          <div className="mt-6 space-y-4">{enrolledCourses.length === 0 ? <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">Enroll in a course to see your progress.</p> : enrolledCourses.map(course => { const progress = progressByCourse[course.id] ?? 0; return <div key={course.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex justify-between gap-4"><h3 className="font-black">{course.title}</h3><span className="font-black text-emerald-600">{loadingProgress ? "…" : `${progress}%`}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{width: `${progress}%`}}/></div></div>; })}</div>
        </div>
      )}

      {activeTab === "certificates" && (
        <div className="mt-7">{completedCourses === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center"><Award className="mx-auto text-emerald-600" size={32}/><h3 className="mt-3 font-black">No certificates yet</h3><p className="mt-2 text-sm text-slate-500">Complete a course to unlock its SkillForge certificate.</p></div> : <div className="grid gap-5 md:grid-cols-2">{enrolledCourses.filter(c => (progressByCourse[c.id] ?? 0) >= 100).map(course => <div key={course.id} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><Award className="text-emerald-600"/><h3 className="mt-3 font-black">{course.title}</h3><p className="mt-1 text-sm text-slate-500">Course completed successfully.</p><button type="button" onClick={() => alert("Certificate generator will be connected here.")} className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-700">View Certificate</button></div>)}</div>}</div>
      )}

      {activeTab === "purchases" && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">{enrolledCourses.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No purchases yet.</p> : enrolledCourses.map(course => <div key={course.id} className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-0"><div className="flex items-center gap-3"><span className="text-2xl">{course.emoji}</span><div><p className="font-bold">{course.title}</p><p className="text-xs text-slate-500">Lifetime access</p></div></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Purchased</span></div>)}</div>
      )}

      {activeTab === "support" && (
        <div className="mt-7 grid gap-5 md:grid-cols-2"><a href="mailto:snera980@gmail.com" className="rounded-2xl border border-slate-200 p-6 hover:border-emerald-300"><Mail className="text-emerald-600"/><h3 className="mt-3 font-black">Email Support</h3><p className="mt-1 text-sm text-slate-500">snera980@gmail.com</p></a><a href="tel:+918960513302" className="rounded-2xl border border-slate-200 p-6 hover:border-emerald-300"><Phone className="text-emerald-600"/><h3 className="mt-3 font-black">Call Support</h3><p className="mt-1 text-sm text-slate-500">+91 8960513302</p></a></div>
      )}
    </section>
  );
}

function DashboardNav({
  icon,
  label,
  active = false,
  onClick,
  darkMode = false,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  darkMode?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
        active
          ? darkMode
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-emerald-50 text-emerald-700"
          : darkMode
            ? "text-slate-400 hover:bg-[#172033] hover:text-slate-100"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DashboardStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl font-black text-[#0b1736]">{value}</p>
          <p className="truncate text-[10px] font-medium text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ProgressLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-sm font-black text-emerald-600">{value}</span>
    </div>
  );
}

/* ================= COURSE DETAILS ================= */

function CourseDetails({
  course,
  user,
  enrolled,
  enrolledCourseIds,
  paymentLoading,
  onPurchase,
  onBack,
  onStart,
}: {
  course: Course;
  user: User | null;
  enrolled: boolean;
  enrolledCourseIds: string[];
  paymentLoading: boolean;
  onPurchase: (courseIds: string[]) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const [comboCourseId, setComboCourseId] = useState("");

  const comboOptions = courses.filter(
    (item) => item.id !== course.id && !enrolledCourseIds.includes(item.id),
  );

  const comboSelected = Boolean(comboCourseId);

  return (
    <div className="skillforge-light min-h-screen bg-[#f7faf8] text-slate-900">
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 transition hover:text-lime-400"
          >
            <ArrowLeft size={18} />
            Back to Courses
          </button>

          <div className="text-xl font-black">
            Skill<span className="text-lime-400">Forge</span>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-lime-400/10 blur-[130px]" />

          <div className="relative mx-auto max-w-6xl px-6 py-20">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                <span className="rounded-full border border-lime-400/20 bg-lime-400/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-lime-400">
                  {course.category}
                </span>

                <div className="mt-7 text-7xl">{course.emoji}</div>

                <h1 className="mt-6 text-4xl font-black sm:text-6xl">
                  {course.title}
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
                  {course.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400">
                    {course.lessons} Lessons
                  </span>
                  <span className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400">
                    {course.duration}
                  </span>
                  <span className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400">
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-lime-400/20 bg-[#070907] p-7 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-lime-400">
                  {enrolled ? "Course Unlocked" : "Course Access"}
                </p>

                {enrolled ? (
                  <>
                    <div className="mt-5 flex items-end justify-between">
                      <span className="text-4xl font-black">0%</span>
                      <span className="text-sm text-lime-400">Enrolled</span>
                    </div>

                    <div className="mt-5 h-2 rounded-full bg-white/5">
                      <div className="h-full w-0 rounded-full bg-lime-400" />
                    </div>

                    <button
                      onClick={onStart}
                      className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 py-4 font-bold text-black transition hover:bg-lime-300"
                    >
                      <Play size={18} />
                      Start Learning
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mt-5 flex items-end justify-between">
                      <span className="text-3xl font-black">₹799</span>
                      <span className="text-sm text-gray-500">One-time</span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                      Purchase this course to unlock its learning content.
                    </p>

                    <button
                      onClick={() => onPurchase([course.id])}
                      disabled={paymentLoading || !user}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 py-4 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CreditCard size={18} />
                      {paymentLoading ? "Processing..." : user ? "Buy Course — ₹799" : "Login to Purchase"}
                    </button>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-400">
                        2 Course Combo
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Select another course and get both for ₹1,499.
                      </p>

                      <select
                        value={comboCourseId}
                        onChange={(e) => setComboCourseId(e.target.value)}
                        disabled={paymentLoading || !user || comboOptions.length === 0}
                        className="mt-4 w-full rounded-xl border border-white/10 bg-[#0b0e0b] px-4 py-3 text-sm text-white outline-none focus:border-lime-400/50 disabled:opacity-50"
                      >
                        <option value="">Choose second course</option>
                        {comboOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.emoji} {item.title}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => onPurchase([course.id, comboCourseId])}
                        disabled={paymentLoading || !user || !comboSelected}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-lime-400/30 py-3 font-bold text-lime-300 transition hover:bg-lime-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <CreditCard size={17} />
                        Buy Combo — ₹1,499
                      </button>
                    </div>
                  </>
                )}

                {!user && !enrolled && (
                  <p className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                    <Lock size={13} /> Login is required for secure course access.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
            Course Content
          </p>

          <h2 className="mt-3 text-3xl font-black">What you'll learn</h2>

          <div className="mt-8 space-y-3">
            {course.modules.map((module, index) => (
              <button
                key={module}
                onClick={enrolled ? onStart : () => onPurchase([course.id])}
                className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:border-lime-400/30 hover:bg-lime-400/[0.03]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-400/10 text-sm font-bold text-lime-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-semibold">{module}</span>
                <ChevronRight size={18} className="ml-auto text-gray-600" />
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ================= COURSE PLAYER ================= */

const R2_LECTURE_1_URL = "https://pub-edfa7b2fb8204f23bd7d5a9f86bc0ca0.r2.dev/cyber-security/Module%201%20%E2%80%94%20Introduction/lecture-1.mp4";

function SkillForgeVideoPlayer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (playing) {
      hideTimerRef.current = window.setTimeout(() => setControlsVisible(false), 2200);
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
    showControls();
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    showControls();
  };

  const toggleFullscreen = async () => {
    const container = playerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await container.requestFullscreen();
    }
  };

  const formatTime = (value: number) => {
    if (!Number.isFinite(value)) return "00:00";
    const total = Math.floor(value);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div
      ref={playerRef}
      className="group relative aspect-video overflow-hidden bg-black select-none"
      onMouseMove={showControls}
      onMouseEnter={showControls}
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        if (event.target === event.currentTarget) void togglePlay();
      }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain bg-black"
        src={src}
        playsInline
        preload="metadata"
        controls={false}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => { setPlaying(true); showControls(); }}
        onPause={() => { setPlaying(false); setControlsVisible(true); }}
        onEnded={() => { setPlaying(false); setControlsVisible(true); }}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setMuted(event.currentTarget.muted);
        }}
        onClick={() => void togglePlay()}
        onDoubleClick={() => void toggleFullscreen()}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/80" />

      <div className={`pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
        <div className="rounded-xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">SkillForge</p>
          <p className="mt-0.5 max-w-[70vw] truncate text-sm font-semibold text-white">{title}</p>
        </div>
        <div className="rounded-full border border-lime-400/20 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-lime-300 backdrop-blur-md">
          Lecture 1
        </div>
      </div>

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-lime-300/50 bg-lime-400 text-black shadow-[0_0_45px_rgba(163,230,53,0.25)] transition hover:scale-105 hover:bg-lime-300 sm:h-24 sm:w-24"
        >
          <Play size={34} fill="currentColor" className="ml-1" />
        </button>
      )}

      <div className={`absolute inset-x-0 bottom-0 z-20 px-3 pb-3 transition-opacity duration-300 sm:px-5 sm:pb-5 ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
        <input
          aria-label="Video progress"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (videoRef.current) videoRef.current.currentTime = value;
            setCurrentTime(value);
            showControls();
          }}
          className="mb-3 h-1.5 w-full cursor-pointer accent-lime-400"
        />

        <div className="flex items-center gap-2 text-white sm:gap-3">
          <button type="button" onClick={() => seekBy(-10)} className="rounded-lg p-2 transition hover:bg-white/10" title="Back 10 seconds">
            <span className="text-xs font-black">↶10</span>
          </button>
          <button type="button" onClick={togglePlay} className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-black transition hover:bg-lime-300" aria-label={playing ? "Pause" : "Play"}>
            {playing ? <span className="text-sm font-black">Ⅱ</span> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
          <button type="button" onClick={() => seekBy(10)} className="rounded-lg p-2 transition hover:bg-white/10" title="Forward 10 seconds">
            <span className="text-xs font-black">10↷</span>
          </button>

          <span className="hidden text-xs font-semibold tabular-nums text-gray-300 sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const nextMuted = !muted;
                if (videoRef.current) videoRef.current.muted = nextMuted;
                setMuted(nextMuted);
                showControls();
              }}
              className="rounded-lg p-2 transition hover:bg-white/10"
              title={muted ? "Unmute" : "Mute"}
            >
              <span className="text-sm">{muted || volume === 0 ? "🔇" : "🔊"}</span>
            </button>
            <input
              aria-label="Volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (videoRef.current) {
                  videoRef.current.volume = value;
                  videoRef.current.muted = value === 0;
                }
                setVolume(value);
                setMuted(value === 0);
                showControls();
              }}
              className="hidden w-20 cursor-pointer accent-lime-400 sm:block"
            />

            <div className="relative">
              <button type="button" onClick={() => setShowSpeed((value) => !value)} className="rounded-lg px-2 py-2 text-xs font-bold transition hover:bg-white/10" title="Playback speed">
                {speed}x
              </button>
              {showSpeed && (
                <div className="absolute bottom-11 right-0 w-28 overflow-hidden rounded-xl border border-white/10 bg-[#0b0f0b]/95 p-1 shadow-2xl backdrop-blur-xl">
                  {[0.75, 1, 1.25, 1.5, 1.75, 2].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        if (videoRef.current) videoRef.current.playbackRate = value;
                        setSpeed(value);
                        setShowSpeed(false);
                        showControls();
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${speed === value ? "bg-lime-400 text-black" : "text-gray-300 hover:bg-white/10 hover:text-white"}`}
                    >
                      {value}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" onClick={toggleFullscreen} className="rounded-lg p-2 text-lg transition hover:bg-white/10" title="Fullscreen">
              {isFullscreen ? "⛶" : "⛶"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoursePlayer({
  course,
  onBack,
}: {
  course: Course;
  onBack: () => void;
}) {
  const modules = course.id === "security" ? securityModules : [];
  const lecture = modules[0]?.lectures[0];
  const progressKey = `skillforge_lecture_progress_${course.id}_${lecture?.id ?? ""}`;
  const [videoMarkedComplete, setVideoMarkedComplete] = useState(() =>
    localStorage.getItem(`${progressKey}_video`) === "true",
  );
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!lecture) {
    return (
      <div className="min-h-screen bg-[#030603] text-white">
        <header className="border-b border-white/10 bg-[#030603]/95">
          <div className="mx-auto flex h-20 max-w-7xl items-center px-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-lime-400">
              <ArrowLeft size={18} /> Back to Course
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Lock className="mx-auto text-gray-600" size={48} />
          <h1 className="mt-5 text-3xl font-black">Lecture content coming soon</h1>
          <p className="mt-3 text-gray-500">This course player will be populated as each lecture video is added.</p>
        </main>
      </div>
    );
  }

  const submitQuiz = () => {
    const total = lecture.questions.length;
    let currentScore = 0;
    lecture.questions.forEach((question, index) => {
      if (answers[index] === question.answer) currentScore += 1;
    });
    setScore(currentScore);
    setSubmitted(true);
    localStorage.setItem(`${progressKey}_quiz_score`, String(currentScore));
    localStorage.setItem(`${progressKey}_quiz_completed`, "true");
    if (currentScore >= Math.ceil(total * 0.7)) {
      localStorage.setItem(`${progressKey}_complete`, "true");
    }
  };

  const passed = submitted && score >= Math.ceil(lecture.questions.length * 0.7);

  return (
    <div className="min-h-screen bg-[#030603] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030603]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 transition hover:text-lime-400">
            <ArrowLeft size={18} /> Back to Course
          </button>
          <div className="text-xl font-black">Skill<span className="text-lime-400">Forge</span></div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">Cyber Security Essentials</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Module 1 — Introduction</h1>
          <p className="mt-2 text-gray-500">Lecture 1 · {lecture.title} · {lecture.duration}</p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#070907] shadow-2xl">
          <SkillForgeVideoPlayer
            src={lecture.id === "lecture-1" ? R2_LECTURE_1_URL : lecture.videoUrl}
            title={lecture.title}
          />
          <div className="flex flex-col gap-4 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">Finish the lecture before attempting the quiz.</p>
              <p className="mt-1 text-sm text-gray-500">After watching, confirm the lecture is complete to unlock the questions.</p>
            </div>
            <button
              onClick={() => {
                setVideoMarkedComplete(true);
                localStorage.setItem(`${progressKey}_video`, "true");
                setQuizStarted(true);
              }}
              className={`rounded-xl px-6 py-3 font-bold transition ${videoMarkedComplete ? "border border-lime-400/30 bg-lime-400/10 text-lime-300" : "bg-lime-400 text-black hover:bg-lime-300"}`}
            >
              {videoMarkedComplete ? "✓ Lecture Completed" : "I've Watched — Start Quiz"}
            </button>
          </div>
        </section>

        {videoMarkedComplete && quizStarted && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-[#070907] p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">Lecture Assessment</p>
                <h2 className="mt-2 text-2xl font-black">Test your understanding</h2>
              </div>
              <span className="rounded-full border border-lime-400/20 bg-lime-400/5 px-4 py-2 text-xs font-bold text-lime-300">Pass: 7 / 10</span>
            </div>

            <div className="mt-8 space-y-6">
              {lecture.questions.map((question, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="font-bold leading-7"><span className="mr-2 text-lime-400">Q{index + 1}.</span>{question.question}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => {
                      const selected = answers[index] === optionIndex;
                      const correct = submitted && optionIndex === question.answer;
                      const wrong = submitted && selected && optionIndex !== question.answer;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => !submitted && setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                          className={`rounded-xl border p-4 text-left text-sm transition ${
                            correct
                              ? "border-lime-400/60 bg-lime-400/10 text-lime-200"
                              : wrong
                                ? "border-red-400/40 bg-red-400/5 text-red-200"
                                : selected
                                  ? "border-lime-400/40 bg-lime-400/5 text-white"
                                  : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-lime-400/30 hover:text-white"
                          }`}
                        >
                          <span className="mr-3 font-bold text-gray-600">{String.fromCharCode(65 + optionIndex)}.</span>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <p className="mt-4 rounded-xl border border-white/5 bg-black/20 p-3 text-sm leading-6 text-gray-400">
                      <span className="font-semibold text-lime-300">Explanation:</span> {question.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {!submitted ? (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(answers).length !== lecture.questions.length}
                className="mt-8 w-full rounded-xl bg-lime-400 py-4 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit Quiz
              </button>
            ) : (
              <div className={`mt-8 rounded-2xl border p-6 text-center ${passed ? "border-lime-400/30 bg-lime-400/5" : "border-red-400/20 bg-red-400/5"}`}>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Your Score</p>
                <p className={`mt-2 text-5xl font-black ${passed ? "text-lime-400" : "text-red-300"}`}>{score}/10</p>
                <p className="mt-3 font-semibold">{passed ? "🎉 Passed — Lecture 2 can be unlocked." : "❌ Not passed — Please retry the quiz."}</p>
                {passed ? (
                  <button
                    onClick={onBack}
                    className="mt-5 rounded-xl bg-lime-400 px-6 py-3 font-bold text-black hover:bg-lime-300"
                  >
                    Back to Course
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                      setScore(0);
                    }}
                    className="mt-5 rounded-xl border border-white/10 px-6 py-3 font-bold text-white hover:border-lime-400/30 hover:text-lime-300"
                  >
                    Retry Quiz
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

/* ================= AUTH ================= */

function AuthModal({
  mode,
  onClose,
  onModeChange,
  onSuccess,
}: {
  mode: "login" | "signup" | "forgot";
  onClose: () => void;
  onModeChange: (mode: "login" | "signup" | "forgot") => void;
  onSuccess: (user: User) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/auth/forgot-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
            }),
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || "Unable to send reset email.");
          return;
        }

        setError("");
        alert(
          "If an account exists with this email, a password reset link has been sent. Please check your inbox.",
        );
        onModeChange("login");
      } catch (error) {
        console.error("Forgot password error:", error);
        setError("Unable to connect to SkillForge server. Please try again.");
      } finally {
        setLoading(false);
      }

      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (mode === "signup" && !phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (mode === "signup") {
      const phoneRegex = /^[6-9]\d{9}$/;

      if (!phoneRegex.test(phone.trim())) {
        setError("Please enter a valid 10-digit Indian mobile number.");
        return;
      }
    }

    try {
      setLoading(true);

      const endpoint =
        mode === "login"
          ? `${API_BASE_URL}/api/auth/login`
          : `${API_BASE_URL}/api/auth/register`;

      const requestBody =
        mode === "login"
          ? {
              email: email.trim().toLowerCase(),
              password,
            }
          : {
              name: name.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      // ==========================================
      // LOGIN SUCCESS
      // ==========================================

      if (mode === "login") {
        localStorage.setItem("skillforge_token", data.token);

        onSuccess({
          id: Number(data.user.id),
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
        });

        return;
      }

      // ==========================================
      // SIGNUP SUCCESS
      // ==========================================

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");

      setError("");

      alert(
        "Account created successfully! Please login with your email and password.",
      );

      onModeChange("login");
    } catch (error) {
      console.error("Authentication error:", error);

      setError(
        "Unable to connect to SkillForge server. Make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md">
        {/* ==========================================
            ICON
        ========================================== */}

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400/10">
            {mode === "login" ? (
              <LogIn className="text-lime-400" />
            ) : mode === "signup" ? (
              <UserPlus className="text-lime-400" />
            ) : (
              <KeyRound className="text-lime-400" />
            )}
          </div>

          <h2 className="mt-5 text-3xl font-black">
            {mode === "login"
              ? "Welcome Back"
              : mode === "signup"
                ? "Create Account"
                : "Forgot Password"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {mode === "login"
              ? "Continue your learning journey."
              : mode === "signup"
                ? "Create your SkillForge account and start learning."
                : "Enter your email and we’ll send you a secure reset link."}
          </p>
        </div>

        {/* ==========================================
            FORM
        ========================================== */}

        <form onSubmit={submit} className="mt-7 space-y-4">
          {/* NAME - SIGNUP ONLY */}

          {mode === "signup" && (
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-lime-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-lime-400/50 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* PHONE - SIGNUP ONLY */}

          {mode === "signup" && (
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Mobile Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");

                  if (value.length <= 10) {
                    setPhone(value);
                  }
                }}
                placeholder="10-digit mobile number"
                maxLength={10}
                disabled={loading}
                autoComplete="tel"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-lime-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <p className="mt-2 text-xs text-gray-600">
                Example: 9876543210
              </p>
            </div>
          )}

          {/* PASSWORD */}

          {mode !== "forgot" && (
          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-lime-400/50 disabled:cursor-not-allowed disabled:opacity-50"
            />

            {mode === "signup" && (
              <p className="mt-2 text-xs text-gray-600">
                Password must contain at least 8 characters.
              </p>
            )}
          </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-6 text-red-300">
              {error}
            </div>
          )}

          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-lime-400 py-3.5 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : mode === "signup"
                  ? "Creating Account..."
                  : "Sending Reset Link..."
              : mode === "login"
                ? "Login"
                : mode === "signup"
                  ? "Create Account"
                  : "Send Reset Link"}
          </button>
        </form>

        {/* ==========================================
            SWITCH LOGIN / SIGNUP
        ========================================== */}

        <div className="mt-6 text-center text-sm text-gray-500">
          {mode === "login" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setPassword("");
                  onModeChange("forgot");
                }}
                className="font-semibold text-lime-400 hover:text-lime-300"
              >
                Forgot Password?
              </button>

              <div className="mt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setPassword("");
                    onModeChange("signup");
                  }}
                  className="font-semibold text-lime-400 hover:text-lime-300"
                >
                  Create one
                </button>
              </div>
            </>
          ) : mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setPassword("");
                  onModeChange("login");
                }}
                className="font-semibold text-lime-400 hover:text-lime-300"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setEmail("");
                  onModeChange("login");
                }}
                className="font-semibold text-lime-400 hover:text-lime-300"
              >
                Back to Login
              </button>
            </>
          )}
        </div>

        {/* SECURITY MESSAGE */}

        <p className="mt-5 text-center text-xs text-gray-700">
          Your account is securely handled by the SkillForge backend.
        </p>
      </div>
    </Modal>
  );
}
/* ================= RESET PASSWORD ================= */

function ResetPasswordPage({ token }: { token: string | null }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This password reset link is invalid or incomplete.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to reset password.");
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Unable to connect to SkillForge server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030603] text-white">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-400/10 blur-[150px]" />

        <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#080a08] p-7 shadow-2xl sm:p-9">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-400/10">
              <KeyRound className="text-lime-400" />
            </div>

            <h1 className="mt-5 text-3xl font-black">
              {success ? "Password Updated" : "Reset Password"}
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {success
                ? "Your SkillForge password has been changed successfully."
                : "Create a new password for your SkillForge account."}
            </p>
          </div>

          {success ? (
            <button
              onClick={() => {
                window.history.replaceState({}, "", "/");
                window.location.href = "/";
              }}
              className="mt-7 w-full rounded-xl bg-lime-400 py-3.5 font-bold text-black transition hover:bg-lime-300"
            >
              Go to Login
            </button>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading || !token}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-lime-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading || !token}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-lime-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-6 text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full rounded-xl bg-lime-400 py-3.5 font-bold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="w-full rounded-xl border border-white/10 py-3 text-sm font-semibold text-gray-300 transition hover:border-lime-400/30 hover:text-lime-400"
              >
                Back to SkillForge
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-gray-700">
            Reset links expire automatically for your account security.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= MODAL ================= */

function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-white/10 bg-[#080a08] p-7 shadow-2xl sm:p-9">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
        >
          <X size={20} />
        </button>

        {children}
      </div>
    </div>
  );
}

/* ================= COURSE CARD ================= */

function Course({
  course,
  onClick,
  badge,
}: {
  course: Course;
  onClick: () => void;
  badge?: string;
}) {
  const covers: Record<string,string> = {
    aws: "from-slate-950 via-cyan-950 to-emerald-900",
    security: "from-slate-950 via-indigo-950 to-emerald-900",
    linux: "from-amber-500 via-yellow-700 to-slate-900",
    networking: "from-blue-900 via-cyan-800 to-slate-950",
    windows: "from-blue-700 via-cyan-700 to-indigo-900",
    sysadmin: "from-slate-900 via-emerald-900 to-slate-950",
  };
  return (
    <button onClick={onClick} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <div className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${covers[course.id] ?? "from-slate-900 to-emerald-900"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.25),transparent_42%)]" />
        {badge && <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-sm">{badge}</span>}
        <span className="relative text-7xl drop-shadow-lg transition duration-300 group-hover:scale-110">{course.emoji}</span>
      </div>
      <div className="p-4">
        <h3 className="text-base font-black text-[#0b1736]">{course.title}</h3>
        <p className="mt-2 min-h-[44px] text-xs leading-5 text-slate-500">{course.description}</p>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500"><span>▣ {course.lessons} Lessons</span><span>◷ {course.duration}</span></div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-500"><span>★</span><span className="text-slate-500">4.8 (120)</span></div>
        <div className="mt-4 flex items-center justify-between"><span className="text-xl font-black text-[#0b1736]">₹799</span><span className="flex items-center gap-2 rounded-xl border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">View Course <ArrowRight size={14}/></span></div>
      </div>
    </button>
  );
}


function Metric({icon,value,label}:{icon:ReactNode;value:string;label:string}){return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">{icon}</div><div><p className="text-lg font-black text-[#0b1736]">{value}</p><p className="text-[10px] text-slate-500">{label}</p></div></div>}
function Why({icon,title,text}:{icon:ReactNode;title:string;text:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">{icon}</div><div><p className="text-xs font-black text-[#0b1736]">{title}</p><p className="mt-1 text-[10px] text-slate-500">{text}</p></div></div></div>}

export default App;