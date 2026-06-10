import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { AlertCircle, Link as LinkIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ConnectGhl() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleConnect = () => {
    if (!user) return;
    setIsConnecting(true);
    
    const redirectUri = encodeURIComponent(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ghl-oauth-callback`);
    const clientId = import.meta.env.VITE_GHL_CLIENT_ID || "PLACEHOLDER_CLIENT_ID";
    const authUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${redirectUri}&client_id=${clientId}&scope=locations.readonly%20contacts.readonly%20contacts.write&state=${user.id}`;
    
    window.location.href = authUrl;
  };

  if (status === "success") {
    return (
      <AuthLayout title="Connection Successful" subtitle="Your CRM account is connected.">
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Connect CRM" subtitle="Link your CRM to sync contacts and pipeline.">
      <div className="space-y-6">
        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Failed</AlertTitle>
            <AlertDescription>
              We couldn't connect to the CRM. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleConnect} 
          className="w-full" 
          size="lg"
          disabled={isConnecting || !user}
        >
          {isConnecting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LinkIcon className="mr-2 h-5 w-5" />
          )}
          Connect CRM
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You will be redirected to authorize access.
        </p>
      </div>
    </AuthLayout>
  );
}
