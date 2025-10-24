import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

const NavigationBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="link"
            className="text-xl font-bold p-0"
            onClick={() => navigate("/")}
          >
            MediTime
          </Button>
          <Button
            variant="link"
            className="text-muted-foreground"
            onClick={() => navigate("/practices")}
          >
            Praxen
          </Button>
        </div>

        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => navigate(
                    user?.user_metadata?.role === "practice" 
                      ? "/practice/dashboard" 
                      : "/dashboard"
                  )}
                >
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  try {
                    await signOut();
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}>
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Anmelden
              </Button>
              <Button onClick={() => navigate("/auth?tab=signup")}>
                Registrieren
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;