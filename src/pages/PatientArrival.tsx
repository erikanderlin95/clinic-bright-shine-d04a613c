import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Users, Gauge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getQueueVisibilityMode, type QueueVisibilityMode } from "@/components/SettingsPanel";

// Mock count for demo — in production this comes from backend
const MOCK_PEOPLE_AHEAD = 7;

const getSmartWaitLabel = (count: number) => {
  if (count <= 3) return { label: "Low Wait", tone: "text-green-600 bg-green-50 border-green-200" };
  if (count <= 8) return { label: "Moderate Wait", tone: "text-amber-700 bg-amber-50 border-amber-200" };
  return { label: "Busy Now", tone: "text-red-600 bg-red-50 border-red-200" };
};

const PatientArrival = () => {
  const { token } = useParams();
  const { toast } = useToast();
  const [arrived, setArrived] = useState(false);
  const [mode, setMode] = useState<QueueVisibilityMode>("live");

  useEffect(() => {
    setMode(getQueueVisibilityMode());
  }, []);

  const handleArrival = () => {
    // In Phase 1, this is a mock. Phase 2 will connect to backend.
    setArrived(true);
    toast({
      title: "Arrival Confirmed",
      description: "Thank you! We've notified the clinic.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>ClinicQ - Queue Arrival</CardTitle>
          <CardDescription>
            Confirm your arrival at the clinic
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!arrived ? (
            <>
              <div className="rounded-lg border bg-muted p-4 text-center">
                <p className="text-sm font-medium text-foreground mb-1">Your Queue Token</p>
                <p className="text-2xl font-bold text-primary">{token || "XXXX"}</p>
              </div>
              
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleArrival}
              >
                <CheckCircle className="h-5 w-5" />
                I've Arrived
              </Button>
              
              <div className="rounded-lg border bg-muted p-4 text-center">
                <p className="text-sm font-medium text-foreground mb-1">Your Queue Token</p>
                <p className="text-2xl font-bold text-primary">{token || "XXXX"}</p>
              </div>

              {mode === "live" ? (
                <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Queue ahead of you</p>
                    <p className="text-lg font-semibold text-foreground">
                      {MOCK_PEOPLE_AHEAD} people ahead
                    </p>
                  </div>
                </div>
              ) : (
                (() => {
                  const { label, tone } = getSmartWaitLabel(MOCK_PEOPLE_AHEAD);
                  return (
                    <div className={`rounded-lg border p-4 flex items-center gap-3 ${tone}`}>
                      <div className="h-10 w-10 rounded-full bg-white/60 flex items-center justify-center">
                        <Gauge className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs opacity-80">Current wait status</p>
                        <p className="text-lg font-semibold">{label}</p>
                      </div>
                    </div>
                  );
                })()
              )}

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleArrival}
              >
                <CheckCircle className="h-5 w-5" />
                I've Arrived
              </Button>

              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>• Click the button when you arrive at the clinic</p>
                <p>• Your queue number will be called when ready</p>
                <p>• No personal data is stored (PDPA-compliant)</p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Arrival Confirmed!</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait for your queue number to be called.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientArrival;
