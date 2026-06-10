import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/forms/FormField";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpValues) => {
    setIsLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: "agent",
          },
        },
      });

      if (signUpError) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: signUpError.message,
        });
        return;
      }

      // If successful, we need to create the app_users row.
      // Usually, this is done by a trigger in Supabase. If not, we do it here.
      if (authData.user) {
        const { error: dbError } = await supabase.from("app_users").insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          role: "agent",
        });

        if (dbError && dbError.code !== "23505") { // Ignore unique constraint if trigger already created it
          console.error("Failed to create app_user profile:", dbError);
        }
      }

      navigate("/connect-ghl");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: err.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Sign up as an agent">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full Name" error={errors.fullName?.message}>
          <Input 
            placeholder="John Doe" 
            {...register("fullName")} 
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input 
            type="email" 
            placeholder="you@example.com" 
            {...register("email")} 
            disabled={isLoading}
          />
        </FormField>
        
        <FormField label="Password" error={errors.password?.message}>
          <Input 
            type="password" 
            placeholder="••••••••" 
            {...register("password")} 
            disabled={isLoading}
          />
        </FormField>

        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Up
        </Button>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
