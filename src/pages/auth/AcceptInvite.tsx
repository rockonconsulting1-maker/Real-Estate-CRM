import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/forms/FormField";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const acceptInviteSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AcceptInviteValues = z.infer<typeof acceptInviteSchema>;

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
  });

  const onSubmit = async (data: AcceptInviteValues) => {
    if (!token) return;
    setIsLoading(true);
    setErrorStatus(null);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      const { error: funcError } = await supabase.functions.invoke("accept-invite", {
        body: { token },
      });

      if (funcError) {
        if (funcError.context && funcError.context.status) {
          setErrorStatus(funcError.context.status);
          return;
        }
        throw new Error(funcError.message || "Failed to accept invite");
      }

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setErrorStatus(500);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid Invite">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Token</AlertTitle>
          <AlertDescription>
            This invite link is invalid. Please request a new invite.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full mt-6">
          <Link to="/sign-in">Go to Sign In</Link>
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Accept Invite" subtitle="Set a password to join your team">
      {errorStatus && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invite Error</AlertTitle>
          <AlertDescription>
            {errorStatus === 404 && "This invite could not be found."}
            {errorStatus === 410 && "This invite has expired or already been used."}
            {errorStatus === 403 && "Your email does not match this invite."}
            {errorStatus === 500 && "An unexpected error occurred. Please try again."}
            {![404, 410, 403, 500].includes(errorStatus) && "Failed to accept invite."}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="New Password" error={errors.password?.message}>
          <Input 
            type="password" 
            placeholder="••••••••" 
            {...register("password")} 
            disabled={isLoading}
          />
        </FormField>
        
        <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
          <Input 
            type="password" 
            placeholder="••••••••" 
            {...register("confirmPassword")} 
            disabled={isLoading}
          />
        </FormField>

        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Accept Invite
        </Button>
      </form>
    </AuthLayout>
  );
}
