// pages/Feedback.jsx
import FeedbackPanel from "@/components/FeedbackPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Star, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Feedback = () => {
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    teamsWithFeedback: 0,
    recentFeedback: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("mentorToken");
      const response = await fetch("http://localhost:8000/mentor-feedback/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load feedback statistics",
      });
    }
  };

  const feedbackStats = [
    { 
      title: "Total Feedback Given", 
      value: stats.totalFeedback.toString(), 
      icon: CheckCircle2, 
      color: "text-green-600", 
      bgColor: "bg-green-100" 
    },
    { 
      title: "Teams Guided", 
      value: stats.teamsWithFeedback.toString(), 
      icon: MessageSquare, 
      color: "text-blue-600", 
      bgColor: "bg-blue-100" 
    },
    { 
      title: "Average Rating", 
      value: stats.averageRating.toString(), 
      icon: Star, 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-100" 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Feedback & Guidance</h1>
        <p className="mt-2 text-muted-foreground">Provide valuable feedback to teams and review past evaluations</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {feedbackStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <FeedbackPanel />
    </div>
  );
};

export default Feedback;