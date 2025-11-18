import { Bell, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import "./MentorHeader.css";
import codoraLogo from "@/assets/codora-logo.png";

const MentorHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const tabs = [
    { path: "/", label: "Dashboard" },
    { path: "/teams", label: "Teams" },
    { path: "/feedback", label: "Feedback" },
    { path: "/notifications", label: "Notifications" },
  ];

  // Get mentor data from localStorage
  const mentor = JSON.parse(localStorage.getItem("mentor") || "{}");

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("mentorToken");
    localStorage.removeItem("mentor");
    
    // Show success message
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    
    // Redirect to login page
    navigate("/mentor-login");
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "M";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mh-root">
      <div className="mh-left">
        <img src={codoraLogo} alt="Codora AI" className="mh-logo" />
        <div className="mh-title">Mentor Dashboard</div>
      </div>
      <div className="mh-tabs">
        {tabs.map((t) => (
          <Link 
            key={t.path} 
            to={t.path} 
            className={`mh-tab ${location.pathname === t.path ? 'active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="mh-spacer" />
      <button className="mh-pill" title="Current Round">
        Current Round: <span className="mh-pill-value">None</span>
      </button>
      <button className="mh-icon-btn" aria-label="Notifications">
        <Bell size={18} />
      </button>
      <div className="mh-profile">
        <div className="mh-avatar">
          {getInitials(mentor.name)}
        </div>
        <span className="mh-name">{mentor.name || "Mentor"}</span>
      </div>
      <button 
        className="mh-logout"
        onClick={handleLogout}
        title="Logout"
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default MentorHeader;