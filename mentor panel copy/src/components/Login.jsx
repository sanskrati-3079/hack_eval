import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, LogIn, Brain, Sparkles, Eye, EyeOff } from "lucide-react";

const MentorLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🚀 Sending login request...");
      
      const response = await fetch("http://localhost:8000/mentor-app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📥 Login response:", data);

      if (response.ok) {
        // Store token and mentor data
        localStorage.setItem("mentorToken", data.data.accessToken);
        localStorage.setItem("mentor", JSON.stringify(data.data.mentor));
        
        console.log("💾 Token stored:", data.data.accessToken);
        console.log("💾 Mentor data stored:", data.data.mentor);
        
        toast({
          title: "Login successful",
          description: "Welcome back to your dashboard!",
        });
        
        // Redirect to dashboard
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Invalid email or password",
        });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Unable to connect to server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-20 opacity-10 animate-float">
        <Brain className="h-16 w-16 text-white" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-10 animate-float animation-delay-2000">
        <Sparkles className="h-16 w-16 text-white" />
      </div>

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl relative z-10 transform transition-all duration-300 hover:shadow-3xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-110">
              <LogIn className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Mentor Login
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Welcome back! Sign in to continue mentoring
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="pl-12 pr-4 py-6 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 rounded-xl bg-white/50 backdrop-blur-sm"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Password Field */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors duration-200" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="pl-12 pr-12 py-6 border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 rounded-xl bg-white/50 backdrop-blur-sm"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  <span>Sign In to Dashboard</span>
                </div>
              )}
            </Button>
          </form>
          
          {/* Signup Link */}
          <div className="text-center pt-4 border-t border-gray-200/50">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/mentor-signup" 
                className="font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-all duration-200"
              >
                Join as Mentor
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-sm">
        © 2024 Codora.AI - Mentor Platform
      </div>
    </div>
  );
};

export default MentorLogin;