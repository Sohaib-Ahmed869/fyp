import React, { useState, useEffect } from "react";
import AdminService from "../../../Services/adminService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from "lucide-react";

const Card = ({ children }) => (
  <div className="bg-white  rounded-lg shadow-md p-4">{children}</div>
);

const FeedbackAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFeedbackData();
  }, []);

  const getFeedbackData = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getFeedbackAnalysis();
      setAnalysis(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch feedback analysis");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-20 flex items-center justify-center">
        <div className="text-xl text-blue-500">
          Loading feedback analysis...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-20">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-20">
      <h1 className="text-2xl text-blue-500 mb-2">Feedback Analysis</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Analysis of customer feedback across all branches
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Feedbacks</p>
              <h3 className="text-2xl font-bold">
                {analysis?.raw_data?.length || 0}
              </h3>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <h3 className="text-2xl font-bold">
                {analysis?.analysis?.sentiment_analysis?.average_rating?.toFixed(
                  1
                ) || 0}
              </h3>
            </div>
            <ThumbsUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Common Issues</p>
              <h3 className="text-2xl font-bold">
                {analysis?.analysis?.common_issues?.total_issues || 0}
              </h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Negative Feedbacks</p>
              <h3 className="text-2xl font-bold">
                {analysis?.analysis?.sentiment_analysis
                  ?.rating_distribution?.[1] || 0}
              </h3>
            </div>
            <ThumbsDown className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-bold mb-4">Sentiment Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(
                  analysis?.analysis?.sentiment_analysis?.rating_distribution ||
                    {}
                ).map(([rating, count]) => ({
                  rating: `${rating} Star`,
                  count,
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-4">Common Issues</h2>
          <div className="space-y-4">
            {analysis?.analysis?.common_issues?.example_issues?.map(
              (issue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{issue}</span>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                    Issue
                  </span>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold mb-4">Keywords Analysis</h2>
        <div className="space-y-4">
          {Object.entries(
            analysis?.analysis?.keyword_analysis?.top_keywords || {}
          )
            .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
            .slice(0, 5) // Take only the top 5
            .map(([keyword, count], index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{keyword}</span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                  {count}
                </span>
              </div>
            ))}
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-bold mb-4 mt-4">Recent Feedbacks</h2>
        <div className="space-y-4">
          {analysis?.raw_data?.slice(0, 5).map((feedback, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">{feedback.feedback}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(feedback.time).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {feedback.customer_name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FeedbackAnalysis;
