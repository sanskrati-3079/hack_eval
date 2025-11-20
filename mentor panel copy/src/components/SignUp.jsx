import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Mail, Phone, MapPin, FileText, Lock, Eye, EyeOff,
  Code, Brain, Smartphone, Database, Palette, Cpu, Wifi, Rocket 
} from "lucide-react";

const MentorSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    bio: "",
    expertise: [],
    status: "active",
    availability: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Same expertise options as MentorManagement
  const expertiseOptions = ['AI/ML', 'Web Development', 'Mobile App', 'IoT', 'Data Science', 'UI/UX', 'Full Stack', 'Hardware'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Fixed expertise handling - same as MentorManagement
  const handleExpertiseChange = (expertise) => {
    const updatedExpertise = formData.expertise.includes(expertise)
      ? formData.expertise.filter(exp => exp !== expertise)
      : [...formData.expertise, expertise];
    setFormData({ ...formData, expertise: updatedExpertise });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long",
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        expertise: formData.expertise, // This will now be an array of strings
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        status: formData.status,
        availability: formData.availability
      };

      console.log("🚀 Sending registration request...", payload);

      const response = await fetch("http://localhost:8000/mentor-app/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📥 Registration response:", data);

      if (response.ok) {
        localStorage.setItem("mentorToken", data.data.accessToken);
        localStorage.setItem("mentor", JSON.stringify(data.data.mentor));
        
        toast({
          title: "Registration successful",
          description: "Welcome to the mentor dashboard!",
        });
        
        navigate("/");
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: data.message || "Please try again with different credentials",
        });
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Join as Mentor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your expertise and guide the next generation of innovators. 
            Fill out your details to start your mentoring journey.
          </p>
        </div>

        <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Account Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Account Information
                </h3>
                
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      FULL NAME
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      EMAIL
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    PASSWORD
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password (min. 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  Personal Information
                </h3>

                {/* Phone & Location Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      PHONE
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      LOCATION
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="Enter location"
                      value={formData.location}
                      onChange={handleChange}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-colors"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    BIO
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Enter mentor bio and experience..."
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Areas of Expertise Section - Fixed */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  AREAS OF EXPERTISE
                </h3>
                
                <div className="space-y-4">
                  {/* First Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {expertiseOptions.slice(0, 4).map((expertise) => (
                      <div key={expertise} className="flex items-center space-x-2">
                        <Checkbox
                          id={expertise}
                          checked={formData.expertise.includes(expertise)}
                          onCheckedChange={(checked) => 
                            handleExpertiseChange(expertise)
                          }
                          className="h-5 w-5 border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label 
                          htmlFor={expertise} 
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {expertise}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {expertiseOptions.slice(4, 8).map((expertise) => (
                      <div key={expertise} className="flex items-center space-x-2">
                        <Checkbox
                          id={expertise}
                          checked={formData.expertise.includes(expertise)}
                          onCheckedChange={(checked) => 
                            handleExpertiseChange(expertise)
                          }
                          className="h-5 w-5 border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label 
                          htmlFor={expertise} 
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {expertise}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status & Availability Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  MENTOR PREFERENCES
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      STATUS
                    </Label>
                    <div className="flex gap-4">
                      {["active", "busy", "inactive"].map((status) => (
                        <label key={status} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={formData.status === status}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {status}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      AVAILABILITY
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="availability"
                        checked={formData.availability}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Available for mentoring
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link 
                    to="/mentor-login" 
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5" />
                      Complete Registration
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MentorSignup;    