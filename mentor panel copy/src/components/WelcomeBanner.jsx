import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const WelcomeBanner = () => {
  const [mentorData, setMentorData] = useState({
    name: "Dr. Rajesh Kumar",
    teamsCount: 0,
    pendingFeedback: 0,
    currentRound: "Round 2"
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      const token = localStorage.getItem("mentorToken");
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch mentor data and teams in parallel
      const [mentorResponse, teamsResponse, feedbackResponse] = await Promise.all([
        fetch("http://localhost:8000/mentor-app/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:8000/mentor-app/teams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:8000/mentor-feedback/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      if (mentorResponse.ok && teamsResponse.ok) {
        const mentorData = await mentorResponse.json();
        const teamsData = await teamsResponse.json();
        const feedbackData = feedbackResponse.ok ? await feedbackResponse.json() : { data: {} };

        const mentor = mentorData.data?.mentor;
        const teams = teamsData.data || [];
        
        // Calculate pending feedback (teams without recent feedback)
        const teamsWithFeedback = new Set();
        if (feedbackData.data?.recentFeedback) {
          feedbackData.data.recentFeedback.forEach(fb => {
            teamsWithFeedback.add(fb.teamName);
          });
        }
        const pendingFeedback = Math.max(0, teams.length - teamsWithFeedback.size);

        setMentorData({
          name: mentor?.name || "Mentor",
          teamsCount: teams.length,
          pendingFeedback: pendingFeedback,
          currentRound: "Round 2" // You can make this dynamic based on your system
        });
      }
    } catch (error) {
      console.error("Error fetching mentor data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCTA = () => {
    toast({ 
      title: "Getting Started", 
      description: "Explore your assigned teams and pending feedback." 
    });
  };

  if (loading) {
    return (
      <section className="rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent p-8 text-primary-foreground shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-secondary" />
              <h2 className="text-2xl font-bold">Loading...</h2>
            </div>
            <p className="mb-4 text-primary-foreground/90">Senior Mentor | GLA University Hackathon 2025</p>
            <div className="flex flex-wrap items-end gap-6 text-sm">
              <div>
                <p className="text-primary-foreground/80">Teams Assigned</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div>
                <p className="text-primary-foreground/80">Feedback Pending</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div>
                <p className="text-primary-foreground/80">Current Round</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent p-8 text-primary-foreground shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-secondary" />
            <h2 className="text-2xl font-bold">Welcome, {mentorData.name}</h2>
          </div>
          <p className="mb-4 text-primary-foreground/90">Senior Mentor | GLA University Hackathon 2025</p>
          <div className="flex flex-wrap items-end gap-6 text-sm">
            <div>
              <p className="text-primary-foreground/80">Teams Assigned</p>
              <p className="text-2xl font-bold">{mentorData.teamsCount}</p>
            </div>
            <div>
              <p className="text-primary-foreground/80">Feedback Pending</p>
              <p className="text-2xl font-bold">{mentorData.pendingFeedback}</p>
            </div>
            <div>
              <p className="text-primary-foreground/80">Current Round</p>
              <p className="text-2xl font-bold">{mentorData.currentRound}</p>
            </div>
            <Button variant="secondary" onClick={handleCTA}>Get Started</Button>
          </div>
        </div>
        <div className="hidden items-center justify-center rounded-lg bg-secondary/20 p-4 lg:flex">
          <img 
            src="https://api.dicebear.com/7.x/shapes/svg?seed=gla" 
            alt="GLA Logo" 
            className="h-20 w-20 opacity-80" 
          />
        </div>
      </div>
    </section>
  );
};

export default WelcomeBanner;