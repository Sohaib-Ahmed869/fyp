import React, { useState, useEffect, useMemo } from "react";
import AdminService from "../../../Services/adminService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  RefreshCw,
  Search,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  ChevronDown,
  ArrowRight,
  Plus,
  Star,
  Clock,
  Zap,
  Tag,
  CheckCircle,
  XCircle,
  Send,
  Info,
  FileText,
  List,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingDown,
  Award,
  Activity,
} from "lucide-react";

// Color palette for consistent styling
const COLORS = {
  primary: "#4f46e5", // indigo-600
  secondary: "#10b981", // emerald-500
  tertiary: "#f59e0b", // amber-500
  danger: "#ef4444", // red-500
  warning: "#f97316", // orange-500
  info: "#3b82f6", // blue-500
  success: "#22c55e", // green-500
  neutral: "#6b7280", // gray-500
};

const RATING_COLORS = {
  "1_star": "#ef4444", // red-500
  "2_star": "#f97316", // orange-500
  "3_star": "#f59e0b", // amber-500
  "4_star": "#84cc16", // lime-500
  "5_star": "#10b981", // emerald-500
};

const SENTIMENT_COLORS = {
  POSITIVE: "#22c55e", // green-500
  NEGATIVE: "#ef4444", // red-500
  NEUTRAL: "#6b7280", // gray-500
};

const ASPECT_COLORS = {
  "food quality": "#8b5cf6", // violet-500
  "service speed": "#ec4899", // pink-500
  "staff friendliness": "#06b6d4", // cyan-500
  ambiance: "#f97316", // orange-500
  "value for money": "#84cc16", // lime-500
  cleanliness: "#3b82f6", // blue-500
  taste: "#d946ef", // fuchsia-500
  price: "#f59e0b", // amber-500
};

// Reusable card component
const Card = ({ children, className = "", noPadding = false }) => (
  <div
    className={`bg-white rounded-lg shadow-sm border border-gray-100 ${
      noPadding ? "" : "p-5"
    } ${className}`}
  >
    {children}
  </div>
);

// Badge component
const Badge = ({ children, color = "primary", className = "" }) => {
  const colorClasses = {
    primary: "bg-indigo-100 text-indigo-800",
    secondary: "bg-emerald-100 text-emerald-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
    success: "bg-green-100 text-green-800",
    info: "bg-blue-100 text-blue-800",
    neutral: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  );
};

// Stat card component
const StatCard = ({
  title,
  value,
  icon,
  color = "primary",
  subtitle = null,
}) => {
  const bgColorClass = `bg-${color}-100`;
  const textColorClass = `text-${color}-600`;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1 flex items-center">
            {value}
            {subtitle && (
              <span className="text-sm ml-1 font-normal text-gray-500">
                {subtitle}
              </span>
            )}
          </h3>
        </div>
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center ${bgColorClass}`}
        >
          {React.cloneElement(icon, { className: `h-6 w-6 ${textColorClass}` })}
        </div>
      </div>
    </Card>
  );
};

// Tab component
const Tab = ({ active, onClick, icon, label }) => (
  <button
    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "bg-white text-gray-700 hover:bg-gray-50"
    }`}
    onClick={onClick}
  >
    {React.cloneElement(icon, { className: "h-4 w-4 mr-2" })}
    {label}
  </button>
);

// Feedback card component
const FeedbackCard = ({ feedback, onAnalyze }) => {
  const getSentimentBadge = (sentiment) => {
    if (!sentiment) return null;

    const badgeColors = {
      POSITIVE: "success",
      NEGATIVE: "danger",
      NEUTRAL: "neutral",
    };

    return (
      <Badge color={badgeColors[sentiment] || "neutral"}>
        {sentiment.charAt(0) + sentiment.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const sentiment =
    feedback.sentiment ||
    (feedback.sentiment_score > 0.6
      ? "POSITIVE"
      : feedback.sentiment_score < 0.4
      ? "NEGATIVE"
      : "NEUTRAL");

  return (
    <div className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between">
        <div className="flex-1">
          <p className="text-gray-800">{feedback.feedback}</p>
          <div className="flex items-center mt-3 flex-wrap">
            <div className="flex items-center mr-4 mb-2">
              <Users className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
              <span className="text-xs text-gray-500 font-medium">
                {feedback.customer_name}
              </span>
            </div>
            <div className="flex items-center mr-4 mb-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
              <span className="text-xs text-gray-500">
                {new Date(feedback.time).toLocaleDateString()}
              </span>
            </div>
            <div className="mb-2">{getSentimentBadge(sentiment)}</div>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <button
          onClick={() => onAnalyze(feedback)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <Zap className="h-3.5 w-3.5 mr-1" /> Analyze feedback
        </button>
        <div className="flex items-center text-gray-400 text-xs">
          <Clock className="h-3.5 w-3.5 mr-1" />
          {new Date(feedback.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

// Main component
const FeedbackAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackAnalysis, setFeedbackAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    getFeedbackData();
  }, []);

  const getFeedbackData = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getFeedbackAnalysis();

      if (response.error) {
        throw new Error(response.error);
      }

      setAnalysis(response.data);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch feedback analysis: " + (err.message || "Unknown error")
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeFeedback = async (feedback) => {
    try {
      setAnalyzing(true);
      setSelectedFeedback(feedback);

      // Get sentiment for this specific feedback
      const sentimentResponse = await AdminService.getQuickSentimentAnalysis(
        feedback.feedback
      );
      const suggestionsResponse = await AdminService.getSuggestionsByFeedback(
        feedback.feedback
      );

      if (sentimentResponse.error || suggestionsResponse.error) {
        throw new Error(sentimentResponse.error || suggestionsResponse.error);
      }

      setFeedbackAnalysis({
        sentiment: sentimentResponse.data.sentiment,
        suggestions: suggestionsResponse.data.suggestions,
      });
    } catch (err) {
      console.error("Error analyzing feedback:", err);
      // Show error in UI
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper function to get an array of all dates within the selected filter range
  const getDateRangeArray = (filter) => {
    const dates = [];
    const today = new Date();
    let daysToSubtract = 0;

    switch (filter) {
      case "week":
        daysToSubtract = 7;
        break;
      case "month":
        daysToSubtract = 30;
        break;
      case "quarter":
        daysToSubtract = 90;
        break;
      default:
        daysToSubtract = 30; // Default to a month
    }

    for (let i = daysToSubtract; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  };

  // Generate sentiment trend data
  const generateSentimentTrendData = () => {
    if (!analysis?.analysis?.temporal_analysis?.sentiment_trend) {
      const dateRange = getDateRangeArray(dateFilter);
      return dateRange.map((date) => ({
        date,
        positive: 0,
        negative: 0,
        neutral: 0,
      }));
    }

    const trendData = analysis.analysis.temporal_analysis.sentiment_trend;

    return trendData.map((item) => ({
      date: item.period,
      positive: item.positive_count,
      negative: item.negative_count,
      neutral: item.neutral_count,
    }));
  };

  // Prepare data for the sentiment distribution chart
  const prepareSentimentData = useMemo(() => {
    if (!analysis?.analysis?.satisfaction_metrics?.rating_distribution)
      return [];

    return Object.entries(
      analysis.analysis.satisfaction_metrics.rating_distribution
    ).map(([rating, count]) => ({
      name: rating.replace("_", " ").replace("star", "★"),
      value: count,
      fill: RATING_COLORS[rating] || "#6b7280",
    }));
  }, [analysis]);

  // Prepare data for keywords pie chart
  const prepareKeywordsData = useMemo(() => {
    if (!analysis?.analysis?.keyword_analysis?.top_keywords) return [];

    return Object.entries(analysis.analysis.keyword_analysis.top_keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([keyword, count], index) => ({
        name: keyword,
        value: count,
      }));
  }, [analysis]);

  // Prepare data for aspects chart
  const prepareAspectsData = useMemo(() => {
    if (!analysis?.analysis?.aspect_analysis?.aspects) return [];

    return Object.entries(analysis.analysis.aspect_analysis.aspects)
      .map(([aspect, data]) => ({
        name: aspect,
        positive: Math.round(
          data.sentiment_ratio.positive * data.mention_count
        ),
        negative: Math.round(
          data.sentiment_ratio.negative * data.mention_count
        ),
        neutral: Math.round(data.sentiment_ratio.neutral * data.mention_count),
        total: data.mention_count,
        sentiment:
          data.sentiment_ratio.positive > data.sentiment_ratio.negative
            ? "positive"
            : "negative",
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [analysis]);

  // Filter feedbacks based on search term and date filter
  const getFilteredFeedbacks = useMemo(() => {
    if (!analysis?.raw_data) return [];

    return analysis.raw_data
      .filter(
        (feedback) =>
          feedback.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.customer_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
      .filter((feedback) => {
        if (dateFilter === "all") return true;

        const feedbackDate = new Date(feedback.time);
        const now = new Date();

        switch (dateFilter) {
          case "week":
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return feedbackDate >= weekAgo;
          case "month":
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            return feedbackDate >= monthAgo;
          case "quarter":
            const quarterAgo = new Date();
            quarterAgo.setMonth(now.getMonth() - 3);
            return feedbackDate >= quarterAgo;
          default:
            return true;
        }
      });
  }, [analysis, searchTerm, dateFilter]);



  // Extract top strengths
  const topStrengths = useMemo(() => {
    if (!analysis?.analysis?.aspect_analysis?.top_strengths) return [];
    return analysis.analysis.aspect_analysis.top_strengths.map((strength) => ({
      aspect: strength[0],
      count: strength[1],
      ratio: strength[2],
    }));
  }, [analysis]);

  // Extract top concerns
  const topConcerns = useMemo(() => {
    if (!analysis?.analysis?.aspect_analysis?.top_concerns) return [];
    return analysis.analysis.aspect_analysis.top_concerns.map((concern) => ({
      aspect: concern[0],
      count: concern[1],
      ratio: concern[2],
    }));
  }, [analysis]);

  // Extract improvement suggestions
  const improvementSuggestions = useMemo(() => {
    if (!analysis?.analysis?.improvement_suggestions) return {};
    return analysis.analysis.improvement_suggestions;
  }, [analysis]);

  const CustomPieChartLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {name}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <div className="text-lg text-indigo-600 font-medium mt-4">
            Loading feedback analysis...
          </div>
          <p className="text-gray-500 mt-2">
            This may take a moment as we process your customer feedback
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 border border-red-200">
          <div className="flex items-center text-red-500 mb-4">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold">Error Loading Data</h1>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={getFeedbackData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-indigo-600 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Customer Feedback Insights
            </h1>

            <div className="flex space-x-4">
              <div className="relative">
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All time</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="quarter">Last 90 days</option>
                </select>
                <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>

              <button
                className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm flex items-center hover:bg-indigo-700 transition-colors"
                onClick={getFeedbackData}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <Tab
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<BarChart2 />}
            label="Overview"
          />
          <Tab
            active={activeTab === "feedbacks"}
            onClick={() => setActiveTab("feedbacks")}
            icon={<MessageSquare />}
            label="Feedbacks"
          />
          <Tab
            active={activeTab === "aspects"}
            onClick={() => setActiveTab("aspects")}
            icon={<PieChartIcon />}
            label="Aspects"
          />
          <Tab
            active={activeTab === "trends"}
            onClick={() => setActiveTab("trends")}
            icon={<TrendingUp />}
            label="Trends"
          />
          <Tab
            active={activeTab === "suggestions"}
            onClick={() => setActiveTab("suggestions")}
            icon={<List />}
            label="Improvement Suggestions"
          />
        </div>

        {/* Overview Stats */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard
                title="Total Feedbacks"
                value={analysis?.raw_data?.length || 0}
                icon={<MessageSquare />}
                color="primary"
              />
              <StatCard
                title="Average Rating"
                value={
                  analysis?.analysis?.satisfaction_metrics?.average_rating?.toFixed(
                    1
                  ) || 0
                }
                subtitle="/ 5"
                icon={<Star />}
                color="secondary"
              />
              <StatCard
                title="Customer Satisfaction"
                value={`${Math.round(
                  analysis?.analysis?.satisfaction_metrics?.csat_score || 0
                )}%`}
                icon={<Award />}
                color="info"
              />
              <StatCard
                title="Positive Sentiment"
                value={`${Math.round(
                  analysis?.analysis?.sentiment_analysis?.positive_percentage ||
                    0
                )}%`}
                icon={<ThumbsUp />}
                color="success"
              />
            </div>

            {/* Summary and Sentiment Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                    Summary
                  </h2>
                  <Badge color="primary">
                    {analysis?.raw_data?.length || 0} reviews
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-indigo-800 mb-1">
                      Overall
                    </h3>
                    <p className="text-gray-700">
                      {analysis?.analysis?.summary?.overall_summary ||
                        "No summary available"}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-green-800 mb-1">
                      Positive Feedback
                    </h3>
                    <p className="text-gray-700">
                      {analysis?.analysis?.summary?.positive_summary ||
                        "No positive summary available"}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">
                      Areas for Improvement
                    </h3>
                    <p className="text-gray-700">
                      {analysis?.analysis?.summary?.negative_summary ||
                        "No negative summary available"}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-indigo-500" />
                    Sentiment Distribution
                  </h2>
                  <Badge color="primary">
                    {analysis?.raw_data?.length || 0} reviews
                  </Badge>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareSentimentData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                        contentStyle={{
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          border: "none",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        name="Count"
                        barSize={50}
                        radius={[4, 4, 0, 0]}
                      >
                        {prepareSentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Top Keywords and Strengths/Concerns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-1">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <Tag className="h-5 w-5 mr-2 text-indigo-500" />
                    Top Keywords
                  </h2>
                  <Badge color="primary">
                    {prepareKeywordsData.length} keywords
                  </Badge>
                </div>
                <div className="h-[300px] flex items-center justify-center">
                  {prepareKeywordsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareKeywordsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={CustomPieChartLabel}
                          outerRadius={100}
                          innerRadius={40}
                          dataKey="value"
                        >
                          {prepareKeywordsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                Object.values(COLORS)[
                                  index % Object.values(COLORS).length
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} mentions`,
                            name,
                          ]}
                          contentStyle={{
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            border: "none",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          layout="horizontal"
                          wrapperStyle={{ paddingTop: "20px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-gray-400 text-center">
                      No keyword data available
                    </div>
                  )}
                </div>
              </Card>

              <Card className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-500" />
                    Key Insights
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                      Top Strengths
                    </h3>
                    <div className="space-y-3">
                      {topStrengths.length > 0 ? (
                        topStrengths.map((strength, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold mr-2">
                                {index + 1}
                              </div>
                              <span className="text-sm text-gray-700 font-medium capitalize">
                                {strength.aspect}
                              </span>
                            </div>
                            <Badge color="success">
                              {strength.count} mentions
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-center p-4">
                          No strengths data available
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                      Top Concerns
                    </h3>
                    <div className="space-y-3">
                      {topConcerns.length > 0 ? (
                        topConcerns.map((concern, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold mr-2">
                                {index + 1}
                              </div>
                              <span className="text-sm text-gray-700 font-medium capitalize">
                                {concern.aspect}
                              </span>
                            </div>
                            <Badge color="danger">
                              {concern.count} mentions
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-center p-4">
                          No concerns data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Examples Grid */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-indigo-500" />
                    Representative Feedback
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                      Positive Highlights
                    </h3>
                    {analysis?.analysis?.sentiment_analysis
                      ?.representative_positive?.length > 0 ? (
                      <div className="space-y-3">
                        {analysis.analysis.sentiment_analysis.representative_positive.map(
                          (feedback, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-green-50 rounded-lg"
                            >
                              <p className="text-sm text-gray-700">
                                {feedback}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center p-4">
                        No positive examples available
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <ThumbsDown className="h-4 w-4 mr-1 text-red-500" />
                      Negative Highlights
                    </h3>
                    {analysis?.analysis?.sentiment_analysis
                      ?.representative_negative?.length > 0 ? (
                      <div className="space-y-3">
                        {analysis.analysis.sentiment_analysis.representative_negative.map(
                          (feedback, idx) => (
                            <div key={idx} className="p-3 bg-red-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                {feedback}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center p-4">
                        No negative examples available
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === "feedbacks" && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-indigo-500" />
                  Customer Feedbacks
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search feedbacks..."
                      className="pl-9 pr-4 py-2 w-full sm:w-auto text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  <Badge color="primary">
                    {getFilteredFeedbacks.length} results
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Feedback list */}
              <div className="md:col-span-1">
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {getFilteredFeedbacks.map((feedback, index) => (
                    <FeedbackCard
                      key={index}
                      feedback={feedback}
                      onAnalyze={analyzeFeedback}
                    />
                  ))}
                  {getFilteredFeedbacks.length === 0 && (
                    <div className="text-center text-gray-400 py-6 bg-white rounded-lg shadow-sm border border-gray-100">
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-lg font-medium">
                        No feedbacks match your search
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Try adjusting your filters
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback detail/analysis */}
              <div className="md:col-span-1">
                {selectedFeedback ? (
                  <Card className="h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        Feedback Analysis
                      </h3>
                      <button
                        onClick={() => setSelectedFeedback(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <p className="text-gray-700">
                        {selectedFeedback.feedback}
                      </p>
                      <div className="flex items-center mt-3">
                        <span className="text-xs text-gray-500 font-medium mr-3">
                          {selectedFeedback.customer_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(selectedFeedback.time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {analyzing ? (
                      <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-3 text-gray-600">
                          Analyzing feedback...
                        </p>
                      </div>
                    ) : feedbackAnalysis ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Sentiment Analysis
                          </h4>
                          <div
                            className="flex items-center p-3 rounded-lg"
                            style={{
                              backgroundColor:
                                feedbackAnalysis.sentiment.label === "POSITIVE"
                                  ? "#ecfdf5"
                                  : feedbackAnalysis.sentiment.label ===
                                    "NEGATIVE"
                                  ? "#fef2f2"
                                  : "#f3f4f6",
                            }}
                          >
                            {feedbackAnalysis.sentiment.label === "POSITIVE" ? (
                              <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
                            ) : feedbackAnalysis.sentiment.label ===
                              "NEGATIVE" ? (
                              <ThumbsDown className="h-5 w-5 text-red-600 mr-2" />
                            ) : (
                              <Info className="h-5 w-5 text-gray-500 mr-2" />
                            )}
                            <div>
                              <p
                                className="font-medium"
                                style={{
                                  color:
                                    feedbackAnalysis.sentiment.label ===
                                    "POSITIVE"
                                      ? "#10b981"
                                      : feedbackAnalysis.sentiment.label ===
                                        "NEGATIVE"
                                      ? "#ef4444"
                                      : "#6b7280",
                                }}
                              >
                                {feedbackAnalysis.sentiment.label.charAt(0) +
                                  feedbackAnalysis.sentiment.label
                                    .slice(1)
                                    .toLowerCase()}
                              </p>
                              <p className="text-xs text-gray-600">
                                Confidence:{" "}
                                {Math.round(
                                  feedbackAnalysis.sentiment.score * 100
                                )}
                                %
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Improvement Suggestions
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(feedbackAnalysis.suggestions).map(
                              ([category, suggestions], idx) =>
                                suggestions.length > 0 && (
                                  <div
                                    key={idx}
                                    className="p-3 bg-gray-50 rounded-lg"
                                  >
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                      {category}
                                    </p>
                                    <ul className="space-y-1">
                                      {suggestions.map((suggestion, sidx) => (
                                        <li
                                          key={sidx}
                                          className="text-sm text-gray-700 flex items-start"
                                        >
                                          <ArrowRight className="h-3.5 w-3.5 text-indigo-500 mt-0.5 mr-1.5 flex-shrink-0" />
                                          {suggestion}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                            )}
                            {Object.values(feedbackAnalysis.suggestions).flat()
                              .length === 0 && (
                              <p className="text-center text-gray-500 py-2">
                                No specific suggestions available
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          Click "Analyze feedback" to get detailed insights
                        </p>
                      </div>
                    )}
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">
                        Select a feedback
                      </h3>
                      <p className="text-gray-500 max-w-xs mx-auto">
                        Choose a feedback item from the list to view its
                        analysis and get improvement suggestions
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "aspects" && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-indigo-500" />
                Aspect Analysis
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Breakdown of customer feedback by specific aspects of your
                restaurant experience
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Aspect Sentiment Distribution
                </h3>
                <div className="h-[400px]">
                  {prepareAspectsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={prepareAspectsData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 100, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                          contentStyle={{
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            border: "none",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="positive"
                          name="Positive"
                          stackId="a"
                          fill={COLORS.success}
                        />
                        <Bar
                          dataKey="negative"
                          name="Negative"
                          stackId="a"
                          fill={COLORS.danger}
                        />
                        <Bar
                          dataKey="neutral"
                          name="Neutral"
                          stackId="a"
                          fill={COLORS.neutral}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-400">
                        <PieChartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No aspect data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Aspect Details
                </h3>

                {analysis?.analysis?.aspect_analysis?.aspects ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {Object.entries(
                      analysis.analysis.aspect_analysis.aspects
                    ).map(([aspect, data], idx) => (
                      <div
                        key={idx}
                        className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800 capitalize flex items-center">
                            {aspect}
                          </h4>
                          <Badge
                            color={
                              data.sentiment_ratio.positive >
                              data.sentiment_ratio.negative
                                ? "success"
                                : "danger"
                            }
                          >
                            {data.mention_count} mentions
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                              <span className="text-xs text-gray-500">
                                {Math.round(
                                  data.sentiment_ratio.positive * 100
                                )}
                                %
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                              <span className="text-xs text-gray-500">
                                {Math.round(
                                  data.sentiment_ratio.negative * 100
                                )}
                                %
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div className="h-3 w-3 rounded-full bg-gray-400 mr-1"></div>
                              <span className="text-xs text-gray-500">
                                {Math.round(data.sentiment_ratio.neutral * 100)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {data.examples.positive &&
                            data.examples.positive.length > 0 && (
                              <div className="p-2 bg-green-50 rounded-md">
                                <p className="text-xs font-medium text-green-800 mb-1">
                                  Positive Example
                                </p>
                                <p className="text-xs text-gray-700">
                                  {data.examples.positive[0]}
                                </p>
                              </div>
                            )}

                          {data.examples.negative &&
                            data.examples.negative.length > 0 && (
                              <div className="p-2 bg-red-50 rounded-md">
                                <p className="text-xs font-medium text-red-800 mb-1">
                                  Negative Example
                                </p>
                                <p className="text-xs text-gray-700">
                                  {data.examples.negative[0]}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No aspect details available</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {/* Trends Tab */}
        {activeTab === "trends" && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" />
                Feedback Trends
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Track how customer sentiment has changed over time
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <Card>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Sentiment Trend
                </h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={generateSentimentTrendData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          border: "none",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="positive"
                        stackId="1"
                        stroke={COLORS.success}
                        fill={COLORS.success + "33"} // 20% opacity
                        name="Positive"
                      />
                      <Area
                        type="monotone"
                        dataKey="negative"
                        stackId="1"
                        stroke={COLORS.danger}
                        fill={COLORS.danger + "33"} // 20% opacity
                        name="Negative"
                      />
                      <Area
                        type="monotone"
                        dataKey="neutral"
                        stackId="1"
                        stroke={COLORS.neutral}
                        fill={COLORS.neutral + "33"} // 20% opacity
                        name="Neutral"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 ${
                        analysis?.analysis?.temporal_analysis
                          ?.trend_direction === "improving"
                          ? "bg-green-100"
                          : analysis?.analysis?.temporal_analysis
                              ?.trend_direction === "deteriorating"
                          ? "bg-red-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {analysis?.analysis?.temporal_analysis
                        ?.trend_direction === "improving" ? (
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      ) : analysis?.analysis?.temporal_analysis
                          ?.trend_direction === "deteriorating" ? (
                        <TrendingDown className="h-8 w-8 text-red-600" />
                      ) : (
                        <Activity className="h-8 w-8 text-gray-600" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-1">Trend Direction</h3>
                    <p
                      className={`text-md font-medium capitalize ${
                        analysis?.analysis?.temporal_analysis
                          ?.trend_direction === "improving"
                          ? "text-green-600"
                          : analysis?.analysis?.temporal_analysis
                              ?.trend_direction === "deteriorating"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {analysis?.analysis?.temporal_analysis?.trend_direction ||
                        "Stable"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {analysis?.analysis?.temporal_analysis
                        ?.trend_direction === "improving"
                        ? "Customer satisfaction is trending upward"
                        : analysis?.analysis?.temporal_analysis
                            ?.trend_direction === "deteriorating"
                        ? "Customer satisfaction is trending downward"
                        : "Customer satisfaction is relatively stable"}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                      <MessageSquare className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Feedback Volume</h3>
                    <p className="text-md font-medium">
                      {analysis?.raw_data?.length || 0} total
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Across{" "}
                      {analysis?.analysis?.temporal_analysis?.total_periods ||
                        0}{" "}
                      time periods
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                      <Star className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Average Rating</h3>
                    <p className="text-md font-medium">
                      {analysis?.analysis?.satisfaction_metrics?.average_rating?.toFixed(
                        1
                      ) || 0}{" "}
                      / 5
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Based on sentiment analysis
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Improvement Suggestions Tab */}
        {activeTab === "suggestions" && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <List className="h-5 w-5 mr-2 text-indigo-500" />
                Improvement Suggestions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                AI-generated actionable suggestions to improve customer
                satisfaction
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Service Improvements
                  </h3>
                </div>
                <div className="space-y-3">
                  {improvementSuggestions.service &&
                  improvementSuggestions.service.length > 0 ? (
                    improvementSuggestions.service.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start p-3 bg-blue-50 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-2 shrink-0 mt-0.5" />
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 p-6">
                      <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No service suggestions available</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Food Improvements
                  </h3>
                </div>
                <div className="space-y-3">
                  {improvementSuggestions.food &&
                  improvementSuggestions.food.length > 0 ? (
                    improvementSuggestions.food.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start p-3 bg-green-50 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 shrink-0 mt-0.5" />
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 p-6">
                      <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No food suggestions available</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                    <List className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Ambience Improvements
                  </h3>
                </div>
                <div className="space-y-3">
                  {improvementSuggestions.ambience &&
                  improvementSuggestions.ambience.length > 0 ? (
                    improvementSuggestions.ambience.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start p-3 bg-amber-50 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-amber-600 mr-2 shrink-0 mt-0.5" />
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 p-6">
                      <List className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No ambience suggestions available</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Other Suggestions
                  </h3>
                </div>
                <div className="space-y-3">
                  {improvementSuggestions.other &&
                  improvementSuggestions.other.length > 0 ? (
                    improvementSuggestions.other.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start p-3 bg-purple-50 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-purple-600 mr-2 shrink-0 mt-0.5" />
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 p-6">
                      <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                      <p>No additional suggestions available</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackAnalysis;
