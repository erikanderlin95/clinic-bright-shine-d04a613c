import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const Phase1Notice = () => {
  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardContent className="flex gap-3 p-4">
        <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-foreground">Phase 1 Notice</h4>
          <ul className="text-sm text-muted-foreground space-y-0.5">
            <li>• Queue-only system</li>
            <li>• Manual messaging only</li>
            <li>• No PDPA-sensitive data stored</li>
            <li>• No medical records</li>
            <li>• No triage or visit reason</li>
            <li>• Automation will come in Phase 2</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
