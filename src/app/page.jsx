"use client";
import React from "react";
import * as Recharts from "recharts";
import { useHandleStreamResponse } from "../utilities/runtime-helpers";

function MainComponent() {
  const [currentPage, setCurrentPage] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [breakdownReason, setBreakdownReason] = useState("");
  const [handlerName, setHandlerName] = useState("");
  const [location, setLocation] = useState("");
  const [isListening, setIsListening] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [reports, setReports] = useState([]);
  const [chartData, setChartData] = useState({});
  const [notes, setNotes] = useState("");
  const [timeRange, setTimeRange] = useState("weekly");
  const [analyticsView, setAnalyticsView] = useState("weekly");
  const [listeningField, setListeningField] = useState("");
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [drilldownData, setDrilldownData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [aiHelp, setAiHelp] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [tableauServerUrl, setTableauServerUrl] = useState("");
  const [tableauUsername, setTableauUsername] = useState("");
  const [tableauPassword, setTableauPassword] = useState("");
  const [tableauSiteName, setTableauSiteName] = useState("");
  const [tableauSiteId, setTableauSiteId] = useState("");
  const [translatedContent, setTranslatedContent] = useState({});
  const [projectName, setProjectName] = useState("");
  const [workbookName, setWorkbookName] = useState("");
  const [uploadStatus, setUploadStatus] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shifts, setShifts] = useState([]);
  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: (message) => {
      setAiAnalysis(message);
      setStreamingMessage("");
    },
  });
  const translateContent = async () => {
    if (selectedLanguage === "en") {
      setTranslatedContent({});
      return;
    }

    const textToTranslate = [
      "Welcome Back",
      "Login to your account",
      "Username",
      "Password",
      "Enter username",
      "Enter password",
      "Login",
      "Invalid credentials",
      "Breakdown Management System",
      "Log Breakdown",
      "Analytics",
      "Reports",
      "Data View",
      "AI Features",
      "AI Data Access",
      "Settings",
      "File Upload",
      "Shift Schedule",
      "Record new equipment breakdowns and maintenance issues",
      "View breakdown statistics and performance metrics",
      "Access and export detailed breakdown reports",
      "Browse and manage breakdown records in detail",
      "Access AI-powered analysis and insights",
      "Query and analyze breakdown data using AI",
      "Customize your app preferences and options",
      "Upload and manage breakdown-related files",
      "View and manage employee shift schedules",
    ];

    const responses = await Promise.all(
      textToTranslate.map(async (text) => {
        const response = await fetch(
          "/integrations/google-translate/language/translate/v2",
          {
            method: "POST",
            body: new URLSearchParams({
              q: text,
              target: selectedLanguage,
              source: "en",
            }),
          }
        );
        const data = await response.json();
        return {
          original: text,
          translated: data.data.translations[0].translatedText,
        };
      })
    );

    const translations = responses.reduce((acc, { original, translated }) => {
      acc[original] = translated;
      return acc;
    }, {});

    setTranslatedContent(translations);
  };
  const translate = (text) => {
    return translatedContent[text] || text;
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      const user = { name: username, role: "admin" };
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setCurrentPage("home");
      setError("");
    } else if (username === "user" && password === "user") {
      const user = { name: username, role: "user" };
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setCurrentPage("home");
      setError("");
    } else {
      setError(translate("Invalid credentials"));
    }
  };
  const loadTableauCredentials = async () => {
    const response = await fetch("/api/db/breakdown", {
      method: "POST",
      body: JSON.stringify({
        query: "SELECT * FROM `tableau_credentials` LIMIT 1",
      }),
    });
    const data = await response.json();
    if (data && data[0]) {
      setTableauServerUrl(data[0].server_url || "");
      setTableauUsername(data[0].username || "");
      setTableauPassword(data[0].password || "");
      setTableauSiteName(data[0].site_name || "");
      setTableauSiteId(data[0].site_id || "");
    }
  };
  const handleSaveTableauCredentials = async () => {
    await fetch("/api/db/breakdown", {
      method: "POST",
      body: JSON.stringify({
        query:
          "INSERT INTO `tableau_credentials` (`server_url`, `username`, `password`, `site_name`, `site_id`) VALUES (?, ?, ?, ?, ?)",
        values: [
          tableauServerUrl,
          tableauUsername,
          tableauPassword,
          tableauSiteName,
          tableauSiteId,
        ],
      }),
    });
  };
  const HomeScreen = (
    <div className="min-h-screen bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-full flex items-center justify-center mr-4">
              <i className="fas fa-robot text-xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-white font-roboto">
              {translate("Breakdown Management System")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage("profile")}
              className="text-[#60A5FA] hover:text-[#93C5FD] font-roboto"
            >
              <i className="fas fa-user mr-2"></i>
              {user?.name}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                setUser(null);
                setCurrentPage("login");
              }}
              className="text-[#EF4444] hover:text-[#F87171] font-roboto"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "tools",
              title: "Log Breakdown",
              description:
                "Record new equipment breakdowns and maintenance issues",
              page: "breakdown",
              gradient: "from-[#3B82F6] to-[#2563EB]",
            },
            {
              icon: "calendar-alt",
              title: "Shift Schedule",
              description: "View and manage employee shift schedules",
              page: "schedule",
              gradient: "from-[#8B5CF6] to-[#6D28D9]",
            },
            {
              icon: "file-alt",
              title: "Reports",
              description: "Access and export detailed breakdown reports",
              page: "reports",
              gradient: "from-[#EC4899] to-[#BE185D]",
            },
            {
              icon: "database",
              title: "Data View",
              description: "Browse and manage breakdown records in detail",
              page: "data",
              gradient: "from-[#10B981] to-[#059669]",
            },
            {
              icon: "brain",
              title: "AI Features",
              description: "Access AI-powered analysis and insights",
              page: "aihelp",
              gradient: "from-[#F59E0B] to-[#D97706]",
            },
            {
              icon: "robot",
              title: "AI Data Access",
              description: "Query and analyze breakdown data using AI",
              page: "aidata",
              gradient: "from-[#6366F1] to-[#4F46E5]",
            },
            {
              icon: "cog",
              title: "Settings",
              description: "Customize your app preferences and options",
              page: "settings",
              gradient: "from-[#14B8A6] to-[#0D9488]",
            },
            {
              icon: "file-upload",
              title: "File Upload",
              description: "Upload and manage breakdown-related files",
              page: "uploadFile",
              gradient: "from-[#F472B6] to-[#DB2777]",
            },
          ].map((item) => (
            <div
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className="bg-gradient-to-br from-[#1F2937] to-[#111827] rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-1 cursor-pointer border border-gray-800"
            >
              <div className="flex items-center mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-full flex items-center justify-center mr-4`}
                >
                  <i className={`fas fa-${item.icon} text-xl text-white`}></i>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {translate(item.title)}
                </h2>
              </div>
              <p className="text-gray-400">{translate(item.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const [pageHistory, setPageHistory] = useState(["login"]);
  const navigateTo = (page) => {
    setPageHistory((prev) => [...prev, page]);
    setCurrentPage(page);
  };
  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();
      setPageHistory(newHistory);
      setCurrentPage(newHistory[newHistory.length - 1]);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      navigateTo("home");
    }
  }, []);

  useEffect(() => {
    if (currentPage === "analytics") {
      const loadCharts = async () => {
        try {
          let timeFilter = "";
          if (analyticsView === "weekly") {
            timeFilter = "AND `created_at` >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
          } else if (analyticsView === "monthly") {
            timeFilter = "AND `created_at` >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
          } else if (analyticsView === "yearly") {
            timeFilter = "AND `created_at` >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
          }

          const queries = {
            byHandler: `
        SELECT 
          COALESCE(handler_name, 'Unknown') as name,
          COUNT(*) as value
        FROM breakdown_logs
        WHERE 1=1 ${timeFilter}
        GROUP BY handler_name
        ORDER BY value DESC
      `,
            byReason: `
        SELECT 
          COALESCE(reason, 'Unknown') as name,
          COUNT(*) as value
        FROM breakdown_logs
        WHERE 1=1 ${timeFilter}
        GROUP BY reason
        ORDER BY value DESC
      `,
            byDayOfWeek: `
        SELECT 
          CASE DAYOFWEEK(created_at)
            WHEN 1 THEN 'Sunday'
            WHEN 2 THEN 'Monday'
            WHEN 3 THEN 'Tuesday'
            WHEN 4 THEN 'Wednesday'
            WHEN 5 THEN 'Thursday'
            WHEN 6 THEN 'Friday'
            WHEN 7 THEN 'Saturday'
          END as name,
          COUNT(*) as value
        FROM breakdown_logs
        WHERE 1=1 ${timeFilter}
        GROUP BY DAYOFWEEK(created_at)
        ORDER BY DAYOFWEEK(created_at)
      `,
            byLocation: `
        SELECT 
          COALESCE(location, 'Unknown') as name,
          COUNT(*) as value
        FROM breakdown_logs
        WHERE 1=1 ${timeFilter}
        GROUP BY location
        ORDER BY value DESC
      `,
            byTime: `
        SELECT 
          CONCAT(
            CASE 
              WHEN HOUR(created_at) = 0 THEN '12 AM'
              WHEN HOUR(created_at) < 12 THEN CONCAT(HOUR(created_at), ' AM')
              WHEN HOUR(created_at) = 12 THEN '12 PM'
              ELSE CONCAT(HOUR(created_at) - 12, ' PM')
            END
          ) as name,
          COUNT(*) as value
        FROM breakdown_logs
        WHERE 1=1 ${timeFilter}
        GROUP BY HOUR(created_at)
        ORDER BY HOUR(created_at)
      `,
          };

          const results = {};
          for (const [key, query] of Object.entries(queries)) {
            const response = await fetch("/api/db/breakdown", {
              method: "POST",
              body: JSON.stringify({ query }),
            });
            if (!response.ok) throw new Error(`Failed to fetch ${key} data`);
            const data = await response.json();
            results[key] = data;
          }

          const chartData = {
            handlerData: results.byHandler || [],
            reasonData: results.byReason || [],
            dayOfWeekData: results.byDayOfWeek || [],
            locationData: results.byLocation || [],
            timeData: results.byTime || [],
          };

          if (Object.values(chartData).some((data) => data.length > 0)) {
            setChartData(chartData);
          } else {
            setChartData({});
          }
        } catch (error) {
          console.error("Error loading chart data:", error);
          setChartData({});
        }
      };
      loadCharts();
    } else if (currentPage === "reports" && user?.role === "admin") {
      loadReports();
    } else if (currentPage === "reports") {
      navigateTo("home");
    } else if (currentPage === "data") {
      loadReports();
    } else if (currentPage === "aihelp") {
      loadReasons();
    } else if (currentPage === "settings") {
      loadTableauCredentials();
    } else if (currentPage === "schedule") {
      loadShifts();
    }
  }, [currentPage, analyticsView]);

  useEffect(() => {
    translateContent();
  }, [selectedLanguage, currentPage]);

  const handleVoiceInput = (field) => {
    if (!("webkitSpeechRecognition" in window)) {
      setError(
        "Voice input is not supported in your browser. Please use Chrome."
      );
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage || "en-US";

    recognition.onstart = () => {
      setError("");
      setIsListening(true);
      setListeningField(field);
      setSuccess("Listening... Speak now");
    };

    recognition.onend = () => {
      setIsListening(false);
      setListeningField("");
      setSuccess("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      switch (field) {
        case "reason":
          setBreakdownReason(transcript);
          setSuccess(`Recorded: ${transcript}`);
          break;
        case "handler":
          setHandlerName(transcript);
          setSuccess(`Recorded: ${transcript}`);
          break;
        case "location":
          setLocation(transcript);
          setSuccess(`Recorded: ${transcript}`);
          break;
        case "notes":
          setNotes(transcript);
          setSuccess(`Recorded: ${transcript}`);
          break;
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setListeningField("");
      setError(`Voice input error: ${event.error}. Please try again.`);
    };

    try {
      recognition.start();
    } catch (error) {
      setError("Failed to start voice recognition. Please try again.");
      setIsListening(false);
      setListeningField("");
    }
  };
  const handleChartClick = useCallback((data, type) => {
    setSelectedDataPoint({ ...data, type });
  }, []);
  const handleSubmitBreakdown = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);

    try {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an industrial maintenance expert. Analyze the breakdown information and provide a brief analysis with potential solutions.",
            },
            {
              role: "user",
              content: `Analyze this breakdown report:\nReason: ${breakdownReason}\nLocation: ${location}\nHandler: ${handlerName}\nNotes: ${notes}`,
            },
          ],
          json_schema: {
            name: "breakdown_analysis",
            schema: {
              type: "object",
              properties: {
                severity: {
                  type: "string",
                  enum: ["low", "medium", "high", "critical"],
                },
                root_cause: { type: "string" },
                immediate_actions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "number" },
                    },
                    required: ["action", "priority"],
                    additionalProperties: false,
                  },
                },
                preventive_measures: {
                  type: "array",
                  items: { type: "string" },
                },
                estimated_repair_time: { type: "string" },
              },
              required: [
                "severity",
                "root_cause",
                "immediate_actions",
                "preventive_measures",
                "estimated_repair_time",
              ],
              additionalProperties: false,
            },
          },
          stream: true,
        }),
      });

      handleStreamResponse(response);

      const dbResponse = await fetch("/api/db/breakdown", {
        method: "POST",
        body: JSON.stringify({
          query:
            "INSERT INTO `breakdown_logs` (`reason`, `handler_name`, `location`, `notes`, `created_at`) VALUES (?, ?, ?, ?, NOW())",
          values: [breakdownReason, handlerName, location, notes],
        }),
      });

      if (dbResponse.ok) {
        setBreakdownReason("");
        setHandlerName("");
        setLocation("");
        setNotes("");
        setCurrentPage("home");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const loadReports = async () => {
    const response = await fetch("/api/db/breakdown", {
      method: "POST",
      body: JSON.stringify({
        query:
          "SELECT `id`, `created_at`, `reason`, `handler_name`, `location`, `notes` FROM `breakdown_logs` ORDER BY `created_at` DESC",
      }),
    });
    const data = await response.json();
    setReports(data);
  };
  const loadReasons = async () => {
    const response = await fetch("/api/db/breakdown", {
      method: "POST",
      body: JSON.stringify({
        query:
          "SELECT DISTINCT `reason` FROM `breakdown_logs` ORDER BY `reason`",
      }),
    });
    const data = await response.json();
    setReasons(data);
  };
  const handleExportReports = async () => {
    try {
      if (!reports || reports.length === 0) {
        alert("No data to export");
        return;
      }

      const allData = await fetch("/api/db/breakdown", {
        method: "POST",
        body: JSON.stringify({
          query: "SELECT * FROM `breakdown_logs` ORDER BY `created_at` DESC",
        }),
      }).then((res) => res.json());

      const formattedReports = allData.map((report) => ({
        date: new Date(report.created_at)
          .toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
          .split(",")[0],
        time: new Date(report.created_at)
          .toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
          .split(",")[1],
        reason: report.reason || "",
        handlerName: report.handler_name || "",
        location: report.location || "",
        notes: report.notes || "",
        id: report.id || "",
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(formattedReports);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown Reports");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `breakdown_report_${new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Export failed. Please try again.");
    }
  };
  const handleExportCSV = () => {
    try {
      if (!reports || reports.length === 0) {
        alert("No data to export");
        return;
      }

      const csvRows = reports.map((report) => {
        const date = new Date(report.created_at)
          .toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
          .split(",")[0];
        const time = new Date(report.created_at)
          .toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
          .split(",")[1];

        const escapeCsvField = (field) => {
          if (field === null || field === undefined) return '""';
          return `"${field.toString().replace(/"/g, '""')}"`;
        };

        return [
          escapeCsvField(date),
          escapeCsvField(time),
          escapeCsvField(report.reason),
          escapeCsvField(report.handler_name),
          escapeCsvField(report.location),
          escapeCsvField(report.notes),
        ].join(",");
      });

      const csvContent = [
        "Date,Time,Reason,Handler,Location,Notes",
        ...csvRows,
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `breakdown_report_${new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        })}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };
  const AnalyticsScreen = (
    <div className="min-h-screen bg-[#f0f2f5] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
            Analytics Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-[#1a73e8] bg-opacity-10 rounded-lg p-1">
              <button
                onClick={() => setAnalyticsView("weekly")}
                className={`px-4 py-2 rounded-lg font-roboto ${
                  analyticsView === "weekly"
                    ? "bg-[#1a73e8] text-white"
                    : "text-[#1a73e8]"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setAnalyticsView("monthly")}
                className={`px-4 py-2 rounded-lg font-roboto ${
                  analyticsView === "monthly"
                    ? "bg-[#1a73e8] text-white"
                    : "text-[#1a73e8]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnalyticsView("yearly")}
                className={`px-4 py-2 rounded-lg font-roboto ${
                  analyticsView === "yearly"
                    ? "bg-[#1a73e8] text-white"
                    : "text-[#1a73e8]"
                }`}
              >
                Yearly
              </button>
            </div>
            <button
              onClick={() => setCurrentPage("home")}
              className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 font-crimson-text">
              Handler Performance
            </h2>
            <div className="h-[300px]">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.BarChart data={chartData?.handlerData || []}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" />
                  <Recharts.XAxis dataKey="name" />
                  <Recharts.YAxis />
                  <Recharts.Tooltip />
                  <Recharts.Bar dataKey="value" fill="#1a73e8" />
                </Recharts.BarChart>
              </Recharts.ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 font-crimson-text">
              Breakdown Categories
            </h2>
            <div className="h-[300px]">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.PieChart>
                  <Recharts.Pie
                    data={chartData?.reasonData || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#1a73e8"
                    label
                  >
                    {(chartData?.reasonData || []).map((entry, index) => (
                      <Recharts.Cell
                        key={`cell-${index}`}
                        fill={
                          ["#1a73e8", "#64B5F6", "#2196F3", "#1565C0"][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Recharts.Pie>
                  <Recharts.Tooltip />
                  <Recharts.Legend />
                </Recharts.PieChart>
              </Recharts.ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 font-crimson-text">
              Location Analysis
            </h2>
            <div className="h-[300px]">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.AreaChart data={chartData?.locationData || []}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" />
                  <Recharts.XAxis dataKey="name" />
                  <Recharts.YAxis />
                  <Recharts.Tooltip />
                  <Recharts.Area
                    type="monotone"
                    dataKey="value"
                    stroke="#1a73e8"
                    fill="#1a73e8"
                    fillOpacity={0.3}
                  />
                </Recharts.AreaChart>
              </Recharts.ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 font-crimson-text">
              Time Distribution
            </h2>
            <div className="h-[300px]">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.LineChart data={chartData?.timeData || []}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" />
                  <Recharts.XAxis dataKey="name" />
                  <Recharts.YAxis />
                  <Recharts.Tooltip />
                  <Recharts.Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1a73e8"
                    strokeWidth={2}
                    dot={{ fill: "#1a73e8", r: 4 }}
                  />
                </Recharts.LineChart>
              </Recharts.ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
            <h2 className="text-2xl font-bold mb-6 font-crimson-text">
              Weekly Pattern
            </h2>
            <div className="h-[300px]">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.ComposedChart data={chartData?.dayOfWeekData || []}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" />
                  <Recharts.XAxis dataKey="name" />
                  <Recharts.YAxis />
                  <Recharts.Tooltip />
                  <Recharts.Bar dataKey="value" fill="#1a73e8" />
                  <Recharts.Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={{ fill: "#ff7300", r: 4 }}
                  />
                </Recharts.ComposedChart>
              </Recharts.ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const ReportsScreen = (
    <div className="min-h-screen bg-[#f0f2f5] p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
            Reports
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleExportReports}
                className="w-full sm:w-auto bg-[#1a73e8] text-white px-6 py-3 rounded-lg hover:bg-[#1557b0] transition-colors font-roboto flex items-center justify-center"
              >
                <i className="fas fa-file-excel mr-2"></i>
                Download Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-roboto flex items-center justify-center"
              >
                <i className="fas fa-file-csv mr-2"></i>
                Download CSV
              </button>
            </div>
            <button
              onClick={() => setCurrentPage("home")}
              className="w-full sm:w-auto text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center justify-center border border-[#1a73e8] px-6 py-3 rounded-lg hover:bg-blue-50"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cell
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {
                      new Date(report.created_at)
                        .toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
                        .split(",")[0]
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {
                      new Date(report.created_at)
                        .toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
                        .split(",")[1]
                    }
                  </td>
                  <td className="px-6 py-4">{report.reason}</td>
                  <td className="px-6 py-4">{report.handler_name}</td>
                  <td className="px-6 py-4">{report.location}</td>
                  <td className="px-6 py-4">{report.notes}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  const BreakdownForm = (
    <div className="min-h-screen bg-[#f0f2f5] p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
            Log Breakdown
          </h1>
          <button
            onClick={() => setCurrentPage("home")}
            className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>Back to Home
          </button>
        </div>
        <form onSubmit={handleSubmitBreakdown} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-roboto">
              Breakdown Reason
            </label>
            <div className="relative">
              <input
                type="text"
                value={breakdownReason}
                onChange={(e) => setBreakdownReason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto"
                placeholder="Enter breakdown reason"
                name="reason"
              />
              <button
                type="button"
                onClick={() => handleVoiceInput("reason")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a73e8]"
              >
                <i
                  className={`fas fa-microphone${
                    isListening && listeningField === "reason" ? "-slash" : ""
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-roboto">
              Handler Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={handlerName}
                onChange={(e) => setHandlerName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto"
                placeholder="Enter handler name"
                name="handler"
              />
              <button
                type="button"
                onClick={() => handleVoiceInput("handler")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a73e8]"
              >
                <i
                  className={`fas fa-microphone${
                    isListening && listeningField === "handler" ? "-slash" : ""
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-roboto">
              Location/Cell
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto"
                placeholder="Enter location"
                name="location"
              />
              <button
                type="button"
                onClick={() => handleVoiceInput("location")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a73e8]"
              >
                <i
                  className={`fas fa-microphone${
                    isListening && listeningField === "location" ? "-slash" : ""
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-roboto">
              Additional Notes
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto"
                placeholder="Enter additional notes"
                rows="4"
                name="notes"
              ></textarea>
              <button
                type="button"
                onClick={() => handleVoiceInput("notes")}
                className="absolute right-3 top-3 text-gray-400 hover:text-[#1a73e8]"
              >
                <i
                  className={`fas fa-microphone${
                    isListening && listeningField === "notes" ? "-slash" : ""
                  }`}
                ></i>
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full bg-[#1a73e8] text-white py-3 rounded-lg hover:bg-[#1557b0] transition-colors font-roboto disabled:opacity-50"
          >
            {isAnalyzing ? "Analyzing..." : "Submit Breakdown"}
          </button>
          {streamingMessage && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-[#1a73e8] mb-2">AI Analysis</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {streamingMessage}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
  const loadUploadStatus = async () => {
    const response = await fetch("/api/db/breakdown", {
      method: "POST",
      body: JSON.stringify({
        query:
          "SELECT * FROM `upload_tracking` ORDER BY `created_at` DESC LIMIT 10",
      }),
    });
    const data = await response.json();
    setUploadStatus(data);
  };

  useEffect(() => {
    loadUploadStatus();
    const interval = setInterval(loadUploadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadShifts = async () => {
    try {
      const response = await fetch("/api/db/breakdown", {
        method: "POST",
        body: JSON.stringify({
          query:
            "SELECT * FROM `shift_schedules` ORDER BY `shift_date` DESC, `shift_start` ASC",
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to load shifts");
      }
      const data = await response.json();
      setShifts(data);
    } catch (error) {
      console.error("Error loading shifts:", error);
    }
  };
  const handleAddShift = () => {
    setEditingShift({
      shift_date: new Date().toISOString().split("T")[0],
      shift_start: "",
      shift_end: "",
      employee_name: "",
      role: "",
      shift_type: "",
      details: "",
    });
    setShowScheduleModal(true);
  };
  const handleSubmitShift = async (e) => {
    e.preventDefault();
    if (!editingShift) {
      alert("Please fill in shift details");
      return;
    }

    try {
      if (editingShift.id) {
        await fetch("/api/db/breakdown", {
          method: "POST",
          body: JSON.stringify({
            query:
              "UPDATE `shift_schedules` SET `shift_date` = ?, `shift_type` = ?, `shift_start` = ?, `shift_end` = ?, `employee_name` = ?, `role` = ?, `details` = ? WHERE `id` = ?",
            values: [
              editingShift.shift_date,
              editingShift.shift_type,
              editingShift.shift_start,
              editingShift.shift_end,
              editingShift.employee_name,
              editingShift.role,
              editingShift.details || "",
              editingShift.id,
            ],
          }),
        });
      } else {
        await fetch("/api/db/breakdown", {
          method: "POST",
          body: JSON.stringify({
            query:
              "INSERT INTO `shift_schedules` (`shift_date`, `shift_type`, `shift_start`, `shift_end`, `employee_name`, `role`, `details`) VALUES (?, ?, ?, ?, ?, ?, ?)",
            values: [
              editingShift.shift_date,
              editingShift.shift_type,
              editingShift.shift_start,
              editingShift.shift_end,
              editingShift.employee_name,
              editingShift.role,
              editingShift.details || "",
            ],
          }),
        });
      }
      await loadShifts();
      setShowScheduleModal(false);
      setEditingShift(null);
    } catch (error) {
      console.error("Error saving shift:", error);
      alert("Failed to save shift. Please try again.");
    }
  };
  const handleDeleteShift = async (id) => {
    if (!confirm("Are you sure you want to delete this shift?")) {
      return;
    }
    try {
      await fetch("/api/db/breakdown", {
        method: "POST",
        body: JSON.stringify({
          query: "DELETE FROM `shift_schedules` WHERE `id` = ?",
          values: [id],
        }),
      });
      await loadShifts();
    } catch (error) {
      console.error("Error deleting shift:", error);
      alert("Failed to delete shift. Please try again.");
    }
  };
  const MobileNavigation = (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => navigateTo("home")}
          className="flex flex-col items-center justify-center w-16 h-16 text-gray-600"
        >
          <i className="fas fa-home text-xl"></i>
          <span className="text-xs mt-1">Home</span>
        </button>
        {pageHistory.length > 1 && (
          <button
            onClick={goBack}
            className="flex flex-col items-center justify-center w-16 h-16 text-gray-600"
          >
            <i className="fas fa-arrow-left text-xl"></i>
            <span className="text-xs mt-1">Back</span>
          </button>
        )}
        <button
          onClick={() => navigateTo("schedule")}
          className="flex flex-col items-center justify-center w-16 h-16 text-gray-600"
        >
          <i className="fas fa-calendar text-xl"></i>
          <span className="text-xs mt-1">Schedule</span>
        </button>
        <button
          onClick={() => navigateTo("settings")}
          className="flex flex-col items-center justify-center w-16 h-16 text-gray-600"
        >
          <i className="fas fa-cog text-xl"></i>
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </div>
  );

  const pages = {
    login: (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-[#1a73e8] rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-robot text-4xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
              Welcome Back
            </h1>
            <p className="text-gray-500 font-roboto">Login to your account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-roboto">
                Username
              </label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto"
                  placeholder="Enter username"
                  name="username"
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-roboto">
                Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto"
                  placeholder="Enter password"
                  name="password"
                  autoComplete="off"
                />
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm font-roboto text-center">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-[#1a73e8] text-white py-3 rounded-lg hover:bg-[#1557b0] transition-colors font-roboto"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    ),
    home: HomeScreen,
    breakdown: BreakdownForm,
    analytics: AnalyticsScreen,
    reports: ReportsScreen,
    data: (
      <div className="min-h-screen bg-[#f0f2f5] p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
              Breakdown Data
            </h1>
            <button
              onClick={() => setCurrentPage("home")}
              className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#1a73e8] text-white p-2 rounded-lg">
                    <i className="fas fa-tools text-xl"></i>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete report"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {report.reason}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-user-cog mr-2"></i>
                    <span>{report.handler_name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    <span>{report.location}</span>
                  </div>
                  {report.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm">{report.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    profile: (
      <div className="min-h-screen bg-[#f0f2f5] p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
              Profile
            </h1>
            <button
              onClick={() => setCurrentPage("home")}
              className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-[#1a73e8] rounded-full flex items-center justify-center">
                <i className="fas fa-user text-4xl text-white"></i>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-gray-600 font-roboto">Username</p>
              <p className="text-lg font-roboto">{user?.name}</p>
            </div>
            <div className="border-t pt-4">
              <p className="text-gray-600 font-roboto">Role</p>
              <p className="text-lg font-roboto capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    ),
    aihelp: (
      <div className="min-h-screen bg-[#f0f2f5] p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
              AI Features
            </h1>
            <button
              onClick={() => setCurrentPage("home")}
              className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#1a73e8] rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-search-plus text-xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold font-roboto">
                  Root Cause Analysis
                </h3>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter specific breakdown details to analyze..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto mb-4 resize-none"
                rows="4"
              />
              <button
                onClick={async () => {
                  const response = await fetch(
                    "/integrations/chat-gpt/conversationgpt4",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        messages: [
                          {
                            role: "system",
                            content:
                              "You are a root cause analysis expert. Analyze breakdown descriptions for potential causes using the 5-Why methodology and provide a structured analysis.",
                          },
                          {
                            role: "user",
                            content: `Analyze this breakdown data using 5-Why methodology:\n${notes}\n\nHistorical Context:\n${reports
                              .map((r) => `${r.reason}: ${r.notes}`)
                              .join("\n")}`,
                          },
                        ],
                        json_schema: {
                          name: "root_cause_analysis",
                          schema: {
                            type: "object",
                            properties: {
                              initial_problem: { type: "string" },
                              why_chain: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    question: { type: "string" },
                                    answer: { type: "string" },
                                    evidence: { type: "string" },
                                  },
                                  required: ["question", "answer", "evidence"],
                                  additionalProperties: false,
                                },
                              },
                              root_cause: { type: "string" },
                              recommended_actions: {
                                type: "array",
                                items: { type: "string" },
                              },
                              confidence_level: {
                                type: "string",
                                enum: ["high", "medium", "low"],
                              },
                            },
                            required: [
                              "initial_problem",
                              "why_chain",
                              "root_cause",
                              "recommended_actions",
                              "confidence_level",
                            ],
                            additionalProperties: false,
                          },
                        },
                        stream: true,
                      }),
                    }
                  );
                  handleStreamResponse(response);
                }}
                className="w-full bg-[#1a73e8] text-white py-3 rounded-lg hover:bg-[#1557b0] transition-colors font-roboto flex items-center justify-center"
              >
                <i className="fas fa-microscope mr-2"></i>
                Analyze Root Cause
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#1a73e8] rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-file-alt text-xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold font-roboto">
                  Report Generation
                </h3>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto mb-4 appearance-none bg-white"
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
              </select>
              <button
                onClick={async () => {
                  const response = await fetch(
                    "/integrations/chat-gpt/conversationgpt4",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        messages: [
                          {
                            role: "system",
                            content:
                              "You are a maintenance report writer. Generate a comprehensive report with executive summary, key findings, and recommendations.",
                          },
                          {
                            role: "user",
                            content: `Generate a ${timeRange} report from this data:\n${reports
                              .map(
                                (r) =>
                                  `Date: ${new Date(
                                    r.created_at
                                  ).toLocaleString()}\nReason: ${
                                    r.reason
                                  }\nHandler: ${r.handler_name}\nLocation: ${
                                    r.location
                                  }\nNotes: ${r.notes}\n---`
                              )
                              .join("\n")}`,
                          },
                        ],
                        json_schema: {
                          name: "maintenance_report",
                          schema: {
                            type: "object",
                            properties: {
                              executive_summary: { type: "string" },
                              key_metrics: {
                                type: "object",
                                properties: {
                                  total_incidents: { type: "number" },
                                  critical_issues: { type: "number" },
                                  resolved_issues: { type: "number" },
                                  mttr: { type: "string" },
                                },
                                required: [
                                  "total_incidents",
                                  "critical_issues",
                                  "resolved_issues",
                                  "mttr",
                                ],
                                additionalProperties: false,
                              },
                              findings: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    category: { type: "string" },
                                    description: { type: "string" },
                                    impact: { type: "string" },
                                  },
                                  required: [
                                    "category",
                                    "description",
                                    "impact",
                                  ],
                                  additionalProperties: false,
                                },
                              },
                              recommendations: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    action: { type: "string" },
                                    priority: { type: "string" },
                                    expected_outcome: { type: "string" },
                                  },
                                  required: [
                                    "action",
                                    "priority",
                                    "expected_outcome",
                                  ],
                                  additionalProperties: false,
                                },
                              },
                            },
                            required: [
                              "executive_summary",
                              "key_metrics",
                              "findings",
                              "recommendations",
                            ],
                            additionalProperties: false,
                          },
                        },
                        stream: true,
                      }),
                    }
                  );
                  handleStreamResponse(response);
                }}
                className="w-full bg-[#1a73e8] text-white py-3 rounded-lg hover:bg-[#1557b0] transition-colors font-roboto flex items-center justify-center"
              >
                <i className="fas fa-file-signature mr-2"></i>
                Generate Report
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#1a73e8] rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-tags text-xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold font-roboto">
                  Smart Categorization
                </h3>
              </div>
              <div className="space-y-4">
                <select
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto appearance-none bg-white"
                >
                  <option value="">
                    Select breakdown records to categorize
                  </option>
                  {reasons.map((reason) => (
                    <option key={reason.reason} value={reason.reason}>
                      {reason.reason}
                    </option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    const response = await fetch(
                      "/integrations/chat-gpt/conversationgpt4",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          messages: [
                            {
                              role: "system",
                              content:
                                "You are a maintenance categorization expert. Analyze and categorize breakdowns into detailed categories with subcategories.",
                            },
                            {
                              role: "user",
                              content: `Categorize these breakdowns:\n${reports
                                .filter((r) => r.reason === notes)
                                .map((r) => `${r.reason}: ${r.notes}`)
                                .join("\n")}`,
                            },
                          ],
                          json_schema: {
                            name: "breakdown_categorization",
                            schema: {
                              type: "object",
                              properties: {
                                primary_category: { type: "string" },
                                subcategories: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      name: { type: "string" },
                                      frequency: { type: "number" },
                                      severity: {
                                        type: "string",
                                        enum: ["low", "medium", "high"],
                                      },
                                      common_factors: {
                                        type: "array",
                                        items: { type: "string" },
                                      },
                                    },
                                    required: [
                                      "name",
                                      "frequency",
                                      "severity",
                                      "common_factors",
                                    ],
                                    additionalProperties: false,
                                  },
                                },
                                patterns: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      pattern: { type: "string" },
                                      occurrence: { type: "number" },
                                      significance: { type: "string" },
                                    },
                                    required: [
                                      "pattern",
                                      "occurrence",
                                      "significance",
                                    ],
                                    additionalProperties: false,
                                  },
                                },
                              },
                              required: [
                                "primary_category",
                                "subcategories",
                                "patterns",
                              ],
                              additionalProperties: false,
                            },
                          },
                          stream: true,
                        }),
                      }
                    );
                    handleStreamResponse(response);
                  }}
                  className="w-full bg-[#1a73e8] text-white py-3 rounded-lg hover:bg-[#1557b0] transition-colors font-roboto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!notes}
                >
                  <i className="fas fa-layer-group mr-2"></i>
                  Analyze Categories
                </button>
              </div>
            </div>
            {streamingMessage && (
              <div className="col-span-full bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-3">
                  <i className="fas fa-robot text-[#1a73e8] text-xl mr-2"></i>
                  <h3 className="font-bold text-[#1a73e8] text-lg">
                    AI Analysis
                  </h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
                  <p className="text-gray-700 whitespace-pre-wrap font-roboto leading-relaxed text-lg">
                    {streamingMessage.split("\n").map((line, index) => (
                      <span
                        key={index}
                        className="block mb-4 border-l-4 border-[#1a73e8] pl-4"
                      >
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            )}
            {aiAnalysis && !streamingMessage && (
              <div className="col-span-full bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-3">
                  <i className="fas fa-check-circle text-[#1a73e8] text-xl mr-2"></i>
                  <h3 className="font-bold text-[#1a73e8] text-lg">
                    Analysis Complete
                  </h3>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
                  <p className="text-gray-700 whitespace-pre-wrap font-roboto leading-relaxed text-lg">
                    {aiAnalysis.split("\n").map((line, index) => (
                      <span
                        key={index}
                        className="block mb-4 border-l-4 border-[#1a73e8] pl-4"
                      >
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    aidata: (
      <div className="min-h-screen bg-[#f0f2f5] p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
              AI Data Access
            </h1>
            <button
              onClick={() => setCurrentPage("home")}
              className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <i className="fas fa-robot text-3xl text-[#1a73e8] mr-3"></i>
                <h3 className="text-xl font-bold">AI Data Request</h3>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your request for data access..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] font-roboto mb-4"
                rows="4"
              />
              <button
                onClick={async () => {
                  const response = await fetch(
                    "/integrations/chat-gpt/conversationgpt4",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        messages: [
                          {
                            role: "system",
                            content:
                              "You are a data access assistant. Process the request and provide relevant data from the breakdown logs.",
                          },
                          {
                            role: "user",
                            content: `Request: ${notes}\n\nAvailable Data:\n${reports
                              .map(
                                (r) =>
                                  `Date: ${new Date(
                                    r.created_at
                                  ).toLocaleString()}\nReason: ${
                                    r.reason
                                  }\nHandler: ${r.handler_name}\nLocation: ${
                                    r.location
                                  }\nNotes: ${r.notes}\n---`
                              )
                              .join("\n")}`,
                          },
                        ],
                        stream: true,
                      }),
                    }
                  );
                  handleStreamResponse(response);
                }}
                className="w-full bg-[#1a73e8] text-white py-3 rounded-lg hover:bg-[#1557b0] transition-colors font-roboto"
              >
                Process Request
              </button>
            </div>
            {streamingMessage && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-[#1a73e8] mb-2">AI Response</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {streamingMessage}
                </p>
              </div>
            )}
            {aiAnalysis && !streamingMessage && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-[#1a73e8] mb-2">AI Response</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {aiAnalysis}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    settings: (
      <div className="min-h-screen bg-[#f0f2f5] p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
              Settings
            </h1>
            <button
              onClick={() => setCurrentPage("home")}
              className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4">Language</h2>
              <div className="flex gap-4">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                  <option value="ru">Русский</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                  <option value="zh">中文</option>
                  <option value="ar">العربية</option>
                  <option value="hi">हिन्दी</option>
                </select>
                <button
                  onClick={translateContent}
                  className="px-6 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors flex items-center"
                >
                  <i className="fas fa-language mr-2"></i>
                  Apply
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Select language and click Apply to translate the application
              </p>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-4">Theme</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 rounded-lg border-2 border-[#1a73e8] bg-white">
                  <i className="fas fa-sun text-[#1a73e8] text-xl mb-2"></i>
                  <p>Light</p>
                </button>
                <button className="p-4 rounded-lg border-2 border-gray-300 bg-gray-100">
                  <i className="fas fa-moon text-gray-600 text-xl mb-2"></i>
                  <p>Dark</p>
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-4">Tableau Credentials</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Server URL</label>
                  <input
                    type="text"
                    value={tableauServerUrl}
                    onChange={(e) => setTableauServerUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    placeholder="Enter Tableau server URL"
                    name="server_url"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={tableauUsername}
                    onChange={(e) => setTableauUsername(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    placeholder="Enter Tableau username"
                    name="username"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={tableauPassword}
                    onChange={(e) => setTableauPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    placeholder="Enter Tableau password"
                    name="password"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={tableauSiteName}
                    onChange={(e) => setTableauSiteName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    placeholder="Enter Tableau site name"
                    name="site_name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Site ID</label>
                  <input
                    type="text"
                    value={tableauSiteId}
                    onChange={(e) => setTableauSiteId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    placeholder="Enter Tableau site ID"
                    name="site_id"
                  />
                </div>
                <button
                  onClick={handleSaveTableauCredentials}
                  className="w-full bg-[#1a73e8] text-white py-2 rounded-lg hover:bg-[#1557b0] transition-colors"
                >
                  Save Tableau Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    uploadFile: (
      <div className="min-h-screen bg-[#f0f2f5] p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
              File Upload
            </h1>
            <button
              onClick={() => setCurrentPage("home")}
              className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Home
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#1a73e8] rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-file-upload text-xl text-white"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Upload Files
                </h2>
              </div>
              <p className="text-gray-600 mb-4">
                Upload Excel files directly to Tableau for analysis
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    placeholder="Enter Tableau project name"
                    name="project_name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Workbook Name
                  </label>
                  <input
                    type="text"
                    value={workbookName}
                    onChange={(e) => setWorkbookName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    placeholder="Enter Tableau workbook name"
                    name="workbook_name"
                  />
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={async (e) => {
                      if (e.target.files) {
                        const file = e.target.files[0];

                        if (!projectName || !workbookName) {
                          alert(
                            "Please enter both project name and workbook name"
                          );
                          return;
                        }

                        const credentials = await fetch("/api/db/breakdown", {
                          method: "POST",
                          body: JSON.stringify({
                            query:
                              "SELECT * FROM `tableau_credentials` LIMIT 1",
                          }),
                        }).then((res) => res.json());

                        if (!credentials || !credentials[0]) {
                          alert(
                            "Please configure Tableau credentials in Settings first"
                          );
                          return;
                        }

                        const { url, error } = await upload({ file });
                        if (error) {
                          alert("Upload failed: " + error);
                          return;
                        }

                        try {
                          await fetch("/api/db/breakdown", {
                            method: "POST",
                            body: JSON.stringify({
                              query:
                                "INSERT INTO `upload_tracking` (`file_name`, `file_url`, `tableau_project`, `tableau_workbook`, `status`) VALUES (?, ?, ?, ?, ?)",
                              values: [
                                file.name,
                                url,
                                projectName,
                                workbookName,
                                "uploading",
                              ],
                            }),
                          });

                          const response = await fetch("/api/new-function", {
                            method: "POST",
                            body: JSON.stringify({
                              file: {
                                name: file.name,
                                data: url,
                              },
                              tableauProject: projectName,
                              tableauWorkbook: workbookName,
                              lastSyncTimestamp: new Date().toISOString(),
                              database: true,
                            }),
                          });

                          if (!response.ok) {
                            throw new Error("Failed to sync with Tableau");
                          }

                          loadUploadStatus();
                          alert(
                            "File upload initiated. Check status below for progress."
                          );
                        } catch (err) {
                          console.error(err);
                          alert("Failed to process file upload");
                        }
                      }
                    }}
                    className="block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1a73e8] file:text-white hover:file:bg-[#1557b0]"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#1a73e8] rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-clock text-xl text-white"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Upload Status
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        File
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Project
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Workbook
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadStatus.map((status) => (
                      <tr key={status.id} className="border-t">
                        <td className="px-4 py-2">{status.file_name}</td>
                        <td className="px-4 py-2">{status.tableau_project}</td>
                        <td className="px-4 py-2">{status.tableau_workbook}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : status.status === "error"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {status.status}
                            {status.status === "uploading" && (
                              <svg
                                className="animate-spin ml-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(status.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {uploadStatus.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No upload history found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    schedule: (
      <div className="min-h-screen bg-[#f0f2f5] p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1a73e8] font-roboto">
              Shift Schedule
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleAddShift}
                className="bg-[#1a73e8] text-white px-4 py-2 rounded-lg hover:bg-[#1557b0] transition-colors font-roboto flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Shift
              </button>
              <button
                onClick={() => setCurrentPage("home")}
                className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
              >
                <i className="fas fa-arrow-left mr-2"></i>Back to Home
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(shift.shift_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shift.shift_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shift.shift_start}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {shift.shift_end}
                    </td>
                    <td className="px-6 py-4">{shift.employee_name}</td>
                    <td className="px-6 py-4">{shift.role}</td>
                    <td className="px-6 py-4">{shift.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setEditingShift(shift);
                          setShowScheduleModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {shifts.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No shifts scheduled
              </div>
            )}
          </div>
        </div>

        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setShowScheduleModal(false);
                      setEditingShift(null);
                    }}
                    className="text-[#1a73e8] hover:text-[#1557b0] font-roboto flex items-center"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>Back
                  </button>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingShift?.id ? "Edit Shift" : "Add New Shift"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setEditingShift(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmitShift} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={editingShift?.shift_date || ""}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        shift_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Shift</label>
                  <select
                    value={editingShift?.shift_type || ""}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        shift_type: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    required
                  >
                    <option value="">Select Shift</option>
                    <option value="1st Shift">1st Shift</option>
                    <option value="2nd Shift">2nd Shift</option>
                    <option value="3rd Shift">3rd Shift</option>
                    <option value="General Shift">General Shift</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={editingShift?.shift_start || ""}
                      onChange={(e) =>
                        setEditingShift({
                          ...editingShift,
                          shift_start: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={editingShift?.shift_end || ""}
                      onChange={(e) =>
                        setEditingShift({
                          ...editingShift,
                          shift_end: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={editingShift?.employee_name || ""}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        employee_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={editingShift?.role || ""}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Details</label>
                  <textarea
                    value={editingShift?.details || ""}
                    onChange={(e) =>
                      setEditingShift({
                        ...editingShift,
                        details: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    placeholder="Enter shift details..."
                    rows="3"
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setEditingShift(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1a73e8] text-white rounded-lg hover:bg-[#1557b0] transition-colors"
                  >
                    {editingShift?.id ? "Update" : "Add"} Shift
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    ),
  };

  return (
    <>
      <div className="pb-16 md:pb-0">{pages[currentPage]}</div>
      {currentPage !== "login" && MobileNavigation}
    </>
  );
}

export default MainComponent;