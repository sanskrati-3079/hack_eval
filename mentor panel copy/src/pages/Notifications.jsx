import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  const notifications = [
    { id: 1, type: "team_update", title: "Code Warriors submitted Round 2 project", description: "The team has completed their submission for Round 2 evaluation", time: "2 hours ago", icon: Users, unread: true, color: "text-primary", bgColor: "bg-primary/10" },
    { id: 2, type: "feedback_request", title: "Tech Titans requested feedback", description: "Team needs guidance on blockchain implementation approach", time: "5 hours ago", icon: MessageSquare, unread: true, color: "text-secondary", bgColor: "bg-secondary/10" },
    { id: 3, type: "system", title: "Round 2 evaluation deadline approaching", description: "Please complete all pending feedback by January 20, 2025", time: "1 day ago", icon: Clock, unread: true, color: "text-accent", bgColor: "bg-accent/10" },
    { id: 4, type: "achievement", title: "Digital Pioneers advanced to Round 3", description: "Congratulations! One of your teams has progressed to the next round", time: "2 days ago", icon: Award, unread: false, color: "text-secondary", bgColor: "bg-secondary/10" },
    { id: 5, type: "team_update", title: "Innovation Squad updated documentation", description: "Team has uploaded revised project documentation for review", time: "3 days ago", icon: Users, unread: false, color: "text-primary", bgColor: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="mt-2 text-muted-foreground">Stay updated with team activities and important announcements</p>
        </div>
        <Button variant="outline">Mark all as read</Button>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`transition-all hover:shadow-md ${notification.unread ? "border-l-4 border-l-secondary" : ""}`}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`rounded-lg p-3 ${notification.bgColor}`}>
                  <notification.icon className={`h-5 w-5 ${notification.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold">{notification.title}</CardTitle>
                    {notification.unread && <Badge variant="secondary" className="ml-2">New</Badge>}
                  </div>
                  <CardContent className="p-0 pt-2">
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                  </CardContent>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Notifications;


