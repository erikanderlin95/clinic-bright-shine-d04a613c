import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireStaff?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireStaff = true,
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isStaff, isAdmin, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated but doesn't have a role yet (waiting for role assignment)
  if (requireStaff && !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-semibold mb-2">Access Pending</h2>
          <p className="text-muted-foreground">
            Your account has been created but you don't have staff access yet. 
            Please contact an administrator to assign your role.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Current role: {role || "None"}
          </p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground">
            You need administrator privileges to access this section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
