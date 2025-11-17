import { NavLink } from "./NavLink";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const QueueHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const navItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Queue", to: "/queue" },
    { label: "Appointments", to: "/appointments" },
    { label: "Messages", to: "/messages" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/auth");
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-6 justify-between">
        <div className="flex items-center gap-8">
          <Logo showTagline={false} />
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Today: {new Date().toLocaleDateString("en-GB", { 
              day: "2-digit", 
              month: "short", 
              year: "numeric" 
            })}
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
