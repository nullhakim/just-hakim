import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Lock } from "lucide-react";

const FAMILY_ACCOUNTS = [
  { email: "husband@nullisa.com", label: "Husband", emoji: "👨" },
  { email: "wife@nullisa.com", label: "Wife", emoji: "👩" },
];

const Auth = () => {
  const { user, loading, signIn } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<typeof FAMILY_ACCOUNTS[0] | null>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setSubmitting(true);
    const { error } = await signIn(selectedAccount.email, password);
    if (error) {
      toast.error("Wrong password");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <CardTitle className="text-xl font-bold">NullHakim</CardTitle>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Money</span>
          </div>
          <CardDescription>
            {selectedAccount ? `Login as ${selectedAccount.label}` : "Who's logging in?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!selectedAccount ? (
            FAMILY_ACCOUNTS.map((acc) => (
              <Button
                key={acc.email}
                variant="outline"
                className="h-16 w-full justify-start gap-4 text-lg"
                onClick={() => { setSelectedAccount(acc); setPassword(""); }}
              >
                <span className="text-2xl">{acc.emoji}</span>
                {acc.label}
              </Button>
            ))
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex flex-col items-center gap-2 py-2">
                <span className="text-4xl">{selectedAccount.emoji}</span>
                <span className="text-sm font-medium">{selectedAccount.label}</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10"
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="h-12 w-full" disabled={submitting}>
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2 text-muted-foreground"
                onClick={() => setSelectedAccount(null)}
              >
                <ArrowLeft size={16} /> Back
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
