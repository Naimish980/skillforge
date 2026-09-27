import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Layers3,
  PlayCircle,
  Pencil,
  Trash2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Smartphone,
  Users,
  Wallet,
  X,
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

type Course = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  price: number;
  thumbnail: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  module_count: number;
  lecture_count: number;
  quiz_count: number;
};

type View = "dashboard" | "students" | "courses";

type ModuleItem = {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  module_order: number;
  created_at: string;
  updated_at: string;
};

type ModuleForm = {
  title: string;
  description: string;
  moduleOrder: string;
};

type LectureItem = {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  lecture_order: number;
  duration: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
};

type LectureForm = {
  title: string;
  description: string;
  videoUrl: string;
  lectureOrder: string;
  duration: string;
  isFree: boolean;
};

type CourseForm = {
  title: string;
  description: string;
  category: string;
  level: string;
  price: string;
  thumbnail: string;
  isPublished: boolean;
};

const emptyCourseForm: CourseForm = {
  title: "",
  description: "",
  category: "",
  level: "Beginner",
  price: "799",
  thumbnail: "",
  isPublished: false,
};

const emptyModuleForm: ModuleForm = {
  title: "",
  description: "",
  moduleOrder: "",
};

const emptyLectureForm: LectureForm = {
  title: "",
  description: "",
  videoUrl: "",
  lectureOrder: "",
  duration: "10",
  isFree: false,
};

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

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

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
      />
    </label>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
      />
    </label>
  );
}

export default function AdminDashboard() {
  const [view, setView] = useState<View>("dashboard");

  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [search, setSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [error, setError] = useState("");

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourseForm);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [courseFormError, setCourseFormError] = useState("");
  const [courseFormSuccess, setCourseFormSuccess] = useState("");

  const [contentCourse, setContentCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);
  const [moduleForm, setModuleForm] = useState<ModuleForm>(emptyModuleForm);
  const [creatingModule, setCreatingModule] = useState(false);
  const [moduleFormError, setModuleFormError] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<number | null>(null);

  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [lecturesByModule, setLecturesByModule] = useState<Record<number, LectureItem[]>>({});
  const [loadingLectures, setLoadingLectures] = useState<Record<number, boolean>>({});
  const [lectureError, setLectureError] = useState("");
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [lectureForm, setLectureForm] = useState<LectureForm>(emptyLectureForm);
  const [creatingLecture, setCreatingLecture] = useState(false);
  const [lectureFormError, setLectureFormError] = useState("");
  const [editingLectureId, setEditingLectureId] = useState<number | null>(null);
  const [deletingLectureId, setDeletingLectureId] = useState<number | null>(null);
  const [lectureModuleId, setLectureModuleId] = useState<number | null>(null);

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

      const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load admin dashboard.",
        );
      }

      setAdmin(data.admin ?? null);
      setStats(data.stats ?? null);
    } catch (err) {
      console.error("Admin dashboard loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load admin dashboard.",
      );
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

      const response = await fetch(
        `${API_BASE_URL}/api/admin/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load students.",
        );
      }

      setStudents(
        Array.isArray(data.students)
          ? data.students
          : [],
      );
    } catch (err) {
      console.error("Admin students loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load students.",
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadCourses = async () => {
    const token = getToken();

    if (!token) {
      setError("Admin authentication token is missing.");
      return;
    }

    try {
      setLoadingCourses(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load courses.",
        );
      }

      setCourses(
        Array.isArray(data.courses)
          ? data.courses
          : [],
      );
    } catch (err) {
      console.error("Admin courses loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load courses.",
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (view === "students") {
      void loadStudents();
    }

    if (view === "courses") {
      void loadCourses();
    }
  }, [view]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) =>
      [
        student.name,
        student.email,
        student.phone,
        String(student.id),
      ].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [students, search]);

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) =>
      [
        course.title,
        course.description || "",
        course.category || "",
        course.level || "",
        String(course.id),
      ].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [courses, courseSearch]);

  const refreshCurrentView = () => {
    if (view === "students") {
      void loadStudents();
      void loadDashboard();
      return;
    }

    if (view === "courses") {
      void loadCourses();
      void loadDashboard();
      return;
    }

    void loadDashboard();
  };

  const isRefreshing =
    loadingDashboard ||
    loadingStudents ||
    loadingCourses;

  const openAddCourse = () => {
    setCourseForm(emptyCourseForm);
    setCourseFormError("");
    setCourseFormSuccess("");
    setShowAddCourse(true);
  };

  const closeAddCourse = () => {
    if (creatingCourse) return;

    setShowAddCourse(false);
    setCourseForm(emptyCourseForm);
    setCourseFormError("");
    setCourseFormSuccess("");
  };

  const updateCourseForm = (
    field: keyof CourseForm,
    value: string | boolean,
  ) => {
    setCourseForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const createCourse = async () => {
    const token = getToken();

    if (!token) {
      setCourseFormError(
        "Admin authentication token is missing.",
      );
      return;
    }

    if (!courseForm.title.trim()) {
      setCourseFormError("Course title is required.");
      return;
    }

    if (!courseForm.category.trim()) {
      setCourseFormError("Course category is required.");
      return;
    }

    if (!courseForm.level.trim()) {
      setCourseFormError("Course level is required.");
      return;
    }

    const price = Number(courseForm.price);

    if (!Number.isFinite(price) || price < 0) {
      setCourseFormError(
        "Please enter a valid course price.",
      );
      return;
    }

    try {
      setCreatingCourse(true);
      setCourseFormError("");
      setCourseFormSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/courses`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: courseForm.title.trim(),
            description:
              courseForm.description.trim() || null,
            category: courseForm.category.trim(),
            level: courseForm.level.trim(),
            price,
            thumbnail:
              courseForm.thumbnail.trim() || null,
            isPublished: courseForm.isPublished,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to create course.",
        );
      }

      setCourseFormSuccess(
        "Course created successfully.",
      );

      await loadCourses();

      setCourseForm(emptyCourseForm);
    } catch (err) {
      console.error("Create course error:", err);

      setCourseFormError(
        err instanceof Error
          ? err.message
          : "Unable to create course.",
      );
    } finally {
      setCreatingCourse(false);
    }
  };


  const loadCourseContent = async (course: Course) => {
    const token = getToken();

    if (!token) {
      setContentError("Admin authentication token is missing.");
      return;
    }

    try {
      setLoadingContent(true);
      setContentError("");
      setContentCourse(course);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/courses/${course.id}/content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load course content.",
        );
      }

      setContentCourse(data.course ?? course);
      setModules(
        Array.isArray(data.modules) ? data.modules : [],
      );
    } catch (err) {
      console.error("Course content loading error:", err);

      setContentError(
        err instanceof Error
          ? err.message
          : "Unable to load course content.",
      );
    } finally {
      setLoadingContent(false);
    }
  };

  const closeCourseContent = () => {
    if (
      creatingModule ||
      deletingModuleId !== null ||
      creatingLecture ||
      deletingLectureId !== null
    ) {
      return;
    }

    setContentCourse(null);
    setModules([]);
    setContentError("");
    setShowAddModule(false);
    setModuleForm(emptyModuleForm);
    setModuleFormError("");
    setEditingModuleId(null);
  };

  const openAddModule = () => {
    setEditingModuleId(null);
    setModuleForm({
      ...emptyModuleForm,
      moduleOrder:
        modules.length > 0
          ? String(
              Math.max(
                ...modules.map((module) => module.module_order),
              ) + 1,
            )
          : "1",
    });
    setModuleFormError("");
    setShowAddModule(true);
  };

  const openEditModule = (module: ModuleItem) => {
    setEditingModuleId(module.id);
    setModuleForm({
      title: module.title,
      description: module.description || "",
      moduleOrder: String(module.module_order),
    });
    setModuleFormError("");
    setShowAddModule(true);
  };

  const closeModuleForm = () => {
    if (creatingModule) return;

    setShowAddModule(false);
    setEditingModuleId(null);
    setModuleForm(emptyModuleForm);
    setModuleFormError("");
  };

  const updateModuleForm = (
    field: keyof ModuleForm,
    value: string,
  ) => {
    setModuleForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveModule = async () => {
    const token = getToken();

    if (!token) {
      setModuleFormError(
        "Admin authentication token is missing.",
      );
      return;
    }

    if (!contentCourse) {
      setModuleFormError("Course not selected.");
      return;
    }

    if (!moduleForm.title.trim()) {
      setModuleFormError("Module title is required.");
      return;
    }

    const moduleOrder = Number(moduleForm.moduleOrder);

    if (
      !Number.isInteger(moduleOrder) ||
      moduleOrder < 1
    ) {
      setModuleFormError(
        "Module order must be a positive number.",
      );
      return;
    }

    try {
      setCreatingModule(true);
      setModuleFormError("");

      const isEditing = editingModuleId !== null;

      const url = isEditing
        ? `${API_BASE_URL}/api/admin/modules/${editingModuleId}`
        : `${API_BASE_URL}/api/admin/courses/${contentCourse.id}/modules`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: moduleForm.title.trim(),
          description:
            moduleForm.description.trim() || null,
          moduleOrder,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            (isEditing
              ? "Unable to update module."
              : "Unable to create module."),
        );
      }

      await loadCourseContent(contentCourse);
      await loadCourses();

      setShowAddModule(false);
      setEditingModuleId(null);
      setModuleForm(emptyModuleForm);
      setModuleFormError("");
    } catch (err) {
      console.error("Save module error:", err);

      setModuleFormError(
        err instanceof Error
          ? err.message
          : "Unable to save module.",
      );
    } finally {
      setCreatingModule(false);
    }
  };

  const deleteModule = async (module: ModuleItem) => {
    const token = getToken();

    if (!token) {
      setContentError(
        "Admin authentication token is missing.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${module.title}"? This will also delete lectures and quizzes inside this module.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingModuleId(module.id);
      setContentError("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/modules/${module.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to delete module.",
        );
      }

      if (contentCourse) {
        await loadCourseContent(contentCourse);
      }

      await loadCourses();
    } catch (err) {
      console.error("Delete module error:", err);

      setContentError(
        err instanceof Error
          ? err.message
          : "Unable to delete module.",
      );
    } finally {
      setDeletingModuleId(null);
    }
  };


  const loadLectures = async (moduleId: number, force = false) => {
    const token = getToken();

    if (!token) {
      setLectureError("Admin authentication token is missing.");
      return;
    }

    if (!force && lecturesByModule[moduleId]) {
      setExpandedModuleId(moduleId);
      return;
    }

    try {
      setLoadingLectures((current) => ({
        ...current,
        [moduleId]: true,
      }));
      setLectureError("");
      setExpandedModuleId(moduleId);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/modules/${moduleId}/lectures`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to load lectures.",
        );
      }

      setLecturesByModule((current) => ({
        ...current,
        [moduleId]: Array.isArray(data.lectures)
          ? data.lectures
          : [],
      }));
    } catch (err) {
      console.error("Lecture loading error:", err);
      setLectureError(
        err instanceof Error
          ? err.message
          : "Unable to load lectures.",
      );
    } finally {
      setLoadingLectures((current) => ({
        ...current,
        [moduleId]: false,
      }));
    }
  };

  const openAddLecture = (module: ModuleItem) => {
    const existingLectures = lecturesByModule[module.id] || [];
    const nextOrder =
      existingLectures.length > 0
        ? Math.max(
            ...existingLectures.map(
              (lecture) => lecture.lecture_order,
            ),
          ) + 1
        : 1;

    setLectureModuleId(module.id);
    setEditingLectureId(null);
    setLectureForm({
      ...emptyLectureForm,
      lectureOrder: String(nextOrder),
    });
    setLectureFormError("");
    setShowLectureForm(true);
  };

  const openEditLecture = (
    moduleId: number,
    lecture: LectureItem,
  ) => {
    setLectureModuleId(moduleId);
    setEditingLectureId(lecture.id);
    setLectureForm({
      title: lecture.title,
      description: lecture.description || "",
      videoUrl: lecture.video_url || "",
      lectureOrder: String(lecture.lecture_order),
      duration: String(lecture.duration ?? 0),
      isFree: Boolean(lecture.is_free),
    });
    setLectureFormError("");
    setShowLectureForm(true);
  };

  const closeLectureForm = () => {
    if (creatingLecture) return;

    setShowLectureForm(false);
    setLectureModuleId(null);
    setEditingLectureId(null);
    setLectureForm(emptyLectureForm);
    setLectureFormError("");
  };

  const updateLectureForm = (
    field: keyof LectureForm,
    value: string | boolean,
  ) => {
    setLectureForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveLecture = async () => {
    const token = getToken();

    if (!token) {
      setLectureFormError(
        "Admin authentication token is missing.",
      );
      return;
    }

    if (!lectureModuleId) {
      setLectureFormError("Module not selected.");
      return;
    }

    if (!lectureForm.title.trim()) {
      setLectureFormError("Lecture title is required.");
      return;
    }

    if (!lectureForm.videoUrl.trim()) {
      setLectureFormError("Video URL is required.");
      return;
    }

    const lectureOrder = Number(lectureForm.lectureOrder);
    const duration = Number(lectureForm.duration);

    if (
      !Number.isInteger(lectureOrder) ||
      lectureOrder < 1
    ) {
      setLectureFormError(
        "Lecture order must be a positive number.",
      );
      return;
    }

    if (!Number.isFinite(duration) || duration < 0) {
      setLectureFormError(
        "Duration must be a valid number of minutes.",
      );
      return;
    }

    try {
      setCreatingLecture(true);
      setLectureFormError("");

      const isEditing = editingLectureId !== null;

      const url = isEditing
        ? `${API_BASE_URL}/api/admin/lectures/${editingLectureId}`
        : `${API_BASE_URL}/api/admin/modules/${lectureModuleId}/lectures`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: lectureForm.title.trim(),
          description:
            lectureForm.description.trim() || null,
          videoUrl: lectureForm.videoUrl.trim(),
          lectureOrder,
          duration,
          isFree: lectureForm.isFree,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            (isEditing
              ? "Unable to update lecture."
              : "Unable to create lecture."),
        );
      }

      await loadLectures(lectureModuleId, true);
      await loadCourses();

      setShowLectureForm(false);
      setLectureModuleId(null);
      setEditingLectureId(null);
      setLectureForm(emptyLectureForm);
      setLectureFormError("");
    } catch (err) {
      console.error("Save lecture error:", err);
      setLectureFormError(
        err instanceof Error
          ? err.message
          : "Unable to save lecture.",
      );
    } finally {
      setCreatingLecture(false);
    }
  };

  const deleteLecture = async (
    moduleId: number,
    lecture: LectureItem,
  ) => {
    const token = getToken();

    if (!token) {
      setLectureError(
        "Admin authentication token is missing.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${lecture.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingLectureId(lecture.id);
      setLectureError("");

      const response = await fetch(
        `${API_BASE_URL}/api/admin/lectures/${lecture.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to delete lecture.",
        );
      }

      await loadLectures(moduleId, true);
      await loadCourses();
    } catch (err) {
      console.error("Delete lecture error:", err);
      setLectureError(
        err instanceof Error
          ? err.message
          : "Unable to delete lecture.",
      );
    } finally {
      setDeletingLectureId(null);
    }
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
              <h1 className="text-xl font-black tracking-tight">
                SkillForge Admin
              </h1>

              <p className="text-xs text-slate-500">
                Administration Dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshCurrentView}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                isRefreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1210px] px-5 py-9 lg:px-0">
        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-300 transition hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* DASHBOARD */}

        {view === "dashboard" ? (
          <>
            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#10182d] to-[#0b1325] p-6 shadow-2xl shadow-black/10 sm:p-7">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Admin Access
                  </span>

                  <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                    Welcome, {admin?.name || "Admin"} 👋
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {admin?.email ||
                      "Loading administrator details..."}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-4">
                  <BookOpen
                    className="text-indigo-400"
                    size={22}
                  />

                  <div>
                    <p className="text-xs text-slate-500">
                      Platform
                    </p>

                    <p className="font-bold text-white">
                      SkillForge
                    </p>
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
                value={formatCurrency(
                  stats?.revenue ?? 0,
                )}
                description="Successful payment revenue"
                icon={<Wallet size={23} />}
                iconClassName="bg-amber-500/10 text-amber-400"
              />
            </section>

            <section className="mt-10">
              <h3 className="text-xl font-black">
                Management
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage the core SkillForge platform from one place.
              </p>

              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setView("students")}
                  className="group rounded-2xl border border-white/10 bg-slate-900 p-6 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-slate-800/80"
                >
                  <Users
                    className="text-indigo-400"
                    size={27}
                  />

                  <h4 className="mt-5 text-lg font-black">
                    Students
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    View registered students and their course activity.
                  </p>

                  <span className="mt-5 inline-flex rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300">
                    Manage Students →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setView("courses")}
                  className="group rounded-2xl border border-white/10 bg-slate-900 p-6 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-slate-800/80"
                >
                  <BookOpen
                    className="text-cyan-400"
                    size={27}
                  />

                  <h4 className="mt-5 text-lg font-black">
                    Courses
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Manage courses, modules, lectures and quizzes.
                  </p>

                  <span className="mt-5 inline-flex rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300">
                    Manage Courses →
                  </span>
                </button>

                <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
                  <CreditCard
                    className="text-emerald-400"
                    size={27}
                  />

                  <h4 className="mt-5 text-lg font-black">
                    Payments
                  </h4>

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
        ) : view === "students" ? (
          /* STUDENTS */

          <section>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <button
                  type="button"
                  onClick={() => setView("dashboard")}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
                >
                  <ArrowLeft size={17} />
                  Back to Dashboard
                </button>

                <h2 className="text-3xl font-black">
                  Students
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Registered SkillForge students and their enrollment activity.
                </p>
              </div>

              <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5">
                <Search
                  size={18}
                  className="shrink-0 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search name, email, phone..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="font-bold text-white">
                    All Students
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {filteredStudents.length} student
                    {filteredStudents.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadStudents}
                  disabled={loadingStudents}
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  title="Refresh students"
                >
                  <RefreshCw
                    size={16}
                    className={
                      loadingStudents
                        ? "animate-spin"
                        : ""
                    }
                  />
                </button>
              </div>

              {loadingStudents ? (
                <div className="flex min-h-64 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading students...
                    </p>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex min-h-64 items-center justify-center px-6 text-center">
                  <div>
                    <Users
                      className="mx-auto text-slate-700"
                      size={40}
                    />

                    <p className="mt-4 font-semibold text-slate-300">
                      No students found
                    </p>

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
                            {student.name
                              ?.charAt(0)
                              .toUpperCase() || "S"}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-white">
                                {student.name}
                              </h4>

                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                Student
                              </span>
                            </div>

                            <div className="mt-2 flex flex-col gap-1.5 text-sm text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-5">
                              <span className="inline-flex items-center gap-1.5">
                                <Mail size={14} />
                                {student.email}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <Smartphone size={14} />
                                {student.phone || "—"}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                Joined{" "}
                                {formatDate(
                                  student.created_at,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:min-w-[360px]">
                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Student ID
                            </p>

                            <p className="mt-1 font-bold text-slate-200">
                              #{student.id}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Enrollments
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 font-bold text-slate-200">
                              <BookOpen
                                size={14}
                                className="text-cyan-400"
                              />
                              {student.enrollment_count}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Status
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 font-bold text-emerald-400">
                              <CheckCircle2 size={14} />
                              Active
                            </p>
                          </div>
                        </div>
                      </div>

                      {student.enrolled_course_ids.length >
                        0 && (
                        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Enrolled Course IDs
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {student.enrolled_course_ids.map(
                              (courseId) => (
                                <span
                                  key={`${student.id}-${courseId}`}
                                  className="rounded-lg border border-indigo-400/10 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-semibold text-indigo-300"
                                >
                                  {courseId}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          /* COURSES */

          <section>
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <button
                  type="button"
                  onClick={() => setView("dashboard")}
                  className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
                >
                  <ArrowLeft size={17} />
                  Back to Dashboard
                </button>

                <h2 className="text-3xl font-black">
                  Courses
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Manage SkillForge courses, modules, lectures and quizzes.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 sm:w-80">
                  <Search
                    size={18}
                    className="shrink-0 text-slate-500"
                  />

                  <input
                    value={courseSearch}
                    onChange={(event) =>
                      setCourseSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Search courses..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={openAddCourse}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-400"
                >
                  <Plus size={18} />
                  Add Course
                </button>
              </div>
            </div>

            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="font-bold text-white">
                    All Courses
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {filteredCourses.length} course
                    {filteredCourses.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadCourses}
                  disabled={loadingCourses}
                  className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  title="Refresh courses"
                >
                  <RefreshCw
                    size={16}
                    className={
                      loadingCourses
                        ? "animate-spin"
                        : ""
                    }
                  />
                </button>
              </div>

              {loadingCourses ? (
                <div className="flex min-h-64 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading courses...
                    </p>
                  </div>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="flex min-h-72 items-center justify-center px-6 text-center">
                  <div>
                    <BookOpen
                      className="mx-auto text-slate-700"
                      size={46}
                    />

                    <p className="mt-4 text-lg font-bold text-slate-300">
                      No courses found
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Create your first course to start building the SkillForge catalog.
                    </p>

                    <button
                      type="button"
                      onClick={openAddCourse}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-400"
                    >
                      <Plus size={17} />
                      Add Course
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-5 transition hover:bg-slate-800/40"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                            <BookOpen size={26} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-black text-white">
                                {course.title}
                              </h3>

                              {course.is_published ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                  <CheckCircle2 size={12} />
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                  <Clock3 size={12} />
                                  Draft
                                </span>
                              )}
                            </div>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                              {course.description ||
                                "No course description added yet."}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {course.category && (
                                <span className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-1.5 text-xs font-semibold text-slate-300">
                                  {course.category}
                                </span>
                              )}

                              {course.level && (
                                <span className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-1.5 text-xs font-semibold text-slate-300">
                                  {course.level}
                                </span>
                              )}

                              <span className="rounded-lg border border-indigo-400/10 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300">
                                {formatCurrency(course.price)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[470px]">
                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Course ID
                            </p>

                            <p className="mt-1 font-bold text-slate-200">
                              #{course.id}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Modules
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 font-bold text-slate-200">
                              <Layers3
                                size={14}
                                className="text-indigo-400"
                              />
                              {course.module_count}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Lectures
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 font-bold text-slate-200">
                              <BookOpen
                                size={14}
                                className="text-cyan-400"
                              />
                              {course.lecture_count}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              Quizzes
                            </p>

                            <p className="mt-1 flex items-center gap-1.5 font-bold text-slate-200">
                              <CheckCircle2
                                size={14}
                                className="text-emerald-400"
                              />
                              {course.quiz_count}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            Created{" "}
                            {formatDate(
                              course.created_at,
                            )}
                          </span>

                          <span>
                            Updated{" "}
                            {formatDate(
                              course.updated_at,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled
                            className="rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-500"
                          >
                            Edit — Next
                          </button>

                          <button
                            type="button"
                            onClick={() => void loadCourseContent(course)}
                            className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                          >
                            Manage Content
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}


        {/* COURSE CONTENT MANAGER */}

        {contentCourse && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b1222] shadow-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1222] px-6 py-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      Course Content
                    </span>

                    {contentCourse.is_published ? (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Draft
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 truncate text-xl font-black text-white">
                    {contentCourse.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Course #{contentCourse.id} · {modules.length} module
                    {modules.length === 1 ? "" : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCourseContent}
                  disabled={
                    creatingModule ||
                    deletingModuleId !== null ||
                    creatingLecture ||
                    deletingLectureId !== null
                  }
                  className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                {contentError && (
                  <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <span>{contentError}</span>

                    <button
                      type="button"
                      onClick={() => setContentError("")}
                      className="text-red-300 hover:text-white"
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}

                {loadingContent ? (
                  <div className="flex min-h-72 items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

                      <p className="mt-4 text-sm text-slate-500">
                        Loading course content...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-bold text-white">
                          Modules
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Build your course structure from the admin portal.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={openAddModule}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-400"
                      >
                        <Plus size={17} />
                        Add Module
                      </button>
                    </div>

                    {modules.length === 0 ? (
                      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30 px-6 text-center">
                        <div>
                          <Layers3
                            className="mx-auto text-slate-700"
                            size={44}
                          />

                          <p className="mt-4 font-bold text-slate-300">
                            No modules yet
                          </p>

                          <p className="mt-2 text-sm text-slate-600">
                            Add the first module to start building this course.
                          </p>

                          <button
                            type="button"
                            onClick={openAddModule}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-400"
                          >
                            <Plus size={17} />
                            Add First Module
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {modules.map((module, index) => (
                          <div
                            key={module.id}
                            className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-indigo-400/20"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex min-w-0 gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-black text-indigo-400">
                                  {module.module_order ||
                                    index + 1}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="font-black text-white">
                                    {module.title}
                                  </h4>

                                  <p className="mt-1 text-xs text-slate-600">
                                    Module ID #{module.id}
                                  </p>

                                  <p className="mt-3 text-sm leading-6 text-slate-400">
                                    {module.description ||
                                      "No module description added."}
                                  </p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModule(module)
                                  }
                                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void deleteModule(module)
                                  }
                                  disabled={
                                    deletingModuleId ===
                                    module.id
                                  }
                                  className="rounded-lg border border-red-400/10 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                                >
                                  {deletingModuleId ===
                                  module.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                  Order {module.module_order}
                                </span>

                                <span className="rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                                  {(lecturesByModule[module.id] || []).length} lecture
                                  {(lecturesByModule[module.id] || []).length === 1 ? "" : "s"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void loadLectures(
                                      module.id,
                                      true,
                                    )
                                  }
                                  disabled={
                                    Boolean(
                                      loadingLectures[module.id],
                                    )
                                  }
                                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                                >
                                  {loadingLectures[module.id]
                                    ? "Loading..."
                                    : expandedModuleId === module.id
                                      ? "Refresh"
                                      : "View Lectures"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openAddLecture(module)
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                                >
                                  <Plus size={14} />
                                  Add Lecture
                                </button>
                              </div>
                            </div>

                            {expandedModuleId === module.id && (
                              <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                                {lectureError && (
                                  <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                                    {lectureError}
                                  </div>
                                )}

                                {loadingLectures[module.id] ? (
                                  <div className="py-8 text-center text-xs text-slate-500">
                                    Loading lectures...
                                  </div>
                                ) : (lecturesByModule[module.id] || []).length === 0 ? (
                                  <div className="py-7 text-center">
                                    <PlayCircle
                                      className="mx-auto text-slate-700"
                                      size={32}
                                    />
                                    <p className="mt-3 text-sm font-bold text-slate-400">
                                      No lectures yet
                                    </p>
                                    <p className="mt-1 text-xs text-slate-600">
                                      Add the first lecture to this module.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {(lecturesByModule[module.id] || []).map(
                                      (lecture) => (
                                        <div
                                          key={lecture.id}
                                          className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                          <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                                              <PlayCircle size={17} />
                                            </div>

                                            <div className="min-w-0">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <p className="truncate text-sm font-bold text-white">
                                                  {lecture.lecture_order}.{" "}
                                                  {lecture.title}
                                                </p>

                                                {lecture.is_free && (
                                                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                                    Free
                                                  </span>
                                                )}
                                              </div>

                                              <p className="mt-1 text-xs text-slate-600">
                                                {lecture.duration} min · Video URL added
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex shrink-0 items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openEditLecture(
                                                  module.id,
                                                  lecture,
                                                )
                                              }
                                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
                                            >
                                              <Pencil size={13} />
                                              Edit
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                void deleteLecture(
                                                  module.id,
                                                  lecture,
                                                )
                                              }
                                              disabled={
                                                deletingLectureId ===
                                                lecture.id
                                              }
                                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/10 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                                            >
                                              <Trash2 size={13} />
                                              {deletingLectureId ===
                                              lecture.id
                                                ? "Deleting..."
                                                : "Delete"}
                                            </button>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {showAddModule && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1222] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                      <div>
                        <h4 className="text-lg font-black text-white">
                          {editingModuleId !== null
                            ? "Edit Module"
                            : "Add Module"}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          {editingModuleId !== null
                            ? "Update this module."
                            : "Create a new module for this course."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={closeModuleForm}
                        disabled={creatingModule}
                        className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-5 p-6">
                      {moduleFormError && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                          {moduleFormError}
                        </div>
                      )}

                      <FormInput
                        label="Module Title"
                        value={moduleForm.title}
                        onChange={(value) =>
                          updateModuleForm(
                            "title",
                            value,
                          )
                        }
                        placeholder="e.g. Networking Basics"
                      />

                      <FormTextarea
                        label="Description"
                        value={moduleForm.description}
                        onChange={(value) =>
                          updateModuleForm(
                            "description",
                            value,
                          )
                        }
                        placeholder="Describe what students will learn in this module..."
                      />

                      <FormInput
                        label="Module Order"
                        type="number"
                        value={moduleForm.moduleOrder}
                        onChange={(value) =>
                          updateModuleForm(
                            "moduleOrder",
                            value,
                          )
                        }
                        placeholder="1"
                      />

                      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={closeModuleForm}
                          disabled={creatingModule}
                          className="rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => void saveModule()}
                          disabled={creatingModule}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {creatingModule ? (
                            <>
                              <RefreshCw
                                size={17}
                                className="animate-spin"
                              />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={17} />
                              {editingModuleId !== null
                                ? "Update Module"
                                : "Create Module"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* LECTURE MODAL */}

        {showLectureForm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1222] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1222]/95 px-6 py-5 backdrop-blur-xl">
                <div>
                  <h3 className="text-xl font-black text-white">
                    {editingLectureId !== null
                      ? "Edit Lecture"
                      : "Add Lecture"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Add video, order, duration and access settings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeLectureForm}
                  disabled={creatingLecture}
                  className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-5 p-6">
                {lectureFormError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {lectureFormError}
                  </div>
                )}

                <FormInput
                  label="Lecture Title"
                  value={lectureForm.title}
                  onChange={(value) =>
                    updateLectureForm("title", value)
                  }
                  placeholder="e.g. What is Computer Networking?"
                />

                <FormTextarea
                  label="Description"
                  value={lectureForm.description}
                  onChange={(value) =>
                    updateLectureForm(
                      "description",
                      value,
                    )
                  }
                  placeholder="What will students learn in this lecture?"
                />

                <FormInput
                  label="Video URL"
                  value={lectureForm.videoUrl}
                  onChange={(value) =>
                    updateLectureForm(
                      "videoUrl",
                      value,
                    )
                  }
                  placeholder="https://..."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormInput
                    label="Lecture Order"
                    type="number"
                    value={lectureForm.lectureOrder}
                    onChange={(value) =>
                      updateLectureForm(
                        "lectureOrder",
                        value,
                      )
                    }
                    placeholder="1"
                  />

                  <FormInput
                    label="Duration (minutes)"
                    type="number"
                    value={lectureForm.duration}
                    onChange={(value) =>
                      updateLectureForm(
                        "duration",
                        value,
                      )
                    }
                    placeholder="10"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-white">
                      Free Lecture
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Allow students to watch this lecture without purchasing the course.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={lectureForm.isFree}
                    onChange={(event) =>
                      updateLectureForm(
                        "isFree",
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5 accent-indigo-500"
                  />
                </label>

                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeLectureForm}
                    disabled={creatingLecture}
                    className="rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => void saveLecture()}
                    disabled={creatingLecture}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingLecture ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={17} />
                        {editingLectureId !== null
                          ? "Update Lecture"
                          : "Create Lecture"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD COURSE MODAL */}

        {showAddCourse && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1222] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1222]/95 px-6 py-5 backdrop-blur-xl">
                <div>
                  <h3 className="text-xl font-black text-white">
                    Add New Course
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Create a course in the SkillForge catalog.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAddCourse}
                  disabled={creatingCourse}
                  className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-5 p-6">
                {courseFormError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {courseFormError}
                  </div>
                )}

                {courseFormSuccess && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {courseFormSuccess}
                  </div>
                )}

                <FormInput
                  label="Course Title"
                  value={courseForm.title}
                  onChange={(value) =>
                    updateCourseForm("title", value)
                  }
                  placeholder="e.g. AWS Solutions Architect"
                />

                <FormTextarea
                  label="Description"
                  value={courseForm.description}
                  onChange={(value) =>
                    updateCourseForm(
                      "description",
                      value,
                    )
                  }
                  placeholder="Write a short description about this course..."
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormInput
                    label="Category"
                    value={courseForm.category}
                    onChange={(value) =>
                      updateCourseForm(
                        "category",
                        value,
                      )
                    }
                    placeholder="e.g. Cloud"
                  />

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Level
                    </span>

                    <select
                      value={courseForm.level}
                      onChange={(event) =>
                        updateCourseForm(
                          "level",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
                    >
                      <option value="Beginner">
                        Beginner
                      </option>
                      <option value="Intermediate">
                        Intermediate
                      </option>
                      <option value="Advanced">
                        Advanced
                      </option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormInput
                    label="Price (₹)"
                    type="number"
                    value={courseForm.price}
                    onChange={(value) =>
                      updateCourseForm(
                        "price",
                        value,
                      )
                    }
                    placeholder="799"
                  />

                  <FormInput
                    label="Thumbnail URL"
                    value={courseForm.thumbnail}
                    onChange={(value) =>
                      updateCourseForm(
                        "thumbnail",
                        value,
                      )
                    }
                    placeholder="https://..."
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4">
                  <div>
                    <p className="text-sm font-bold text-white">
                      Publish Course
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Published courses can be shown to students.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={courseForm.isPublished}
                    onChange={(event) =>
                      updateCourseForm(
                        "isPublished",
                        event.target.checked,
                      )
                    }
                    className="h-5 w-5 accent-indigo-500"
                  />
                </label>

                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeAddCourse}
                    disabled={creatingCourse}
                    className="rounded-xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={createCourse}
                    disabled={creatingCourse}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingCourse ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="animate-spin"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={17} />
                        Create Course
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}