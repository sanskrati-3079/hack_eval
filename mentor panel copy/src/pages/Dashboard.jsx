import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import WelcomeBanner from "@/components/WelcomeBanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, AlertCircle, TrendingUp, Clock, Star } from "lucide-react";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalTeams: 0,
    pendingFeedback: 0,
    activeIssues: 0,
    progressRate: 0,
    recentActivities: [],
    feedbackStats: {}
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("mentorToken");
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please login first",
        });
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [teamsResponse, feedbackResponse, statsResponse] = await Promise.all([
        fetch("http://localhost:8000/mentor-app/teams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:8000/mentor-feedback/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:8000/mentor-app/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      if (!teamsResponse.ok || !feedbackResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const teamsData = await teamsResponse.json();
      const feedbackData = await feedbackResponse.json();
      const mentorData = await statsResponse.json();

      // Calculate dashboard metrics
      const totalTeams = teamsData.data?.length || 0;
      const feedbackStats = feedbackData.data || {};
      const mentor = mentorData.data?.mentor;

      // Calculate pending feedback (teams without recent feedback)
      const teamsWithFeedback = new Set();
      if (feedbackStats.recentFeedback) {
        feedbackStats.recentFeedback.forEach(fb => {
          teamsWithFeedback.add(fb.teamName);
        });
      }
      const pendingFeedback = totalTeams - teamsWithFeedback.size;

      // Calculate progress rate based on feedback given
      const progressRate = totalTeams > 0 
        ? Math.round((teamsWithFeedback.size / totalTeams) * 100)
        : 0;

      // Generate recent activities from feedback and team data
      const recentActivities = generateRecentActivities(
        feedbackStats.recentFeedback || [],
        teamsData.data || []
      );

      setDashboardData({
        totalTeams,
        pendingFeedback: Math.max(0, pendingFeedback),
        activeIssues: calculateActiveIssues(teamsData.data || []),
        progressRate,
        recentActivities,
        feedbackStats,
        mentorName: mentor?.name || "Mentor"
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (recentFeedback, teams) => {
    const activities = [];

    // Add feedback activities
    recentFeedback.slice(0, 3).forEach(feedback => {
      activities.push({
        team: feedback.teamName,
        action: `Provided ${feedback.category} feedback`,
        time: formatTimeAgo(new Date(feedback.createdAt)),
        type: 'feedback',
        icon: MessageSquare
      });
    });

    // Add team activities (mock data for now - you can replace with real team activities)
    teams.slice(0, 2).forEach(team => {
      activities.push({
        team: team.teamName,
        action: "Updated project progress",
        time: "Recently",
        type: 'update',
        icon: Users
      });
    });

    // Sort by time (most recent first) and limit to 5
    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  };

  const calculateActiveIssues = (teams) => {
    // For now, we'll calculate based on teams without recent feedback
    // You can enhance this with actual issue tracking
    return teams.filter(team => {
      // Teams created recently but no feedback yet might need attention
      const teamCreated = new Date(team.createdAt);
      const daysSinceCreation = (Date.now() - teamCreated) / (1000 * 60 * 60 * 24);
      return daysSinceCreation > 2; // Teams older than 2 days without feedback
    }).length;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const stats = [
    { 
      title: "Total Teams", 
      value: dashboardData.totalTeams.toString(), 
      icon: Users, 
      description: "Teams assigned to you", 
      color: "text-blue-600", 
      bgColor: "bg-blue-100" 
    },
    { 
      title: "Pending Feedback", 
      value: dashboardData.pendingFeedback.toString(), 
      icon: MessageSquare, 
      description: "Awaiting your review", 
      color: "text-orange-600", 
      bgColor: "bg-orange-100" 
    },
    { 
      title: "Teams Needing Guidance", 
      value: dashboardData.activeIssues.toString(), 
      icon: AlertCircle, 
      description: "May need attention", 
      color: "text-red-600", 
      bgColor: "bg-red-100" 
    },
    { 
      title: "Feedback Progress", 
      value: `${dashboardData.progressRate}%`, 
      icon: TrendingUp, 
      description: "Teams with feedback", 
      color: "text-green-600", 
      bgColor: "bg-green-100" 
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <WelcomeBanner />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WelcomeBanner name={dashboardData.mentorName} />
      
      <div>
        <h2 className="mb-6 text-2xl font-bold text-foreground">Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <CardDescription className="mt-1 text-xs">{stat.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Stats Row */}
      {dashboardData.feedbackStats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <div className="rounded-lg bg-yellow-100 p-2">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData.feedbackStats.averageRating || 0}
              </div>
              <CardDescription className="mt-1 text-xs">
                Based on all feedback given
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <div className="rounded-lg bg-green-100 p-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData.feedbackStats.totalFeedback || 0}
              </div>
              <CardDescription className="mt-1 text-xs">
                Feedback entries submitted
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
              <div className="rounded-lg bg-purple-100 p-2">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {dashboardData.recentActivities.length > 0 ? 'Active' : 'None'}
              </div>
              <CardDescription className="mt-1 text-xs">
                {dashboardData.recentActivities.length} recent activities
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates from your assigned teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="rounded-full bg-primary/10 p-2">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.team}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activities</p>
                <p className="text-sm">Start by providing feedback to your teams</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you might want to perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <div className="rounded-lg bg-blue-100 p-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Give Feedback</p>
                <p className="text-sm text-muted-foreground">Provide guidance to teams</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <div className="rounded-lg bg-green-100 p-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">View Teams</p>
                <p className="text-sm text-muted-foreground">See all assigned teams</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
              <div className="rounded-lg bg-purple-100 p-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Progress Report</p>
                <p className="text-sm text-muted-foreground">View team progress</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;