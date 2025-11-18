import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, Bell } from "lucide-react";
import "./MentorSidebar.css";

const MentorSidebar = () => {
  const location = useLocation();

  const items = [
    { to: "/", label: "Dashboard", icon: Home, exact: true },
    { to: "/teams", label: "Teams Assigned", icon: Users },
    { to: "/feedback", label: "Feedback", icon: MessageSquare },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ];

  const isActive = (to, exact) => (exact ? location.pathname === to : location.pathname.startsWith(to));

  return (
    <div className="ms-root">
      <div className="ms-header">
        <div className="ms-logo">G</div>
        <div className="ms-brand">
          <div className="ms-title">GLA Mentor</div>
          <div className="ms-subtitle">Hackathon Panel</div>
        </div>
      </div>
      <div className="ms-section-label">Navigation</div>
      <nav className="ms-menu">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className={`ms-item ${isActive(item.to, item.exact) ? "active" : ""}`}>
            <item.icon size={16} />
            <span className="ms-item-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="ms-footer">
        <div className="ms-user">
          <div className="ms-avatar">M</div>
          <div className="ms-user-meta">
            <div className="ms-user-role">Logged in as</div>
            <div className="ms-user-name">Mentor</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorSidebar;


