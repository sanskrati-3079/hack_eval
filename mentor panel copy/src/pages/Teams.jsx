// components/Teams.jsx
import { useState, useEffect } from "react";
import TeamCard from "@/components/TeamCard";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
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

      const response = await fetch("http://localhost:8000/mentor-app/teams", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.data || []);
        console.log("✅ Teams fetched successfully:", data.data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch teams");
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch your assigned teams",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading teams...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Teams Assigned</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor and guide your assigned teams through the hackathon
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Active: {teams.filter(t => t.status === 'active').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Total: {teams.length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team, index) => (
          <TeamCard 
            key={team._id || index} 
            teamName={team.teamName}
            problemStatement={team.problemStatement}
            domain={team.domain}
            currentRound={team.currentRound}
            members={team.members ? team.members.length : 0}
            status={team.status}
            teamData={team} // Pass full team data for details
          />
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No teams assigned</h3>
          <p className="text-muted-foreground mt-2">
            You haven't been assigned any teams yet. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default Teams;