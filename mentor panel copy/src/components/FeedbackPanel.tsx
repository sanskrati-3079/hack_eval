// components/FeedbackPanel.jsx
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Plus, Trash2, Search, Filter } from "lucide-react";

const FeedbackPanel = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [filterTeam, setFilterTeam] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    teamName: "",
    feedback: "",
    rating: 0,
    category: "overall",
    round: "Round 1",
    suggestions: [""],
    strengths: [""],
    improvements: [""]
  });

  const categories = [
    { value: "technical", label: "Technical" },
    { value: "design", label: "Design" },
    { value: "presentation", label: "Presentation" },
    { value: "documentation", label: "Documentation" },
    { value: "overall", label: "Overall" }
  ];

  const rounds = ["Round 1", "Round 2", "Round 3", "Final"];

  useEffect(() => {
    fetchFeedback();
    fetchStats();
    fetchAssignedTeams();
  }, []);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem("mentorToken");
      const params = new URLSearchParams();
      if (filterTeam) params.append('teamName', filterTeam);
      if (filterCategory !== 'all') params.append('category', filterCategory);

      const response = await fetch(`http://localhost:8000/mentor-feedback?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.data.feedback || []);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch feedback",
      });
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const fetchAssignedTeams = async () => {
    try {
      const token = localStorage.getItem("mentorToken");
      const response = await fetch("http://localhost:8000/mentor-app/teams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssignedTeams(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching assigned teams:", error);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("mentorToken");
      const response = await fetch("http://localhost:8000/mentor-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          suggestions: formData.suggestions.filter(s => s.trim() !== ""),
          strengths: formData.strengths.filter(s => s.trim() !== ""),
          improvements: formData.improvements.filter(s => s.trim() !== "")
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Feedback submitted successfully",
        });
        setShowForm(false);
        setFormData({
          teamName: "",
          feedback: "",
          rating: 0,
          category: "overall",
          round: "Round 1",
          suggestions: [""],
          strengths: [""],
          improvements: [""]
        });
        fetchFeedback();
        fetchStats();
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback",
      });
    }
  };

  const addSuggestion = () => {
    setFormData(prev => ({
      ...prev,
      suggestions: [...prev.suggestions, ""]
    }));
  };

  const removeSuggestion = (index) => {
    setFormData(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter((_, i) => i !== index)
    }));
  };

  const updateSuggestion = (index, value) => {
    setFormData(prev => ({
      ...prev,
      suggestions: prev.suggestions.map((s, i) => i === index ? value : s)
    }));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getCategoryColor = (category) => {
    const colors = {
      technical: "bg-blue-100 text-blue-800",
      design: "bg-purple-100 text-purple-800",
      presentation: "bg-orange-100 text-orange-800",
      documentation: "bg-gray-100 text-gray-800",
      overall: "bg-green-100 text-green-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Provide Feedback</CardTitle>
            <CardDescription>Share your insights and guidance with the team</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName">Team</Label>
                  <Select value={formData.teamName} onValueChange={(value) => setFormData({...formData, teamName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedTeams.map(team => (
                        <SelectItem key={team._id} value={team.teamName}>
                          {team.teamName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="round">Round</Label>
                  <Select value={formData.round} onValueChange={(value) => setFormData({...formData, round: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rounds.map(round => (
                        <SelectItem key={round} value={round}>
                          {round}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          star <= formData.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                        }`}
                        onClick={() => setFormData({...formData, rating: star})}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                  placeholder="Provide detailed feedback..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Strengths</Label>
                {formData.strengths.map((strength, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <Input
                      value={strength}
                      onChange={(e) => updateSuggestion(index, e.target.value)}
                      placeholder="What did the team do well?"
                    />
                    {index > 0 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeSuggestion(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addSuggestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Strength
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">Submit Feedback</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by team..."
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="w-40"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchFeedback}>
            <Filter className="h-4 w-4 mr-2" />
            Apply
          </Button>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Feedback
        </Button>
      </div>

      {/* Feedback List */}
      <div className="grid gap-4">
        {feedback.map((item) => (
          <Card key={item._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.teamName}</CardTitle>
                  <CardDescription>
                    {item.round} • {new Date(item.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(item.category)}>
                    {categories.find(c => c.value === item.category)?.label}
                  </Badge>
                  <div className={`flex items-center ${getRatingColor(item.rating)}`}>
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 font-semibold">{item.rating}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{item.feedback}</p>
              
              {item.strengths && item.strengths.length > 0 && (
                <div className="mb-2">
                  <span className="text-sm font-medium">Strengths:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.strengths.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.suggestions && item.suggestions.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Suggestions:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.suggestions.map((suggestion, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {feedback.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No feedback found. Start by providing feedback to your teams.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FeedbackPanel;