import { useState } from "react";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import codoraLogo from "@/assets/codora-logo.png";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const notificationCount = 3;

  const navLinks = [
    { name: "Dashboard", path: "/", exact: true },
    { name: "Teams Assigned", path: "/teams" },
    { name: "Feedback", path: "/feedback" },
    { name: "Notifications", path: "/notifications" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-primary shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={codoraLogo} 
              alt="Codora AI Logo" 
              className="h-10 w-10 object-contain"
            />
            <div className="hidden flex-col sm:flex">
              <h1 className="text-sm font-bold leading-tight text-primary-foreground">
                Hackathon 2025
              </h1>
              <p className="text-xs text-primary-foreground/80">Mentor Panel</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = link.exact 
                ? location.pathname === link.path 
                : location.pathname.startsWith(link.path);
              
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-primary-foreground/90 hover:bg-primary-foreground/10"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
                  {notificationCount}
                </Badge>
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=mentor" />
                    <AvatarFallback className="bg-secondary text-primary">
                      DR
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">Dr. Rajesh Kumar</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">Dr. Rajesh Kumar</span>
                    <span className="text-xs text-muted-foreground">Senior Mentor</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>My Feedback History</DropdownMenuItem>
                <DropdownMenuItem>Help & Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-primary-foreground/20 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = link.exact 
                  ? location.pathname === link.path 
                  : location.pathname.startsWith(link.path);
                
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-primary-foreground/90 hover:bg-primary-foreground/10"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
