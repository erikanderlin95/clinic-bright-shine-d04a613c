import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type AuthClient = {
  auth: {
    oauth: {
      getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
      approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
      denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
    };
  };
};

const oauth = () => (supabase as unknown as AuthClient).auth.oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        {error ? (
          <CardHeader>
            <CardTitle>Authorization failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        ) : !details ? (
          <CardContent className="flex items-center gap-3 py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading authorization request…</span>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Connect {details.client?.name ?? "an app"}</CardTitle>
              <CardDescription>
                This lets {details.client?.name ?? "the client"} read and manage clinic queue,
                doctor and appointment data as you.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button disabled={busy} onClick={() => decide(true)} className="flex-1">
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
              </Button>
              <Button
                disabled={busy}
                variant="outline"
                onClick={() => decide(false)}
                className="flex-1"
              >
                Deny
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  );
};

export default OAuthConsent;
