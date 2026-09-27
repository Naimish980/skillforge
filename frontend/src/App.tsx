import { useEffect, useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
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
import AdminDashboard from "./pages/AdminDashboard";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

type Course = {
  id: string;
  dbId?: number;
  emoji: string;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  category: string;
  level: string;
  modules: string[];
  price: number;
  thumbnail?: string | null;
  isPublished?: boolean;
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type LectureResource = {
  title: string;
  url: string;
};

type Lecture = {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  questions: QuizQuestion[];
  resources?: LectureResource[];
  isFree?: boolean;
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
        ],
        resources: []
      },
      {
        id: "lecture-2",
        title: "Different CyberSecurity Job Profiles",
        duration: "36:46",
        videoUrl: "https://pub-edfa7b2fb8204f23bd7d5a9f86bc0ca0.r2.dev/cyber-security/Module%201%20%E2%80%94%20Introduction/lecture%202.mp4",
        questions: [
          {
            question: "What does a Computer Forensic Analyst specialize in?",
            options: [
              "Designing secure network systems and frameworks",
              "Recovering and investigating material found in digital devices",
              "Managing an organization's compliance with regulations",
              "Coordinating response efforts during cyber incidents"
            ],
            answer: 1,
            explanation: "The lecture describes a Computer Forensic Analyst, also called a digital forensics examiner, as specializing in the recovery and investigation of material found in digital devices."
          },
          {
            question: "In which contexts does the lecture say the Computer Forensic Analyst role is crucial?",
            options: [
              "Only software development and testing",
              "Legal contexts, corporate investigations, and cybersecurity incident response",
              "Only cloud migration projects",
              "Only network performance monitoring"
            ],
            answer: 1,
            explanation: "The lecture specifically connects computer forensics with legal contexts, corporate investigations, and cybersecurity incident response."
          },
          {
            question: "What is a key responsibility of a GRC Analyst?",
            options: [
              "Dissecting malicious software",
              "Designing secure network systems",
              "Ensuring policies and procedures align with regulations and managing risks",
              "Recovering deleted files from digital devices"
            ],
            answer: 2,
            explanation: "The GRC Analyst slide describes the role as ensuring policies and procedures align with regulations, managing risks, and maintaining compliance with standards and legal requirements."
          },
          {
            question: "Which activity is associated with an Incident Responder in the lecture?",
            options: [
              "Investigating breaches and coordinating response efforts",
              "Creating legal testimony from forensic findings only",
              "Writing application source code",
              "Managing employee payroll systems"
            ],
            answer: 0,
            explanation: "The lecture states that an Incident Responder handles and mitigates cyber incidents by investigating breaches and coordinating response efforts."
          },
          {
            question: "What does a Security Architect focus on according to the lecture?",
            options: [
              "Designing secure network systems and developing security policies and frameworks",
              "Recovering evidence from digital devices",
              "Analyzing only financial transactions",
              "Creating reports for marketing campaigns"
            ],
            answer: 0,
            explanation: "The lecture describes a Security Architect as someone who designs secure network systems and develops security policies and frameworks."
          },
          {
            question: "What is the main focus of a Malware Analyst?",
            options: [
              "Managing regulatory compliance",
              "Studying and dissecting malicious software to understand its behavior, origin, and impact",
              "Designing corporate networks",
              "Providing general IT help-desk support"
            ],
            answer: 1,
            explanation: "The lecture explains that a Malware Analyst studies and dissects malicious software to understand its behavior, origin, and impact, and to develop detection and removal methods."
          },
          {
            question: "Which activity is specifically mentioned under digital forensics documentation?",
            options: [
              "Maintaining detailed records of findings and processes to ensure evidence integrity",
              "Deleting all investigation records after an incident",
              "Replacing evidence with screenshots only",
              "Publishing passwords in the final report"
            ],
            answer: 0,
            explanation: "The lecture's digital forensics material identifies documentation as maintaining detailed records of findings and processes to ensure evidence integrity."
          },
          {
            question: "What is one purpose of reporting in the forensic role described in the lecture?",
            options: [
              "Creating comprehensive reports for legal proceedings, internal investigations, or regulatory compliance",
              "Removing all evidence from the investigation",
              "Designing wireless networks",
              "Writing malware samples"
            ],
            answer: 0,
            explanation: "The lecture states that reporting can involve creating comprehensive reports for legal proceedings, internal investigations, or regulatory compliance."
          },
          {
            question: "What does the lecture identify as one area where forensic analysts may provide expert testimony?",
            options: [
              "Court proceedings about the methods and findings of forensic analysis",
              "Software sales meetings",
              "Product advertising campaigns",
              "Routine hardware procurement"
            ],
            answer: 0,
            explanation: "The lecture lists legal testimony as providing expert testimony in court about the methods and findings of forensic analysis."
          },
          {
            question: "Which of the following is listed as another cybersecurity job role in the lecture?",
            options: [
              "Malware Analyst",
              "Graphic Designer",
              "Database Sales Manager",
              "Content Editor"
            ],
            answer: 0,
            explanation: "The lecture's section on other cybersecurity job roles includes Malware Analyst along with roles such as Incident Responder and Security Architect."
          }
        ],
        resources: [
          {
            title: "NIST NICE Cybersecurity Workforce Framework",
            url: "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center"
          },
          {
            title: "CISA Cybersecurity Career Resources",
            url: "https://www.cisa.gov/careers"
          },
          {
            title: "Cybersecurity Job Role Notes — SkillForge",
            url: "https://www.nist.gov/itl/applied-cybersecurity/nice"
          }
        ]
      }
    ]
  }
];

const getLocalCompletedLessons = (courseId: string): number => {
  if (typeof window === "undefined") return 0;

  const moduleLectures =
    courseId === "security"
      ? securityModules.flatMap((module) => module.lectures)
      : [];

  return moduleLectures.filter((lecture) => {
    const key = `skillforge_lecture_progress_${courseId}_${lecture.id}`;
    return (
      localStorage.getItem(`${key}_video`) === "true" ||
      localStorage.getItem(`${key}_complete`) === "true"
    );
  }).length;
};

const getLocalCourseProgress = (course: Course): number => {
  const completed = getLocalCompletedLessons(course.id);
  return Math.min(
    100,
    Math.round((completed / Math.max(course.lessons, 1)) * 100),
  );
};

let courses: Course[] = [
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
    price: 799,
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
    price: 799,
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
    price: 799,
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
    price: 799,
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
    price: 799,
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
    price: 799,
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


function AdminRoute() {
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");
  const [message, setMessage] = useState("Checking admin access...");

  useEffect(() => {
    let cancelled = false;

    const verifyAdminAccess = async () => {
      const token = localStorage.getItem("skillforge_token");

      if (!token) {
        if (!cancelled) {
          setStatus("denied");
          setMessage("Please log in with your SkillForge admin account.");
        }
        return;
      }

      try {
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

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          if (!cancelled) {
            setStatus("denied");
            setMessage(
              data?.message === "Admin access required"
                ? "Access denied. This area is only available to administrators."
                : data?.message || "Unable to verify admin access.",
            );
          }
          return;
        }

        if (!cancelled) {
          setStatus("allowed");
        }
      } catch (error) {
        console.error("Admin access verification error:", error);

        if (!cancelled) {
          setStatus("denied");
          setMessage("Unable to connect to the admin service. Please try again.");
        }
      }
    };

    void verifyAdminAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
          <p className="mt-4 text-sm text-slate-400">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-7 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Shield size={27} />
          </div>

          <h1 className="mt-5 text-2xl font-bold">Admin Access Required</h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-200"
          >
            Back to SkillForge
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
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
  const introHistoryRef = useRef(false);

  const openIntro = () => {
    if (introOpen) return;
    window.history.pushState({ skillforgeIntro: true }, "", window.location.href);
    introHistoryRef.current = true;
    setIntroOpen(true);
  };

  const closeIntro = () => {
    if (introHistoryRef.current && window.history.state?.skillforgeIntro) {
      introHistoryRef.current = false;
      window.history.back();
      return;
    }
    introHistoryRef.current = false;
    setIntroOpen(false);
  };

  useEffect(() => {
    const handleIntroBack = () => {
      if (!introHistoryRef.current) return;
      introHistoryRef.current = false;
      setIntroOpen(false);
    };

    window.addEventListener("popstate", handleIntroBack);
    return () => window.removeEventListener("popstate", handleIntroBack);
  }, []);
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

  const [catalogCourses, setCatalogCourses] = useState<Course[]>(courses);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadCourseCatalog = async () => {
      try {
        setCatalogLoading(true);

        const response = await fetch(`${API_BASE_URL}/api/admin/public-courses`);
        const data = await response.json();

        if (!response.ok || !data.success || !Array.isArray(data.courses)) {
          throw new Error(data?.message || "Unable to load course catalog");
        }

        const mappedCourses: Course[] = data.courses
          .filter((item: { isPublished?: boolean }) => item.isPublished === true)
          .map((item: {
            id: string;
            dbId?: number;
            emoji?: string;
            title: string;
            description?: string;
            lessons?: number;
            duration?: string;
            category?: string;
            level?: string;
            modules?: string[];
            price?: number;
            thumbnail?: string | null;
            isPublished?: boolean;
          }) => ({
            id: String(item.id),
            dbId: Number(item.dbId) || undefined,
            emoji: item.emoji || "📚",
            title: String(item.title),
            description: item.description || "Practical, structured learning from SkillForge.",
            lessons: Number(item.lessons) || 0,
            duration: item.duration || "Self-paced",
            category: item.category || "IT & Tech",
            level: item.level || "Beginner",
            modules: Array.isArray(item.modules)
              ? item.modules.map((module) => String(module))
              : [],
            price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
            thumbnail: item.thumbnail || null,
            isPublished: Boolean(item.isPublished),
          }));

        if (!cancelled && mappedCourses.length > 0) {
          courses = mappedCourses;
          setCatalogCourses(mappedCourses);
        }
      } catch (error) {
        console.error("Course catalog loading error:", error);

        if (!cancelled) {
          setCatalogCourses(courses);
        }
      } finally {
        if (!cancelled) {
          setCatalogLoading(false);
        }
      }
    };

    void loadCourseCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

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

  // Keep the homepage progress in sync with the Course Player/Dashboard.
  // Local lecture completion updates immediately; backend progress is used
  // when available and whichever value is higher is shown.
  useEffect(() => {
    const loadHomeLearningProgress = async () => {
      const token = localStorage.getItem("skillforge_token");
      const firstCourse = catalogCourses.find((course) =>
        enrolledCourseIds.includes(course.id),
      );

      if (!firstCourse) {
        setHomeLearningProgress(0);
        return;
      }

      const localPercent = getLocalCourseProgress(firstCourse);
      setHomeLearningProgress(localPercent);

      if (!token) {
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
          return;
        }

        const data = await response.json();
        const progress = Array.isArray(data.progress) ? data.progress : [];
        const completed = progress.filter(
          (item: { passed?: boolean }) => item.passed === true,
        ).length;

        const apiPercent = Math.min(
          100,
          Math.round((completed / Math.max(firstCourse.lessons, 1)) * 100),
        );

        setHomeLearningProgress(Math.max(localPercent, apiPercent));
      } catch (error) {
        console.error("Homepage progress loading error:", error);
      }
    };

    const refreshHomeProgress = () => {
      void loadHomeLearningProgress();
    };

    void loadHomeLearningProgress();
    window.addEventListener("skillforge-progress-updated", refreshHomeProgress);
    window.addEventListener("storage", refreshHomeProgress);

    return () => {
      window.removeEventListener("skillforge-progress-updated", refreshHomeProgress);
      window.removeEventListener("storage", refreshHomeProgress);
    };
  }, [enrolledCourseIds, catalogCourses]);

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
    setDashboardOpen(false);
    setSelectedCourse(null);
    setLearningCourse(null);
    window.history.replaceState({}, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const handlePurchase = async (courseId: string) => {
    const token = localStorage.getItem("skillforge_token");

    if (!user || !token) {
      setAuthMode("login");
      return;
    }

    const normalizedCourseId = String(courseId).trim();

    if (!normalizedCourseId) {
      alert("Course ID is required.");
      return;
    }

    if (enrolledCourseIds.includes(normalizedCourseId)) {
      alert("You are already enrolled in this course.");
      return;
    }

    try {
      setPaymentLoading(true);

      const razorpayReady = await loadRazorpayScript();

      if (!razorpayReady || !window.Razorpay) {
        alert("Unable to load Razorpay Checkout. Please try again.");
        return;
      }

      const createOrderResponse = await fetch(
        `${API_BASE_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "course",
            courseId: normalizedCourseId,
          }),
        },
      );

      const orderData = await createOrderResponse.json();

      if (!createOrderResponse.ok || !orderData.success) {
        alert(orderData.message || "Unable to create payment order.");
        return;
      }

      await new Promise<void>((resolve) => {
        const selected = courses.find((course) => course.id === normalizedCourseId);

        const razorpay = new window.Razorpay!({
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "SkillForge",
          description: `${selected?.title ?? "Course"} - SkillForge`,
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
                : [normalizedCourseId];

              setEnrolledCourseIds((current) => {
                const merged = [...new Set([...current, ...verifiedIds])];
                localStorage.setItem(
                  `skillforge_enrollments_${user.id}`,
                  JSON.stringify(merged),
                );
                return merged;
              });

              alert("Payment successful! Your course is now unlocked.");
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
    if (!user) {
      setAuthMode("login");
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
  }, [catalogCourses]);

  const filteredCourses = catalogCourses.filter((course) => {
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

  if (window.location.pathname === "/admin") {
    return <AdminRoute />;
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
          window.history.replaceState({}, "", window.location.pathname);
          window.scrollTo({ top: 0, behavior: "smooth" });
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
        enrolled={enrolledCourseIds.includes(learningCourse.id)}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
        onBack={() => {
          window.history.back();
        }}
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseOverviewPage
        course={selectedCourse}
        user={user}
        enrolled={enrolledCourseIds.includes(selectedCourse.id)}
        paymentLoading={paymentLoading}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
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
              <div className="mt-7 flex flex-wrap gap-3"><button onClick={() => scrollToSection("courses")} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/15 hover:bg-emerald-700">Explore Courses <ArrowRight size={17}/></button><button onClick={openIntro} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:border-emerald-300"><Play size={16} className="fill-emerald-500 text-emerald-500"/> Watch Intro</button></div>
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
          <div className="mx-auto grid max-w-[1300px] grid-cols-2 gap-3 px-5 pb-10 sm:grid-cols-4 lg:px-8"><Metric icon={<GraduationCap/>} value={`${catalogCourses.length}`} label="Published Courses"/><Metric icon={<Shield/>} value="100%" label="Practical Learning"/><Metric icon={<Clock3/>} value="24/7" label="Access"/><Metric icon={<Award/>} value="Certificate" label="On Completion"/></div>
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
          {catalogLoading ? (
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Loading courses...
            </div>
          ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredCourses.slice(0,8).map((course,index)=>{
            const isPurchased = enrolledCourseIds.includes(course.id);
            return (
              <Course
                key={course.id}
                course={course}
                enrolled={isPurchased}
                onClick={() => openCourse(course)}
                badge={
                  isPurchased
                    ? "Purchased"
                    : index===0
                      ? "Bestseller"
                      : index===1
                        ? "Most Popular"
                        : index===2
                          ? "Beginner Friendly"
                          : index===3
                            ? "New"
                            : undefined
                }
              />
            );
          })}</div>
          )}
        </section>

        <section id="projects" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 pb-14 lg:px-8"><div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]"><div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-7"><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Hands-on Projects</p><h2 className="mt-3 text-2xl font-black text-[#0b1736]">Build projects you can actually showcase.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Practice through guided labs, infrastructure exercises, troubleshooting tasks and portfolio-ready projects.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">AWS Labs</span><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">Linux Labs</span><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">Networking</span><span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">Cyber Security</span></div></div><div id="resources" className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Resources</p><h3 className="mt-3 text-xl font-black text-[#0b1736]">Learn beyond the lectures.</h3><p className="mt-2 text-sm leading-6 text-slate-500">Notes, practice material, interview preparation and career resources.</p><button onClick={() => scrollToSection("about")} className="mt-5 text-sm font-bold text-emerald-600">Explore resources →</button></div></div></section>

        <section id="pricing" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 pb-14 lg:px-8"><div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Simple Pricing</p><h2 className="mt-2 text-3xl font-black text-[#0b1736]">Learn without subscriptions.</h2><p className="mt-2 max-w-xl text-sm text-slate-500">Course pricing is managed directly from the SkillForge Admin Portal. Each course is purchased individually with lifetime access.</p></div><div className="flex gap-3"><button onClick={() => scrollToSection("courses")} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Browse Courses</button><span className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">Lifetime Access</span></div></div></div></section>

        <section id="about" className="scroll-mt-24 border-t border-slate-100 bg-white"><div className="mx-auto grid max-w-[1380px] gap-8 px-5 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:px-8"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Why SkillForge?</p><h2 className="mt-3 text-3xl font-black text-[#0b1736]">A learning platform built around practical outcomes.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">Structured learning, hands-on projects, industry-relevant skills and lifetime access — with progress tracking, quizzes and certificates.</p></div><div className="grid gap-3 sm:grid-cols-2"><Why icon={<BookOpen/>} title="Structured Learning" text="Step-by-step learning paths"/><Why icon={<TrendingUp/>} title="Hands-on Projects" text="Real-world practical experience"/><Why icon={<Shield/>} title="Industry Relevant" text="Skills employers need"/><Why icon={<Award/>} title="Lifetime Access" text="Learn at your own pace"/></div></div></section>

        <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-[1380px] flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><div className="font-black text-slate-900">Skill<span className="text-emerald-600">Forge</span></div><p className="mt-1 text-xs">Learn • Practice • Grow</p></div><p>© 2026 SkillForge. All rights reserved.</p></div></footer>
      </main>

      {searchOpen && <Modal onClose={() => setSearchOpen(false)}><div className="w-full max-w-2xl"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-emerald-600">SkillForge Search</p><h2 className="mt-2 text-2xl font-black text-[#0b1736]">Find a course</h2></div><button onClick={() => setSearchOpen(false)} className="rounded-lg p-2 text-slate-400 hover:text-slate-900"><X/></button></div><div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4"><Search className="text-slate-400" size={20}/><input autoFocus value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Search AWS, Linux, Networking..." className="w-full bg-transparent py-4 text-slate-900 outline-none placeholder:text-slate-400"/></div><div className="mt-5 max-h-80 space-y-2 overflow-y-auto">{filteredCourses.map(course=><button key={course.id} onClick={()=>{setSearchOpen(false);openCourse(course)}} className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-200 hover:bg-emerald-50"><span className="text-3xl">{course.emoji}</span><div><p className="font-bold text-slate-900">{course.title}</p><p className="mt-1 text-xs text-slate-500">{course.category} • {course.lessons} Lessons</p></div><ChevronRight className="ml-auto text-slate-400" size={18}/></button>)}{filteredCourses.length===0&&<p className="py-8 text-center text-slate-500">No matching courses.</p>}</div></div></Modal>}
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onModeChange={setAuthMode} onSuccess={handleAuth}/>} 
      {introOpen && <Modal onClose={closeIntro}><div className="w-full max-w-5xl"><div className="mb-5 pr-8"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Welcome to SkillForge</p><h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">Learn. Practice. Grow.</h2><p className="mt-2 text-sm text-slate-400">See how SkillForge works before you start learning.</p></div><div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"><video className="aspect-video w-full bg-black object-contain" src={`${import.meta.env.BASE_URL}skillforge-intro.mp4`} controls autoPlay playsInline preload="auto" onError={(event) => { console.error("SkillForge intro video failed to load:", event.currentTarget.error); }} /></div><div className="mt-5 flex flex-wrap justify-end gap-3"><button onClick={() => { closeIntro(); scrollToSection("courses"); }} className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700">Explore Courses</button></div></div></Modal>}
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
            const localPercent = getLocalCourseProgress(course);

            if (!response.ok) {
              next[course.id] = localPercent;
              return;
            }

            const data = await response.json();
            const progress = Array.isArray(data.progress) ? data.progress : [];
            const completed = progress.filter(
              (item: { passed?: boolean }) => item.passed === true,
            ).length;

            const apiPercent = Math.min(
              100,
              Math.round((completed / Math.max(course.lessons, 1)) * 100),
            );

            // Keep the UI in sync immediately with the course player.
            // If the backend has a higher value, keep that value.
            next[course.id] = Math.max(localPercent, apiPercent);
          } catch (error) {
            console.error(`Progress loading error for ${course.id}:`, error);
          }
        }),
      );

      setProgressByCourse(next);
      setLoadingProgress(false);
    };

    void loadProgress();

    const refreshProgress = () => {
      void loadProgress();
    };

    window.addEventListener("skillforge-progress-updated", refreshProgress);
    window.addEventListener("storage", refreshProgress);

    return () => {
      window.removeEventListener("skillforge-progress-updated", refreshProgress);
      window.removeEventListener("storage", refreshProgress);
    };
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
    <div className="skillforge-dashboard min-h-screen bg-[#f7faf8] text-[#0b1736]">
<style>{`
html.dark .skillforge-dashboard,
html.dark .skillforge-course-player {
  background: #050b14 !important;
  color: #f8fafc !important;
}

html.dark .skillforge-dashboard .bg-white,
html.dark .skillforge-course-player .bg-white,
html.dark .skillforge-dashboard .bg-white\\/95,
html.dark .skillforge-course-player .bg-white\\/95,
html.dark .skillforge-dashboard .bg-white\\/80,
html.dark .skillforge-course-player .bg-white\\/80 {
  background-color: #0f172a !important;
}

html.dark .skillforge-dashboard .bg-slate-50,
html.dark .skillforge-dashboard .bg-slate-50\\/60,
html.dark .skillforge-course-player .bg-slate-50,
html.dark .skillforge-course-player .bg-slate-50\\/70 {
  background-color: #111c2d !important;
}

html.dark .skillforge-dashboard [class*="bg-[#f7faf8]"],
html.dark .skillforge-course-player [class*="bg-[#f7f8fc]"] {
  background-color: #050b14 !important;
}

html.dark .skillforge-dashboard .text-\\[\\#0b1736\\],
html.dark .skillforge-course-player .text-\\[\\#0b1736\\],
html.dark .skillforge-dashboard .text-slate-900,
html.dark .skillforge-course-player .text-slate-900,
html.dark .skillforge-dashboard .text-slate-700,
html.dark .skillforge-course-player .text-slate-700,
html.dark .skillforge-dashboard .text-slate-600,
html.dark .skillforge-course-player .text-slate-600 {
  color: #f8fafc !important;
}

html.dark .skillforge-dashboard .text-slate-500,
html.dark .skillforge-dashboard .text-slate-400,
html.dark .skillforge-course-player .text-slate-500,
html.dark .skillforge-course-player .text-slate-400 {
  color: #94a3b8 !important;
}

html.dark .skillforge-dashboard .border-slate-200,
html.dark .skillforge-dashboard .border-slate-300,
html.dark .skillforge-course-player .border-slate-200,
html.dark .skillforge-course-player .border-slate-300 {
  border-color: #334155 !important;
}

html.dark .skillforge-dashboard .border-slate-100,
html.dark .skillforge-course-player .border-slate-100 {
  border-color: #1e293b !important;
}

html.dark .skillforge-dashboard .bg-slate-100,
html.dark .skillforge-course-player .bg-slate-100 {
  background-color: #1e293b !important;
}

html.dark .skillforge-dashboard .bg-emerald-50,
html.dark .skillforge-course-player .bg-emerald-50 {
  background-color: rgba(16,185,129,.12) !important;
}

html.dark .skillforge-dashboard .text-emerald-700,
html.dark .skillforge-dashboard .text-emerald-600,
html.dark .skillforge-course-player .text-emerald-700,
html.dark .skillforge-course-player .text-emerald-600 {
  color: #34d399 !important;
}

html.dark .skillforge-dashboard header,
html.dark .skillforge-course-player header {
  background-color: rgba(15,23,42,.96) !important;
  border-color: #1e293b !important;
}

html.dark .skillforge-dashboard .dashboard-hero {
  background: linear-gradient(135deg, #0b1b2b 0%, #0f172a 55%, #0a2230 100%) !important;
  border-color: #1e293b !important;
}

html.dark .skillforge-dashboard .dashboard-hero .dashboard-streak {
  background-color: #0b1220 !important;
  border-color: #334155 !important;
}
`}</style>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 lg:px-8">
          <button
            onClick={onBack}
            className="flex items-center gap-3"
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen size={21} />
            </div>
            <div className="text-left">
              <div className="text-xl font-black">
                Skill<span className="text-emerald-600">Forge</span>
              </div>
              <div className="text-[8px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Student Dashboard
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:flex"
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 sm:block">
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
            <DashboardNav icon={<LayoutDashboard size={17} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
            <DashboardNav icon={<BookOpen size={17} />} label="My Courses" active={activeTab === "courses"} onClick={() => setActiveTab("courses")} />
            <DashboardNav icon={<BarChart3 size={17} />} label="My Progress" active={activeTab === "progress"} onClick={() => setActiveTab("progress")} />
            <DashboardNav icon={<Award size={17} />} label="Certificates" active={activeTab === "certificates"} onClick={() => setActiveTab("certificates")} />
            <DashboardNav icon={<ReceiptText size={17} />} label="Purchase History" active={activeTab === "purchases"} onClick={() => setActiveTab("purchases")} />
            <DashboardNav icon={<Headphones size={17} />} label="Support" active={activeTab === "support"} onClick={() => setActiveTab("support")} />
          </div>
        </aside>

        <main>
          {activeTab === "dashboard" ? (
            <>
          <section className="dashboard-hero rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm sm:p-8">
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
              <div className="dashboard-streak rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
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
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
        active
          ? "bg-emerald-50 text-emerald-700"
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

function CourseOverviewPage({
  course,
  user,
  enrolled,
  paymentLoading,
  darkMode,
  onToggleTheme,
  onPurchase,
  onBack,
  onStart,
}: {
  course: Course;
  user: User | null;
  enrolled: boolean;
  paymentLoading: boolean;
  darkMode: boolean;
  onToggleTheme: () => void;
  onPurchase: (courseId: string) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const overviewContent: Record<
    string,
    {
      intro: string;
      benefits: string[];
      skills: string[];
      audience: string[];
      modules: { title: string; description: string; topics: string }[];
    }
  > = {
    linux: {
      intro:
        "A practical Linux administration path covering the command line, files, permissions, users, packages, processes and networking. The curriculum is designed to build confidence working with Linux systems in real IT environments.",
      benefits: [
        "Build confidence with Linux command-line administration.",
        "Understand users, groups, permissions and system resources.",
        "Practice everyday server and troubleshooting workflows.",
        "Create a foundation for cloud, DevOps and system administration.",
      ],
      skills: [
        "Linux CLI",
        "File system",
        "Permissions",
        "Users & Groups",
        "Processes",
        "Networking",
      ],
      audience: [
        "IT support professionals",
        "Aspiring Linux administrators",
        "Cloud and DevOps beginners",
        "Students building system administration skills",
      ],
      modules: [
        { title: "Linux Fundamentals", description: "Understand Linux, distributions, terminal usage and the basic administration workflow.", topics: "Linux basics • terminal • commands • shell navigation" },
        { title: "File System & Permissions", description: "Work with Linux directories, files, ownership and permission controls.", topics: "Filesystem • paths • chmod • chown • permissions" },
        { title: "Users & Groups", description: "Manage local users and groups and understand access control in a Linux environment.", topics: "Users • groups • sudo • account management" },
        { title: "Package Management", description: "Install, update and manage software packages using standard Linux package tools.", topics: "Repositories • packages • updates • software management" },
        { title: "Process Management", description: "Monitor and control running processes and understand system resource usage.", topics: "Processes • services • jobs • resource monitoring" },
        { title: "Networking", description: "Learn the Linux networking commands and concepts used during administration and troubleshooting.", topics: "IP • interfaces • DNS • connectivity • troubleshooting" },
      ],
    },
    aws: {
      intro:
        "An AWS foundation course focused on cloud concepts and the core services used to build and manage cloud infrastructure. It introduces practical AWS workflows without exposing paid course lectures publicly.",
      benefits: [
        "Understand the fundamentals of cloud computing and AWS.",
        "Learn how core AWS services fit together.",
        "Build a foundation for cloud engineering and administration.",
        "Practice concepts that can be extended into real cloud projects.",
      ],
      skills: [
        "AWS fundamentals",
        "EC2",
        "S3",
        "IAM",
        "VPC",
        "CloudWatch",
      ],
      audience: [
        "Cloud computing beginners",
        "IT support professionals moving to cloud",
        "Aspiring AWS / Cloud Engineers",
        "Students preparing for hands-on cloud projects",
      ],
      modules: [
        { title: "Introduction to AWS", description: "Understand cloud computing, AWS regions, availability zones and the AWS service model.", topics: "Cloud concepts • regions • AZs • AWS console" },
        { title: "Understanding EC2", description: "Learn the role of virtual servers and the main concepts behind EC2-based workloads.", topics: "Instances • AMIs • storage • security groups" },
        { title: "Amazon S3 Basics", description: "Understand object storage and how S3 is used for files, backups and application data.", topics: "Buckets • objects • storage classes • access" },
        { title: "IAM Fundamentals", description: "Learn identities, users, roles and permissions for controlling access to AWS resources.", topics: "Users • groups • policies • roles • least privilege" },
        { title: "VPC Fundamentals", description: "Understand the networking foundation used to isolate and connect AWS resources.", topics: "VPC • subnets • routing • internet access" },
        { title: "CloudWatch", description: "Learn the basics of monitoring AWS resources and observing application or infrastructure activity.", topics: "Metrics • logs • alarms • monitoring" },
      ],
    },
    networking: {
      intro:
        "A practical networking foundation covering how devices communicate, how IP networks work and how common network services operate. It also introduces structured troubleshooting workflows.",
      benefits: [
        "Understand how modern computer networks communicate.",
        "Learn the core protocols used in day-to-day IT support.",
        "Develop a systematic approach to network troubleshooting.",
        "Build a foundation for networking, cloud and security roles.",
      ],
      skills: [
        "OSI & TCP/IP",
        "IP addressing",
        "DNS",
        "DHCP",
        "Network protocols",
        "Troubleshooting",
      ],
      audience: [
        "Desktop / IT support beginners",
        "Networking students",
        "Cloud beginners",
        "Aspiring network administrators",
      ],
      modules: [
        { title: "Networking Basics", description: "Learn the purpose of networks, devices and common network communication models.", topics: "LAN • WAN • switches • routers • clients" },
        { title: "OSI Model", description: "Break network communication into layers and use the model to understand problems.", topics: "7 layers • encapsulation • troubleshooting approach" },
        { title: "TCP/IP", description: "Understand the TCP/IP model and the protocols commonly used across enterprise networks.", topics: "TCP • UDP • IP • ports • protocols" },
        { title: "IP Addressing", description: "Learn IPv4 addressing, subnet concepts and how devices are identified on a network.", topics: "IPv4 • subnetting • gateway • addressing" },
        { title: "DNS & DHCP", description: "Understand how hosts receive network configuration and resolve names to addresses.", topics: "DNS • DHCP • leases • name resolution" },
        { title: "Network Troubleshooting", description: "Use a structured process and common commands to diagnose connectivity issues.", topics: "ping • tracert • ipconfig • nslookup • troubleshooting" },
      ],
    },
    windows: {
      intro:
        "A practical Windows administration course covering system administration, Active Directory, Group Policy, users, troubleshooting and security. It is designed around the tasks commonly encountered while managing Windows environments.",
      benefits: [
        "Strengthen Windows administration fundamentals.",
        "Understand Active Directory and centralized user management.",
        "Learn practical troubleshooting workflows.",
        "Build a foundation for desktop and system administration work.",
      ],
      skills: [
        "Windows administration",
        "Active Directory",
        "Group Policy",
        "User management",
        "Troubleshooting",
        "System security",
      ],
      audience: [
        "Desktop support professionals",
        "IT support engineers",
        "Aspiring Windows administrators",
        "Students preparing for enterprise IT environments",
      ],
      modules: [
        { title: "Windows Administration", description: "Learn the core administrative tasks used to manage Windows systems.", topics: "System settings • services • configuration • administration" },
        { title: "Active Directory", description: "Understand domains, users, groups and the role of Active Directory in an organization.", topics: "AD • domains • users • groups • organizational structure" },
        { title: "Group Policy", description: "Learn how centralized policies can control Windows users and computers.", topics: "GPO • policies • configuration • centralized management" },
        { title: "User Management", description: "Work with accounts, access and permissions in managed Windows environments.", topics: "Accounts • groups • permissions • access control" },
        { title: "Windows Troubleshooting", description: "Follow a structured approach to diagnose common Windows system problems.", topics: "Diagnostics • logs • startup • performance • connectivity" },
        { title: "System Security", description: "Understand practical Windows security controls and secure administration habits.", topics: "Security settings • updates • endpoint protection • hardening" },
      ],
    },
    security: {
      intro:
        "A broad cybersecurity learning path moving from fundamentals into application security, network defense, cryptography, governance, security operations, incident investigation, SIEM and job readiness.",
      benefits: [
        "Understand core cybersecurity principles and terminology.",
        "Explore offensive and defensive security concepts.",
        "Learn how security operations and incident investigation work.",
        "Build a structured foundation for further cybersecurity practice.",
      ],
      skills: [
        "Information security",
        "Linux & Python",
        "Network defense",
        "Cryptography",
        "SOC",
        "SIEM / Splunk",
      ],
      audience: [
        "Cybersecurity beginners",
        "IT professionals moving into security",
        "Students building security fundamentals",
        "Learners preparing for hands-on security practice",
      ],
      modules: [
        { title: "Module 1 — Introduction", description: "Start with cybersecurity concepts, threats, attack surfaces, CIA Triad and security fundamentals.", topics: "Threats • malware • phishing • CIA Triad • security basics" },
        { title: "Module 2 — Linux & Python Fundamentals", description: "Build the Linux and Python foundation useful for security learning and automation.", topics: "Linux • command line • Python basics • security workflow" },
        { title: "Module 3 — Foundations of Information Security", description: "Understand foundational information security concepts, controls and security practices.", topics: "Security principles • controls • risk • protection" },
        { title: "Module 4 — Application Security and Penetration Testing", description: "Explore application security concepts and the fundamentals of penetration testing.", topics: "Web security • vulnerabilities • testing methodology • exploitation concepts" },
        { title: "Module 5/6 — Network Defense & Penetration Testing", description: "Study network attack and defense concepts and how security testing is approached.", topics: "Network security • defense • attacks • penetration testing" },
        { title: "Module 7 — Data Protection and Cryptography", description: "Learn how cryptographic concepts help protect information and communications.", topics: "Encryption • hashing • keys • data protection" },
        { title: "Module 8 — Governance, Risk & Compliance", description: "Understand the organizational side of cybersecurity, including risk and compliance.", topics: "GRC • risk • policies • compliance" },
        { title: "Module 9 — Securing Emerging Technologies", description: "Explore security considerations for newer technologies and modern environments.", topics: "Emerging tech • cloud considerations • modern attack surface" },
        { title: "Module 10 — Security Operations Center", description: "Understand the role of a SOC and the workflow used to monitor security events.", topics: "SOC • monitoring • alerts • triage • response" },
        { title: "Module 11 — RCA & Cyber Breach Investigation", description: "Learn the concepts behind root-cause analysis and investigating security incidents.", topics: "RCA • incident investigation • evidence • breach analysis" },
        { title: "Module 12 — SIEM Architecture & Hands-On Splunk", description: "Understand SIEM architecture and how Splunk can be used for security monitoring.", topics: "SIEM • Splunk • logs • correlation • investigation" },
        { title: "Module 13 — Job Ready Module", description: "Bring the learning together with a job-focused module covering practical preparation.", topics: "Job readiness • practical revision • security career preparation" },
      ],
    },
    sysadmin: {
      intro:
        "A practical system administration path covering server management, monitoring, backup and recovery, automation fundamentals and troubleshooting across modern IT environments.",
      benefits: [
        "Understand the responsibilities of a system administrator.",
        "Learn practical server management and monitoring concepts.",
        "Build structured backup, recovery and troubleshooting habits.",
        "Create a foundation for system administration and cloud operations.",
      ],
      skills: [
        "System administration",
        "Server management",
        "Monitoring",
        "Backup & recovery",
        "Automation",
        "Troubleshooting",
      ],
      audience: [
        "IT support engineers",
        "Aspiring system administrators",
        "Infrastructure beginners",
        "Learners moving toward cloud operations",
      ],
      modules: [
        { title: "System Administration", description: "Understand the role of a system administrator and the core tasks involved in maintaining systems.", topics: "Administration • configuration • maintenance • access" },
        { title: "Server Management", description: "Learn the fundamentals of managing server workloads and keeping systems organized.", topics: "Servers • services • configuration • maintenance" },
        { title: "Monitoring", description: "Understand how system and service monitoring helps identify issues early.", topics: "Metrics • logs • alerts • resource monitoring" },
        { title: "Backup & Recovery", description: "Learn the purpose of backups and the concepts behind recovering systems and data.", topics: "Backup strategy • recovery • data protection" },
        { title: "Automation Basics", description: "Explore how repetitive administration tasks can be simplified through automation.", topics: "Scripts • repetitive tasks • automation concepts" },
        { title: "Troubleshooting", description: "Build a structured troubleshooting approach for system and infrastructure problems.", topics: "Problem isolation • logs • diagnostics • resolution" },
      ],
    },
  };

  const content = overviewContent[course.id] ?? {
    intro: course.description,
    benefits: ["Structured learning", "Practical concepts", "Quizzes and assessment", "Certificate on completion"],
    skills: course.modules.slice(0, 6),
    audience: ["Students", "IT learners", "Career switchers"],
    modules: course.modules.map((module) => ({
      title: module,
      description: "This module is part of the course curriculum.",
      topics: "Lessons • practical concepts • assessment",
    })),
  };

  return (
    <div className="min-h-screen bg-[#f7fbf9] text-[#0b1736] transition-colors dark:bg-[#07110e] dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0b1512]/95">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between gap-4 px-5 lg:px-8">
          <button
            type="button"
            onClick={onBack}
            className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Courses</span>
            <span className="sm:hidden">Back</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main>
        {/* HERO — same visual language as the main SkillForge website */}
        <section className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/30 dark:border-emerald-900/40 dark:from-[#07110e] dark:via-[#0a1814] dark:to-[#0c241b]">
          <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/20" />
          <div className="pointer-events-none absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-800/10" />

          <div className="relative mx-auto max-w-[1380px] px-5 py-12 lg:px-8 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_390px] lg:items-center">
              <div>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {course.category}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                    {course.level}
                  </span>
                </div>

                <div className="mt-7 text-6xl sm:text-7xl">{course.emoji}</div>

                <h1 className="mt-5 max-w-4xl text-[42px] font-black leading-[1.03] tracking-[-0.045em] text-[#0b1736] sm:text-[58px] dark:text-white">
                  {course.title}
                </h1>

                <p className="mt-5 max-w-3xl text-[16px] leading-7 text-slate-500 sm:text-[17px] dark:text-slate-400">
                  {course.description}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {[
                    ["Lessons", String(course.lessons)],
                    ["Duration", course.duration],
                    ["Modules", String(content.modules.length)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="mt-1 font-black text-[#0b1736] dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-[0_25px_70px_rgba(15,118,110,0.10)] dark:border-emerald-900/50 dark:bg-[#0d1915] dark:shadow-none">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  {enrolled ? "Course Unlocked" : "Course Access"}
                </p>

                {enrolled ? (
                  <>
                    <h2 className="mt-2 text-2xl font-black text-[#0b1736] dark:text-white">
                      You're ready to learn.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Your lectures, quizzes and learning progress are unlocked for this course.
                    </p>
                    <button
                      type="button"
                      onClick={onStart}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-black text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700"
                    >
                      <Play size={18} className="fill-white" /> Continue Learning
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-4xl font-black text-[#0b1736] dark:text-white">₹{course.price.toLocaleString("en-IN")}</span>
                      <span className="pb-1 text-sm text-slate-400">one-time</span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Explore the complete syllabus publicly. Purchase the course to unlock the actual lectures, videos, quizzes and progress tracking.
                    </p>

                    <button
                      type="button"
                      onClick={() => onPurchase(course.id)}
                      disabled={paymentLoading || !user}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-black text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CreditCard size={18} />
                      {paymentLoading ? "Processing..." : user ? `Buy Course — ₹${course.price.toLocaleString("en-IN")}` : "Login to Purchase"}
                    </button>

                    {!user && (
                      <p className="mt-3 text-center text-xs text-slate-400">
                        Login is required before opening free demo lectures or purchasing the course.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={onStart}
                      disabled={!user}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                    >
                      <PlayCircle size={17} /> Watch Free Lectures
                    </button>

                  </>
                )}
              </aside>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="mx-auto max-w-[1380px] px-5 py-16 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
              Course Overview
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#0b1736] sm:text-4xl dark:text-white">
              What will you learn?
            </h2>
            <p className="mt-5 text-sm leading-8 text-slate-500 sm:text-base dark:text-slate-400">
              {content.intro}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [BookOpen, "Structured Curriculum", "A clear learning path from fundamentals to practical concepts."],
              [PlayCircle, "Practical Learning", "Course lectures and demonstrations are available after purchase."],
              [Award, "Quizzes & Certificate", "Assess your learning and complete the course requirements."],
              [TrendingUp, "Career Foundation", "Build skills that can support further projects and career learning."],
            ].map(([Icon, title, description]) => {
              const FeatureIcon = Icon as typeof BookOpen;
              return (
                <div
                  key={title as string}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-emerald-800"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <FeatureIcon size={20} />
                  </div>
                  <h3 className="mt-5 font-bold text-[#0b1736] dark:text-white">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {description as string}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SKILLS */}
        <section className="border-y border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-[#0a1512]">
          <div className="mx-auto max-w-[1380px] px-5 py-16 lg:px-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
              Skills Covered
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#0b1736] sm:text-4xl dark:text-white">
              What you'll be able to work with
            </h2>

            <div className="mt-8 flex flex-wrap gap-3">
              {content.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* DETAILED CURRICULUM */}
        <section className="mx-auto max-w-[1380px] px-5 py-16 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                Course Curriculum
              </p>
              <h2 className="mt-3 text-3xl font-black text-[#0b1736] sm:text-4xl dark:text-white">
                What will be taught?
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                Every module below is visible to everyone. Module names and topic previews are public; the actual lectures and assessments remain locked until the course is purchased.
              </p>
            </div>
            <span className="text-sm font-semibold text-slate-400">
              {content.modules.length} modules • {course.lessons} lessons
            </span>
          </div>

          <div className="mt-9 space-y-3">
            {content.modules.map((module, index) => (
              <div
                key={module.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-emerald-800"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#0b1736] dark:text-white">{module.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {module.description}
                        </p>
                        <p className="mt-3 text-xs font-semibold text-slate-400">
                          Topics: <span className="text-slate-500 dark:text-slate-300">{module.topics}</span>
                        </p>
                      </div>

                      {enrolled ? (
                        <CheckCircle2 className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-400" size={18} />
                      ) : (
                        <Lock className="mt-1 shrink-0 text-slate-300 dark:text-slate-600" size={18} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BENEFITS + WHO IS IT FOR */}
        <section className="border-y border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-[#0a1512]">
          <div className="mx-auto grid max-w-[1380px] gap-6 px-5 py-16 lg:grid-cols-2 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                Benefits
              </p>
              <h2 className="mt-3 text-2xl font-black text-[#0b1736] sm:text-3xl dark:text-white">
                Why take this course?
              </h2>

              <div className="mt-7 space-y-4">
                {content.benefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" size={18} />
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                Who is this for?
              </p>
              <h2 className="mt-3 text-2xl font-black text-[#0b1736] sm:text-3xl dark:text-white">
                Is this course right for you?
              </h2>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {content.audience.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-[1380px] px-5 py-16 lg:px-8">
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 p-8 shadow-sm sm:p-10 dark:border-emerald-900/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                  Start Learning
                </p>
                <h2 className="mt-3 text-2xl font-black text-[#0b1736] sm:text-3xl dark:text-white">
                  Ready to start {course.title}?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                  The complete curriculum is visible above. Purchase the course to unlock the actual lectures, videos, quizzes and progress tracking.
                </p>
              </div>

              {enrolled ? (
                <button
                  type="button"
                  onClick={onStart}
                  className="shrink-0 rounded-xl bg-emerald-600 px-7 py-4 font-black text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700"
                >
                  Continue Learning
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onPurchase(course.id)}
                  disabled={paymentLoading || !user}
                  className="shrink-0 rounded-xl bg-emerald-600 px-7 py-4 font-black text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentLoading ? "Processing..." : user ? `Unlock Course — ₹${course.price.toLocaleString("en-IN")}` : "Login to Purchase"}
                </button>
              )}
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#08110e]">
          <div className="mx-auto flex max-w-[1380px] flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <div className="font-black text-[#0b1736] dark:text-white">
                Skill<span className="text-emerald-600 dark:text-emerald-400">Forge</span>
              </div>
              <p className="mt-1 text-xs">Learn • Practice • Grow</p>
            </div>
            <p>© 2026 SkillForge. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ================= COURSE PLAYER ================= */

const R2_LECTURE_1_URL = "https://pub-edfa7b2fb8204f23bd7d5a9f86bc0ca0.r2.dev/cyber-security/Module%201%20%E2%80%94%20Introduction/lecture-1.mp4";
const R2_LECTURE_2_URL = "https://pub-edfa7b2fb8204f23bd7d5a9f86bc0ca0.r2.dev/cyber-security/Module%201%20%E2%80%94%20Introduction/lecture%202.mp4";

function SkillForgeVideoPlayer({
  src,
  title,
  lectureNumber,
  moduleLabel,
  autoPlay = false,
  onEnded,
}: {
  src: string;
  title: string;
  lectureNumber?: number;
  moduleLabel?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
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
        autoPlay={autoPlay}
        preload="metadata"
        controls={false}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => { setPlaying(true); showControls(); }}
        onPause={() => { setPlaying(false); setControlsVisible(true); }}
        onEnded={() => {
          setPlaying(false);
          setControlsVisible(true);
          onEnded?.();
        }}
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
        <div className="rounded-full border border-lime-400/20 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-lime-300 backdrop-blur-md">
          {moduleLabel ?? `Module ${lectureNumber ?? 1}`}
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
  enrolled,
  darkMode,
  onToggleTheme,
  onBack,
}: {
  course: Course;
  enrolled: boolean;
  darkMode: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
}) {
  const [modules, setModules] = useState<CourseModule[]>(
    course.id === "security" ? securityModules : [],
  );
  const [contentLoading, setContentLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLectureIndex, setActiveLectureIndex] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [infoTab, setInfoTab] = useState<"description" | "resources">("description");

  useEffect(() => {
    let cancelled = false;

    const loadCourseContent = async () => {
      setContentLoading(true);

      try {
        const catalogResponse = await fetch(`${API_BASE_URL}/api/admin/public-courses`);
        const catalogData = await catalogResponse.json();

        if (!catalogResponse.ok || !catalogData.success || !Array.isArray(catalogData.courses)) {
          throw new Error("Unable to load course catalog");
        }

        const catalogCourse = catalogData.courses.find(
          (item: { id?: string; dbId?: number }) => item.id === course.id,
        );

        if (!catalogCourse?.dbId) {
          if (!cancelled) setContentLoading(false);
          return;
        }

        const contentResponse = await fetch(
          `${API_BASE_URL}/api/admin/public-courses/${catalogCourse.dbId}/content`,
        );
        const contentData = await contentResponse.json();

        if (!contentResponse.ok || !contentData.success || !Array.isArray(contentData.modules)) {
          throw new Error("Unable to load course content");
        }

        const dbModules: CourseModule[] = contentData.modules
          .map((module: {
            id: number;
            title: string;
            description?: string | null;
            lectures?: Array<{
              id: number;
              title: string;
              description?: string | null;
              videoUrl?: string;
              lectureOrder?: number;
              duration?: number;
              isFree?: boolean;
              questions?: Array<{
                id: number;
                question: string;
                options: unknown;
                correct_answer: string;
              }>;
            }>;
          }) => {
            const dbLectures = Array.isArray(module.lectures) ? module.lectures : [];

            const lectures: Lecture[] = dbLectures
              .sort((a, b) => Number(a.lectureOrder ?? 0) - Number(b.lectureOrder ?? 0))
              .map((item) => {
                const questions: QuizQuestion[] = (item.questions ?? []).map((question) => {
                  const options = Array.isArray(question.options)
                    ? question.options.map((option) => String(option))
                    : [];
                  const rawAnswer = String(question.correct_answer ?? "");
                  const numericAnswer = Number(rawAnswer);
                  const answer = Number.isInteger(numericAnswer) && numericAnswer >= 0 && numericAnswer < options.length
                    ? numericAnswer
                    : Math.max(0, options.findIndex((option) => option === rawAnswer));

                  return {
                    question: String(question.question),
                    options,
                    answer,
                    explanation: "Review the lecture material for the concept tested in this question.",
                  };
                });

                const durationMinutes = Number(item.duration ?? 0);

                return {
                  id: String(item.id),
                  title: String(item.title),
                  duration: durationMinutes > 0 ? `${durationMinutes} min` : "Self-paced",
                  videoUrl: item.videoUrl ? String(item.videoUrl) : "",
                  questions,
                  isFree: Boolean(item.isFree),
                };
              });

            return {
              id: String(module.id),
              title: String(module.title),
              duration: lectures.length
                ? `${lectures.length} lecture${lectures.length === 1 ? "" : "s"}`
                : "Self-paced",
              lectures,
            };
          })
          .filter((module: CourseModule) => module.lectures.length > 0);

        if (!cancelled && dbModules.length > 0) {
          setModules(dbModules);
          setActiveModuleIndex(0);
          setActiveLectureIndex(0);
        }
      } catch (error) {
        console.error("Course content loading error:", error);
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    };

    void loadCourseContent();
    return () => {
      cancelled = true;
    };
  }, [course.id]);

  const activeModule = modules[activeModuleIndex];
  const lecture = activeModule?.lectures[activeLectureIndex];

  const [videoMarkedComplete, setVideoMarkedComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!lecture) return;
    const key = `skillforge_lecture_progress_${course.id}_${lecture.id}`;
    setVideoMarkedComplete(localStorage.getItem(`${key}_video`) === "true");
    setQuizStarted(false);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setQuizOpen(false);
    setInfoTab("description");
  }, [course.id, lecture?.id]);

  const goToPurchase = () => {
    onBack();

    window.setTimeout(() => {
      document.getElementById("course-purchase")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 250);
  };

  const canAccessLecture = (item: Lecture) => enrolled || item.isFree === true;

  const selectLecture = (moduleIndex: number, lectureIndex: number) => {
    const item = modules[moduleIndex]?.lectures[lectureIndex];
    if (!item) return;

    if (!canAccessLecture(item)) {
      goToPurchase();
      return;
    }

    setActiveModuleIndex(moduleIndex);
    setActiveLectureIndex(lectureIndex);
    setQuizOpen(false);
  };

  const markLectureComplete = () => {
    if (!lecture) return;
    const key = `skillforge_lecture_progress_${course.id}_${lecture.id}`;
    localStorage.setItem(`${key}_video`, "true");
    setVideoMarkedComplete(true);
    window.dispatchEvent(new Event("skillforge-progress-updated"));
    setQuizStarted(false);
    setSubmitted(false);
    setScore(0);
    setQuizOpen(lecture.questions.length > 0);
  };

  const submitQuiz = () => {
    if (!lecture) return;

    const total = lecture.questions.length;
    let currentScore = 0;
    lecture.questions.forEach((question, index) => {
      if (answers[index] === question.answer) currentScore += 1;
    });

    setScore(currentScore);
    setSubmitted(true);

    const key = `skillforge_lecture_progress_${course.id}_${lecture.id}`;
    localStorage.setItem(`${key}_quiz_score`, String(currentScore));
    localStorage.setItem(`${key}_quiz_completed`, "true");

    if (currentScore >= Math.ceil(total * 0.7)) {
      localStorage.setItem(`${key}_complete`, "true");
    }

    window.dispatchEvent(new Event("skillforge-progress-updated"));
  };

  const passed = submitted && !!lecture && score >= Math.ceil(lecture.questions.length * 0.7);
  const allLectures = modules.flatMap((module) => module.lectures);
  const currentLectureNumber = Math.max(1, allLectures.findIndex((item) => item.id === lecture?.id) + 1);
  const totalLectures = Math.max(course.lessons, allLectures.length);
  const localCourseProgress = getLocalCourseProgress(course);
  const lectureLocked = !!lecture && !canAccessLecture(lecture);

  if (contentLoading && !modules.length) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1736]/95 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-5 lg:px-8">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-emerald-400">
              <ArrowLeft size={18} /> Back to Course
            </button>
            <div className="text-lg font-black">Skill<span className="text-emerald-400">Forge</span></div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-16 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" />
          <h1 className="mt-6 text-2xl font-black">Loading course content...</h1>
          <p className="mt-2 text-sm text-slate-400">Checking the latest lectures and access settings.</p>
        </main>
      </div>
    );
  }

  if (!modules.length || !lecture) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1736]/95 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-5 lg:px-8">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-emerald-400">
              <ArrowLeft size={18} /> Back to Course
            </button>
            <div className="text-lg font-black">Skill<span className="text-emerald-400">Forge</span></div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400"><BookOpen size={38} /></div>
          <h1 className="mt-6 text-3xl font-black">{course.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">Course lectures will appear here as they are added.</p>
          <button onClick={onBack} className="mt-7 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 hover:bg-emerald-400">Back to Courses</button>
        </main>
      </div>
    );
  }

  return (
    <div className="skillforge-course-player min-h-screen bg-[#f7f8fc] text-slate-900">
<style>{`
html.dark .skillforge-dashboard,
html.dark .skillforge-course-player {
  background: #050b14 !important;
  color: #f8fafc !important;
}

html.dark .skillforge-dashboard .bg-white,
html.dark .skillforge-course-player .bg-white,
html.dark .skillforge-dashboard .bg-white\\/95,
html.dark .skillforge-course-player .bg-white\\/95,
html.dark .skillforge-dashboard .bg-white\\/80,
html.dark .skillforge-course-player .bg-white\\/80 {
  background-color: #0f172a !important;
}

html.dark .skillforge-dashboard .bg-slate-50,
html.dark .skillforge-dashboard .bg-slate-50\\/60,
html.dark .skillforge-course-player .bg-slate-50,
html.dark .skillforge-course-player .bg-slate-50\\/70 {
  background-color: #111c2d !important;
}

html.dark .skillforge-dashboard [class*="bg-[#f7faf8]"],
html.dark .skillforge-course-player [class*="bg-[#f7f8fc]"] {
  background-color: #050b14 !important;
}

html.dark .skillforge-dashboard .text-\\[\\#0b1736\\],
html.dark .skillforge-course-player .text-\\[\\#0b1736\\],
html.dark .skillforge-dashboard .text-slate-900,
html.dark .skillforge-course-player .text-slate-900,
html.dark .skillforge-dashboard .text-slate-700,
html.dark .skillforge-course-player .text-slate-700,
html.dark .skillforge-dashboard .text-slate-600,
html.dark .skillforge-course-player .text-slate-600 {
  color: #f8fafc !important;
}

html.dark .skillforge-dashboard .text-slate-500,
html.dark .skillforge-dashboard .text-slate-400,
html.dark .skillforge-course-player .text-slate-500,
html.dark .skillforge-course-player .text-slate-400 {
  color: #94a3b8 !important;
}

html.dark .skillforge-dashboard .border-slate-200,
html.dark .skillforge-dashboard .border-slate-300,
html.dark .skillforge-course-player .border-slate-200,
html.dark .skillforge-course-player .border-slate-300 {
  border-color: #334155 !important;
}

html.dark .skillforge-dashboard .border-slate-100,
html.dark .skillforge-course-player .border-slate-100 {
  border-color: #1e293b !important;
}

html.dark .skillforge-dashboard .bg-slate-100,
html.dark .skillforge-course-player .bg-slate-100 {
  background-color: #1e293b !important;
}

html.dark .skillforge-dashboard .bg-emerald-50,
html.dark .skillforge-course-player .bg-emerald-50 {
  background-color: rgba(16,185,129,.12) !important;
}

html.dark .skillforge-dashboard .text-emerald-700,
html.dark .skillforge-dashboard .text-emerald-600,
html.dark .skillforge-course-player .text-emerald-700,
html.dark .skillforge-course-player .text-emerald-600 {
  color: #34d399 !important;
}

html.dark .skillforge-dashboard header,
html.dark .skillforge-course-player header {
  background-color: rgba(15,23,42,.96) !important;
  border-color: #1e293b !important;
}
`}</style>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 lg:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <button onClick={onBack} className="flex shrink-0 items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600">
              <ArrowLeft size={18} /><span className="hidden sm:inline">Back to Course</span>
            </button>
            <div className="hidden h-7 w-px bg-slate-200 sm:block" />
            <div className="min-w-0">
              <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-emerald-600">SkillForge Learning</p>
              <h1 className="truncate text-base font-black text-[#0b1736] sm:text-lg">{course.title}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-right sm:block">
              <p className="text-xs font-black text-[#0b1736]">{currentLectureNumber} / {totalLectures}</p>
              <p className="text-[10px] font-semibold text-slate-400">Lectures</p>
            </div>
            <div className="hidden w-40 sm:block">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-slate-500"><span>Course Progress</span><span>{localCourseProgress}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${localCourseProgress}%` }} /></div>
            </div>
            <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 md:flex"><UserCircle size={20} /></div>
          </div>
        </div>
      </header>

      <div className="border-b border-amber-200 bg-amber-400 px-4 py-2 text-center text-xs font-semibold text-slate-900">
        If you are facing any issues with lectures, mentors or technical support, please contact SkillForge support.
      </div>

      {/* Main player left + course modules right */}
      <div className="mx-auto grid min-h-[calc(100vh-108px)] max-w-[1600px] lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 bg-[#f7f8fc] p-3 sm:p-5 lg:p-7">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">{activeModule.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-[#0b1736] sm:text-2xl">{lecture.title}</h2>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-500 shadow-sm">{lecture.duration}</span>
              </div>
            </div>

            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-xl">
              {lectureLocked ? (
                <div className="flex aspect-video flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-[#0b1736] to-slate-950 px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
                    <Lock size={34} />
                  </div>
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-amber-300">Paid Lecture</p>
                  <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">This lecture is locked</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                    Purchase this course to unlock this lecture and all other paid lectures. Free lectures remain available without purchasing.
                  </p>
                  <button
                    type="button"
                    onClick={goToPurchase}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
                  >
                    <CreditCard size={17} /> Unlock Course — ₹{course.price.toLocaleString("en-IN")}
                  </button>
                </div>
              ) : (
                <SkillForgeVideoPlayer
                  key={lecture.id}
                  src={lecture.id === "lecture-1" ? R2_LECTURE_1_URL : lecture.id === "lecture-2" ? R2_LECTURE_2_URL : lecture.videoUrl}
                  title={lecture.title}
                  lectureNumber={activeLectureIndex + 1}
                  moduleLabel={`MODULE ${activeModuleIndex + 1} • ${activeModule.title.replace(/^Module\s+\d+\s*[—-]\s*/i, "")}`}
                  autoPlay
                  onEnded={markLectureComplete}
                />
              )}
            </section>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-[#0b1736]">{lecture.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{lecture.duration} · {activeModule.title} · Lecture {activeLectureIndex + 1}</p>
                </div>
                {lectureLocked ? (
                  <button
                    type="button"
                    onClick={goToPurchase}
                    className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                  >
                    Unlock Lecture
                  </button>
                ) : (
                  <button onClick={markLectureComplete} className={`shrink-0 rounded-xl px-5 py-3 text-sm font-black transition ${videoMarkedComplete ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                    {videoMarkedComplete ? "✓ Lecture Completed · Open Quiz" : "Mark as Complete"}
                  </button>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setInfoTab("description")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${infoTab === "description" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setInfoTab("resources")}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${infoTab === "resources" ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  Resources
                </button>
              </div>

              {infoTab === "description" ? (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">
                  {lecture.id === "lecture-2"
                    ? "This lecture introduces different cybersecurity job profiles and the types of roles learners can explore within the cybersecurity field."
                    : `In this lecture, you will learn the key concepts covered in ${activeModule.title.replace(" — ", ": ")} and build the practical foundation needed for the next lecture.`}
                </p>
              ) : (
                <div className="mt-4">
                  {lecture.resources?.length ? (
                    <div className="space-y-2">
                      {lecture.resources.map((resource) => (
                        <a
                          key={resource.url}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <span>{resource.title}</span>
                          <ArrowRight size={16} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-slate-500">No resources have been added for this lecture yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Course modules on the RIGHT */}
        <aside className="border-l border-slate-200 bg-white">
          <div className="sticky top-[108px] max-h-[calc(100vh-108px)] overflow-y-auto">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><GraduationCap size={22} /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#0b1736]">{course.title}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{currentLectureNumber} / {totalLectures} Lectures</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${localCourseProgress}%` }} /></div>
            </div>

            <div className="p-3">
              <button onClick={onBack} className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"><BookOpen size={17} /> Course Overview</button>
              {modules.map((module, moduleIndex) => {
                const expanded = activeModuleIndex === moduleIndex;
                return (
                  <div key={module.id} className="mb-2 overflow-hidden rounded-2xl border border-slate-200">
                    <button onClick={() => { setActiveModuleIndex(moduleIndex); setActiveLectureIndex(0); }} className={`flex w-full items-center gap-3 p-4 text-left transition ${expanded ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-700 hover:bg-slate-50"}`}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">{moduleIndex + 1}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-black">{module.title.replace(" — ", ": ")}</span><span className="mt-1 block text-[10px] font-medium text-slate-400">{module.duration} · {module.lectures.length} lectures</span></span>
                      <ChevronRight size={17} className={`shrink-0 transition-transform ${expanded ? "rotate-90 text-emerald-600" : ""}`} />
                    </button>
                    {expanded && (
                      <div className="border-t border-slate-100 bg-slate-50/70 p-2">
                        {module.lectures.map((item, lectureIndex) => {
                          const active = item.id === lecture.id;
                          const itemKey = `skillforge_lecture_progress_${course.id}_${item.id}`;
                          const completed = localStorage.getItem(`${itemKey}_video`) === "true";
                          return (
                            <button key={item.id} onClick={() => selectLecture(moduleIndex, lectureIndex)} className={`mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition last:mb-0 ${active ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100" : "text-slate-600 hover:bg-white"} ${!canAccessLecture(item) ? "opacity-80" : ""}`}>
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-black">
                                {completed ? <CheckCircle2 size={15} className="text-emerald-500" /> : !canAccessLecture(item) ? <Lock size={13} className="text-slate-400" /> : lectureIndex + 1}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-xs font-bold leading-5">{item.title}</span>
                                <span className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400"><Clock3 size={11} />{item.duration} · {canAccessLecture(item) ? (item.isFree ? "Free" : "Unlocked") : "Paid"}</span>
                              </span>
                              {active && !lectureLocked && <PlayCircle size={16} className="mt-1 shrink-0 text-emerald-500" />}
                              {active && lectureLocked && <Lock size={15} className="mt-1 shrink-0 text-amber-500" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Quiz appears only after the lecture is completed */}
      {quizOpen && (
        <Modal onClose={() => setQuizOpen(false)}>
          <div className="w-full max-w-3xl">
            <div className="mb-5 flex items-start justify-between gap-4 pr-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Lecture completed</p>
                <h2 className="mt-1 text-2xl font-black text-white">Test Your Knowledge</h2>
                <p className="mt-1 text-sm text-slate-400">Complete the quiz before moving to the next lecture.</p>
              </div>
              <div className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-400">{lecture.questions.length} Questions</div>
            </div>
            <QuizPanel
              lecture={lecture}
              videoMarkedComplete={videoMarkedComplete}
              quizStarted={quizStarted}
              setQuizStarted={setQuizStarted}
              answers={answers}
              setAnswers={setAnswers}
              submitted={submitted}
              score={score}
              passed={passed}
              submitQuiz={submitQuiz}
              onClose={() => setQuizOpen(false)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function QuizPanel({
  lecture,
  videoMarkedComplete,
  quizStarted,
  setQuizStarted,
  answers,
  setAnswers,
  submitted,
  score,
  passed,
  submitQuiz,
  onClose,
}: {
  lecture: Lecture;
  videoMarkedComplete: boolean;
  quizStarted: boolean;
  setQuizStarted: Dispatch<SetStateAction<boolean>>;
  answers: Record<number, number>;
  setAnswers: Dispatch<SetStateAction<Record<number, number>>>;
  submitted: boolean;
  score: number;
  passed: boolean;
  submitQuiz: () => void;
  onClose: () => void;
}) {
  const requiredScore = Math.ceil(lecture.questions.length * 0.7);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
              Assessment
            </p>
            <h3 className="mt-1 text-lg font-black text-[#0b1736]">
              Lecture Quiz
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">
              {lecture.questions.length} Questions
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-black text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
            >
              Back
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Complete the lecture and answer at least {requiredScore} questions
          correctly to pass.
        </p>
      </div>

      {!videoMarkedComplete ? (
        <div className="p-5">
          <div className="rounded-2xl bg-amber-50 p-4">
            <Lock size={20} className="text-amber-600" />
            <p className="mt-3 text-sm font-black text-amber-900">
              Quiz locked
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800/70">
              Watch the lecture first, then click “Mark as Complete” below the
              video to unlock the quiz.
            </p>
          </div>
        </div>
      ) : !quizStarted ? (
        <div className="p-5">
          <div className="rounded-2xl bg-emerald-50 p-4">
            <CheckCircle2 size={21} className="text-emerald-600" />
            <p className="mt-3 text-sm font-black text-emerald-900">
              Lecture completed
            </p>
            <p className="mt-1 text-xs leading-5 text-emerald-800/70">
              Your quiz is ready.
            </p>
          </div>

          <button
            onClick={() => setQuizStarted(true)}
            className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700"
          >
            Start Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {lecture.questions.map((question, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-black leading-5 text-[#0b1736]">
                {index + 1}. {question.question}
              </p>

              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[index] === optionIndex;
                  const correct =
                    submitted && optionIndex === question.answer;
                  const wrong =
                    submitted &&
                    selected &&
                    optionIndex !== question.answer;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [index]: optionIndex,
                        }))
                      }
                      className={`w-full rounded-lg border px-3 py-2.5 text-left text-[11px] font-semibold transition ${
                        correct
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : wrong
                            ? "border-red-300 bg-red-50 text-red-700"
                            : selected
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-slate-800"
                      }`}
                    >
                      <span className="mr-2 font-black text-slate-400">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={submitQuiz}
              disabled={
                Object.keys(answers).length !== lecture.questions.length
              }
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit Quiz
            </button>
          ) : (
            <div
              className={`rounded-2xl p-5 text-center ${
                passed ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Your Score
              </p>
              <p
                className={`mt-2 text-4xl font-black ${
                  passed ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {score}/{lecture.questions.length}
              </p>

              <p className="mt-2 text-xs font-bold text-slate-600">
                {passed
                  ? "🎉 Quiz passed."
                  : `You need ${requiredScore}/${lecture.questions.length} to pass.`}
              </p>

              {passed && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700"
                >
                  Back to Lecture
                </button>
              )}
            </div>
          )}
        </div>
      )}
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
  enrolled = false,
}: {
  course: Course;
  onClick: () => void;
  badge?: string;
  enrolled?: boolean;
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
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="relative text-7xl drop-shadow-lg transition duration-300 group-hover:scale-110">{course.emoji}</span>
        )}
        {badge && <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-sm">{badge}</span>}
      </div>
      <div className="p-4">
        <h3 className="text-base font-black text-[#0b1736]">{course.title}</h3>
        <p className="mt-2 min-h-[44px] text-xs leading-5 text-slate-500">{course.description}</p>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500"><span>▣ {course.lessons} Lessons</span><span>◷ {course.duration}</span></div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-500"><span>★</span><span className="text-slate-500">4.8 (120)</span></div>
        <div className="mt-4 flex items-center justify-between">
          {enrolled ? (
            <span className="flex items-center gap-2 text-base font-black text-emerald-600">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">✓</span>
              Purchased
            </span>
          ) : (
            <span className="text-xl font-black text-[#0b1736]">₹{course.price.toLocaleString("en-IN")}</span>
          )}

          <span className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
            enrolled
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white"
              : "border-emerald-300 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white"
          }`}>
            {enrolled ? "Continue Learning" : "View Course"}
            <ArrowRight size={14}/>
          </span>
        </div>
      </div>
    </button>
  );
}


function Metric({icon,value,label}:{icon:ReactNode;value:string;label:string}){return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">{icon}</div><div><p className="text-lg font-black text-[#0b1736]">{value}</p><p className="text-[10px] text-slate-500">{label}</p></div></div>}
function Why({icon,title,text}:{icon:ReactNode;title:string;text:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">{icon}</div><div><p className="text-xs font-black text-[#0b1736]">{title}</p><p className="mt-1 text-[10px] text-slate-500">{text}</p></div></div></div>}

export default App;