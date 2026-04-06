import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

const FAMILY_ACCOUNTS = [
  { email: "husband@nullisa.com", label: "Husband", emoji: "👨" },
  { email: "wife@nullisa.com", label: "Wife", emoji: "👩" },
];

const PASSWORD = "family123";

const Auth = () => {
  const { user, loading, signIn } = useAuth();
  const [submitting, setSubmitting] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (email: string) => {
    setSubmitting(email);
    const { error } = await signIn(email, PASSWORD);
    if (error) {
      toast.error(error.message);
    }
    setSubmitting(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <CardTitle className="text-xl font-bold">NullHakim</CardTitle>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Money</span>
          </div>
          <CardDescription>Who's logging in?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {FAMILY_ACCOUNTS.map((acc) => (
            <Button
              key={acc.email}
              variant="outline"
              className="h-16 w-full justify-start gap-4 text-lg"
              disabled={submitting !== null}
              onClick={() => handleLogin(acc.email)}
            >
              {submitting === acc.email ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="text-2xl">{acc.emoji}</span>
              )}
              {acc.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
