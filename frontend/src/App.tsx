import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronRight,
  CreditCard,
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
  Users,
  X,
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
        videoUrl: "https://www.youtube.com/embed/GTlmZPjacWs?rel=0&playsinline=1&disablekb=1",
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

const categories = [
  {
    title: "Cloud",
    text: "AWS and cloud technologies",
    icon: <Cloud size={23} />,
  },
  {
    title: "Networking",
    text: "Networks and infrastructure",
    icon: <Network size={23} />,
  },
  {
    title: "Cyber Security",
    text: "Security concepts and tools",
    icon: <Shield size={23} />,
  },
  {
    title: "IT & Tech",
    text: "IT support and administration",
    icon: <BookOpen size={23} />,
  },
];

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
    setSelectedCourse(null);
    setLearningCourse(course);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCourse = (course: Course) => {
    window.history.pushState({ courseId: course.id }, "", `#course=${course.id}`);
    setSelectedCourse(course);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handlePopState = () => {
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

  if (learningCourse) {
    return (
      <CoursePlayer
        course={learningCourse}
        userId={user?.id ?? 0}
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
    <div className="min-h-screen bg-[#030603] text-white">
      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030603]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* LOGO */}

          <button
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-lime-400 bg-lime-400/10">
              <BookOpen className="text-lime-400" size={24} />
            </div>

            <div className="text-left">
              <h1 className="text-2xl font-black">
                Skill<span className="text-lime-400">Forge</span>
              </h1>

              <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500">
                Learn • Practice • Grow
              </p>
            </div>
          </button>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => scrollToSection("home")}
              className="font-medium text-lime-400 transition hover:text-lime-300"
            >
              Home
            </button>

            <button
              onClick={() => scrollToSection("courses")}
              className="text-gray-400 transition hover:text-lime-400"
            >
              Courses
            </button>

            <button
              onClick={() => scrollToSection("categories")}
              className="text-gray-400 transition hover:text-lime-400"
            >
              Categories
            </button>

            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-400 transition hover:text-lime-400"
            >
              About
            </button>
          </nav>

          {/* DESKTOP ACTIONS */}

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-xl p-3 text-gray-400 transition hover:bg-white/5 hover:text-lime-400"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {user ? (
              <>
                <div className="group relative">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-lime-400/20 bg-lime-400/5 px-4 py-2 text-sm transition hover:border-lime-400/40 hover:bg-lime-400/10"
                  >
                    <UserCircle size={18} className="text-lime-400" />
                    Hi,{" "}
                    <span className="font-bold text-lime-400">{user.name}</span>
                  </button>

                  <div className="pointer-events-none invisible absolute right-0 top-full z-[70] w-80 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-2xl border border-white/10 bg-[#080a08]/95 p-5 shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                          <UserCircle size={23} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                        <div className="flex items-center gap-3 text-gray-300">
                          <Mail size={15} className="text-lime-400" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Phone size={15} className="text-lime-400" />
                          <span>+91 {user.phone}</span>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-lime-400/10 bg-lime-400/[0.04] p-3">
                        <p className="text-xs font-semibold text-lime-400">Need Help?</p>
                        <p className="mt-1 text-xs text-gray-500">snera980@gmail.com</p>
                        <p className="mt-1 text-xs text-gray-500">+91 8960513302</p>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/5"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm transition hover:border-red-400/40 hover:text-red-400"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm transition hover:border-lime-400/40"
                >
                  <LogIn size={16} />
                  Login
                </button>

                <button
                  onClick={openSignup}
                  className="rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-lime-300"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-gray-300 md:hidden"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#050805] p-6 md:hidden">
            <div className="flex flex-col gap-5">
              <button
                onClick={() => scrollToSection("home")}
                className="text-left text-lime-400"
              >
                Home
              </button>

              <button
                onClick={() => scrollToSection("courses")}
                className="text-left text-gray-300"
              >
                Courses
              </button>

              <button
                onClick={() => scrollToSection("categories")}
                className="text-left text-gray-300"
              >
                Categories
              </button>

              <button
                onClick={() => scrollToSection("about")}
                className="text-left text-gray-300"
              >
                About
              </button>

              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 text-left text-gray-300"
              >
                <Search size={18} />
                Search Courses
              </button>

              {user ? (
                <>
                  <div className="rounded-xl border border-lime-400/20 bg-lime-400/5 p-4">
                    <div className="flex items-center gap-3">
                      <UserCircle size={20} className="text-lime-400" />
                      <div className="min-w-0">
                        <p className="font-bold text-lime-300">{user.name}</p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-gray-500">
                      <p>+91 {user.phone}</p>
                      <p>Support: snera980@gmail.com</p>
                      <p>Support: +91 8960513302</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-xl border border-white/10 py-3"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    className="rounded-xl border border-white/10 py-3"
                  >
                    Login
                  </button>

                  <button
                    onClick={openSignup}
                    className="rounded-xl bg-lime-400 py-3 font-bold text-black"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}

      <section id="home" className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-lime-400/10 blur-[150px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2">
          {/* HERO LEFT */}

          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/5 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-lime-400" />

              <span className="text-xs text-lime-300">
                Learn skills that matter
              </span>
            </div>

            <h2 className="text-5xl font-black leading-tight sm:text-6xl">
              Build Real
              <br />
              <span className="text-lime-400">Skills</span> for a
              <br />
              Better Future.
            </h2>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-400">
              Learn practical IT and technology skills through structured
              courses, hands-on projects and real-world practice.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <button
                onClick={() => scrollToSection("courses")}
                className="flex items-center gap-2 rounded-xl bg-lime-400 px-7 py-4 font-bold text-black transition hover:bg-lime-300"
              >
                Explore Courses
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => setIntroOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-7 py-4 font-medium transition hover:border-lime-400/40"
              >
                <Play
                  size={17}
                  className="fill-lime-400 text-lime-400"
                />
                Watch Intro
              </button>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 border-t border-white/10 pt-8">
              <div>
                <p className="text-2xl font-bold">10+</p>
                <p className="mt-1 text-sm text-gray-500">Courses</p>
              </div>

              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="mt-1 text-sm text-gray-500">Practical</p>
              </div>

              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="mt-1 text-sm text-gray-500">Access</p>
              </div>
            </div>
          </div>

          {/* HERO RIGHT */}

          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-lime-400/10 blur-3xl" />

            <div className="relative rounded-3xl border border-lime-400/20 bg-[#070907] p-6 shadow-2xl">
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-lime-400">
                    Your Learning
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">Dashboard</h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400/10">
                  <BookOpen size={22} className="text-lime-400" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Current Course</p>

                    <h4 className="mt-1 font-bold">
                      AWS Cloud Fundamentals
                    </h4>
                  </div>

                  <span className="font-bold text-lime-400">68%</span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[68%] rounded-full bg-lime-400" />
                </div>

                <p className="mt-2 text-xs text-gray-600">
                  15 of 22 lessons completed
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <Lesson
                  title="Introduction to AWS"
                  time="12 min"
                  complete
                />

                <Lesson
                  title="Understanding EC2"
                  time="18 min"
                />

                <Lesson
                  title="Amazon S3 Basics"
                  time="15 min"
                />
              </div>

              <button
                onClick={() =>
                  openCourse(courses.find((c) => c.id === "aws")!)
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 py-3 font-bold text-black transition hover:bg-lime-300"
              >
                Continue Learning
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section
        id="categories"
        className="scroll-mt-20 border-y border-white/10 bg-[#040604]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
              Explore Skills
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Learn what matters
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              Choose a learning path and build practical technical skills.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <button
                key={category.title}
                onClick={() => {
                  setSelectedCategory(category.title);
                  scrollToSection("courses");
                }}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left transition hover:-translate-y-1 hover:border-lime-400/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400 transition group-hover:bg-lime-400 group-hover:text-black">
                  {category.icon}
                </div>

                <h3 className="mt-5 font-bold">{category.title}</h3>

                <p className="mt-2 text-sm text-gray-500">
                  {category.text}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-lime-400">
                  Explore
                  <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= COURSES ================= */}

      <section
        id="courses"
        className="scroll-mt-20 mx-auto max-w-7xl px-6 py-20"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
              Popular Courses
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Start Learning Today
            </h2>

            <p className="mt-3 text-gray-500">
              Beginner-friendly courses focused on practical skills.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedCategory !== "All" && (
              <button
                onClick={() => setSelectedCategory("All")}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:border-lime-400/30 hover:text-lime-400"
              >
                Clear Filter
              </button>
            )}

            <button
              onClick={() => setSelectedCategory("All")}
              className="flex items-center gap-2 text-sm font-semibold text-lime-400"
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {selectedCategory !== "All" && (
          <div className="mt-6 rounded-xl border border-lime-400/20 bg-lime-400/5 px-4 py-3 text-sm">
            Showing courses in{" "}
            <span className="font-bold text-lime-400">
              {selectedCategory}
            </span>
          </div>
        )}

        {filteredCourses.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Course
                key={course.id}
                course={course}
                onClick={() => openCourse(course)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <Search className="mx-auto text-gray-600" size={40} />

            <h3 className="mt-4 text-xl font-bold">
              No courses found
            </h3>

            <p className="mt-2 text-gray-500">
              Try searching for another course.
            </p>
          </div>
        )}
      </section>

      {/* ================= ABOUT ================= */}

      <section
        id="about"
        className="scroll-mt-20 border-t border-white/10 bg-[#040604]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
              Why SkillForge
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Learn. Practice. Grow.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Feature
              icon={<BookOpen />}
              title="Structured Learning"
              text="Follow organized courses and step-by-step learning paths."
            />

            <Feature
              icon={<Users />}
              title="Practical Skills"
              text="Learn through real-world examples and hands-on practice."
            />

            <Feature
              icon={<CheckCircle />}
              title="Track Progress"
              text="Complete lessons and continue exactly where you stopped."
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="px-6 py-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-lime-400/20 bg-lime-400/[0.04] p-10 text-center sm:p-16">
          <div className="absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-lime-400/10 blur-[100px]" />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-400">
              Start Your Journey
            </p>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              Forge Your Skills.
              <br />
              Build Your Future.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-gray-500">
              Start learning practical technology skills with SkillForge.
            </p>

            <button
              onClick={() => scrollToSection("courses")}
              className="mt-8 rounded-xl bg-lime-400 px-7 py-4 font-bold text-black transition hover:bg-lime-300"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black">
              Skill<span className="text-lime-400">Forge</span>
            </h3>

            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-gray-600">
              Learn • Practice • Grow
            </p>
          </div>

          <p className="text-sm text-gray-600">
            © 2026 SkillForge. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ================= SEARCH MODAL ================= */}

      {searchOpen && (
        <Modal onClose={() => setSearchOpen(false)}>
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-lime-400">
                  SkillForge Search
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Find a course
                </h2>
              </div>

              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:text-white"
              >
                <X />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4">
              <Search className="text-gray-500" size={20} />

              <input
                autoFocus
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search AWS, Linux, Networking..."
                className="w-full bg-transparent py-4 text-white outline-none placeholder:text-gray-600"
              />
            </div>

            <div className="mt-5 max-h-80 space-y-2 overflow-y-auto">
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSearchOpen(false);
                    openCourse(course);
                  }}
                  className="flex w-full items-center gap-4 rounded-xl border border-white/5 p-4 text-left transition hover:border-lime-400/30 hover:bg-lime-400/5"
                >
                  <span className="text-3xl">{course.emoji}</span>

                  <div>
                    <p className="font-bold">{course.title}</p>

                    <p className="mt-1 text-xs text-gray-500">
                      {course.category} • {course.lessons} Lessons
                    </p>
                  </div>

                  <ChevronRight className="ml-auto text-gray-600" size={18} />
                </button>
              ))}

              {filteredCourses.length === 0 && (
                <p className="py-8 text-center text-gray-500">
                  No matching courses.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ================= AUTH MODAL ================= */}

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
          onSuccess={handleAuth}
        />
      )}

      {/* ================= INTRO MODAL ================= */}

      {introOpen && (
        <Modal onClose={() => setIntroOpen(false)}>
          <div className="w-full max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400/10">
              <Play className="fill-lime-400 text-lime-400" size={28} />
            </div>

            <h2 className="mt-6 text-3xl font-black">
              Welcome to SkillForge
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-gray-500">
              SkillForge is built for practical IT and technology learning.
              Courses will include structured lessons, projects and
              hands-on practice.
            </p>

            <button
              onClick={() => {
                setIntroOpen(false);
                scrollToSection("courses");
              }}
              className="mt-7 rounded-xl bg-lime-400 px-7 py-3 font-bold text-black hover:bg-lime-300"
            >
              Explore Courses
            </button>
          </div>
        </Modal>
      )}
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

  const totalCourseLessons = course.id === "security" ? 57 : course.lessons;
  const completedCourseLessons = (() => {
    if (!user || course.id !== "security") return 0;

    const prefix = `skillforge_lecture_progress_${course.id}_${user.id}_`;
    let count = 0;

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(prefix) && key.endsWith("_complete") && localStorage.getItem(key) === "true") {
        count += 1;
      }
    }

    return Math.min(count, totalCourseLessons);
  })();

  const progressPercent = totalCourseLessons > 0
    ? Math.round((completedCourseLessons / totalCourseLessons) * 100)
    : 0;


  return (
    <div className="min-h-screen bg-[#030603] text-white">
      <header className="border-b border-white/10 bg-[#030603]/95">
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
                      <span className="text-4xl font-black">{progressPercent}%</span>
                      <span className="text-sm text-lime-400">Enrolled</span>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-lime-400 transition-all duration-700"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-gray-600">
                      {completedCourseLessons} of {totalCourseLessons} lessons completed
                    </p>

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

function CoursePlayer({
  course,
  userId,
  onBack,
}: {
  course: Course;
  userId: number;
  onBack: () => void;
}) {
  const modules = course.id === "security" ? securityModules : [];
  const lecture = modules[0]?.lectures[0];
  const progressKey = `skillforge_lecture_progress_${course.id}_${userId}_${lecture?.id ?? ""}`;
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
          <div className="aspect-video bg-black">
            <iframe
              className="h-full w-full"
              src={lecture.videoUrl}
              title={lecture.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
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

/* ================= LESSON ================= */

function Lesson({
  title,
  time,
  complete = false,
}: {
  title: string;
  time: string;
  complete?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            complete
              ? "bg-lime-400 text-black"
              : "border border-white/10 text-gray-500"
          }`}
        >
          {complete ? (
            <CheckCircle size={17} />
          ) : (
            <Play size={15} />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold">{title}</p>

          <p className="text-xs text-gray-600">
            Lesson • {time}
          </p>
        </div>
      </div>

      {complete && (
        <span className="text-xs font-bold text-lime-400">
          Done
        </span>
      )}
    </div>
  );
}

/* ================= COURSE CARD ================= */

function Course({
  course,
  onClick,
}: {
  course: Course;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#080a08] text-left transition hover:-translate-y-1 hover:border-lime-400/30"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-lime-400/10 via-[#081008] to-black">
        <div className="absolute h-32 w-32 rounded-full bg-lime-400/10 blur-3xl" />

        <span className="relative text-6xl transition group-hover:scale-110">
          {course.emoji}
        </span>

        <span className="absolute left-4 top-4 rounded-full border border-lime-400/20 bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-lime-400">
          SkillForge
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{course.title}</h3>
        </div>

        <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
          {course.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex gap-3 text-xs text-gray-600">
            <span>{course.lessons} Lessons</span>
            <span>{course.duration}</span>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 text-black transition group-hover:bg-lime-300">
            <ChevronRight size={17} />
          </div>
        </div>
      </div>
    </button>
  );
}

/* ================= FEATURE ================= */

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition hover:border-lime-400/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        {text}
      </p>
    </div>
  );
}

export default App;