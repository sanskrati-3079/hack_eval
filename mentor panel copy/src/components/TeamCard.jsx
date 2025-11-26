// components/TeamCard.jsx
import { useState } from "react";
import { Users, Lightbulb, Award, ArrowRight, Mail, Phone, Calendar, Code, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const TeamCard = ({ teamName, problemStatement, domain, currentRound, members, status, teamData }) => {
  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };

  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleContactTeam = () => {
    toast({
      title: "Contacting Team",
      description: `Opening communication channel with ${teamName}`,
    });
  };

  const handleScheduleMeeting = () => {
    toast({
      title: "Schedule Meeting",
      description: `Scheduling meeting with ${teamName}`,
    });
  };

  return (
    <>
      <Card className="group transition-all hover:shadow-lg border-l-4 border-l-primary">
        <CardHeader>
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{teamName}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2 text-xs">
                  <span>{members} members</span>
                  <span>•</span>
                  <span>{currentRound}</span>
                </CardDescription>
              </div>
            </div>
            <Badge className={`${statusColors[status]} font-medium`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                Project
              </div>
              <p className="line-clamp-2 text-sm text-foreground">
                {teamData?.projectTitle || "No project title"}
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Award className="h-4 w-4" />
                Domain
              </div>
              <Badge variant="secondary" className="font-normal">
                {domain}
              </Badge>
            </div>
            <Button 
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
              onClick={handleOpen}
            >
              View Team Details
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {teamName}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{domain}</Badge>
                <span>{currentRound}</span>
                <Badge className={statusColors[status]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Project Information */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Project Information
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Title: </span>
                  <span className="text-muted-foreground">
                    {teamData?.projectTitle || "No title specified"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Description: </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {teamData?.projectDescription || "No description available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            {teamData?.members && teamData.members.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Team Members ({teamData.members.length})
                </h4>
                <div className="space-y-3">
                  {teamData.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {member.name}
                          {member.isLeader && (
                            <Badge variant="outline" className="text-xs">Team Leader</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1 mt-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technology Stack */}
            {teamData?.technologyStack && teamData.technologyStack.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {teamData.technologyStack.map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluation Status */}
            <div>
              <h4 className="font-semibold mb-2">Evaluation Status</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Status: {teamData?.evaluationStatus || "Not evaluated"}</div>
                {teamData?.evaluationScore && (
                  <div>Score: {teamData.evaluationScore}/100</div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleContactTeam} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Contact Team
            </Button>
            <Button onClick={handleScheduleMeeting}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeamCard;