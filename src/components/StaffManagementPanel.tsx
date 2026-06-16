import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, KeyRound, Pencil, Power, ShieldAlert, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

type StaffRole = "Owner" | "Admin" | "Doctor" | "Staff" | "Receptionist";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  lastLogin?: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: "Create" | "Edit" | "Disable" | "Enable" | "Password Reset";
  performedBy: string;
  target: string;
  message: string;
}

const initialStaff: StaffMember[] = [
  { id: "1", name: "Dr. Emily Tan", email: "emily.tan@clinic.com", role: "Doctor", active: true, lastLogin: "2026-04-26 09:12" },
  { id: "2", name: "Admin User", email: "admin@clinic.com", role: "Admin", active: true, lastLogin: "2026-04-27 08:30" },
  { id: "3", name: "Jasmine Lee", email: "jasmine.lee@clinic.com", role: "Receptionist", active: true, lastLogin: "2026-04-26 17:45" },
  { id: "4", name: "Marcus Ong", email: "marcus.ong@clinic.com", role: "Staff", active: false, lastLogin: "2026-04-10 11:20" },
];

const initialAuditLog: AuditLogEntry[] = [
  {
    id: "a1",
    timestamp: "2026-04-25 14:22",
    action: "Create",
    performedBy: "Admin User",
    target: "Marcus Ong",
    message: "Admin created staff account for Marcus Ong",
  },
  {
    id: "a2",
    timestamp: "2026-04-26 09:01",
    action: "Disable",
    performedBy: "Admin User",
    target: "Marcus Ong",
    message: "Admin disabled account for Marcus Ong",
  },
];

const generatePassword = () =>
  Math.random().toString(36).slice(-10) + Math.floor(Math.random() * 100);

const formatTimestamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface StaffFormState {
  name: string;
  email: string;
  role: StaffRole;
  password: string;
  confirmPassword: string;
  sendCredentials: boolean;
}

const emptyForm: StaffFormState = {
  name: "",
  email: "",
  role: "Staff",
  password: "",
  confirmPassword: "",
  sendCredentials: true,
};

interface StaffManagementPanelProps {
  view?: "all" | "team" | "security";
  activityLimit?: number;
}

export const StaffManagementPanel = ({ view = "all", activityLimit }: StaffManagementPanelProps = {}) => {
  const { toast } = useToast();
  const { isAdmin, isLoading, user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(initialAuditLog);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAllLog, setShowAllLog] = useState(false);
  const [form, setForm] = useState<StaffFormState>(emptyForm);

  // Strict access control: only Owner/Admin (mapped to isAdmin) can view this panel.
  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!isAdmin) {
    // Block direct access — redirect unauthorized users to dashboard
    return <Navigate to="/" replace />;
  }

  const performerName = user?.email ?? "Admin";

  const appendLog = (
    action: AuditLogEntry["action"],
    target: string,
    message: string,
  ) => {
    setAuditLog((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: formatTimestamp(),
        action,
        performedBy: performerName,
        target,
        message,
      },
      ...prev,
    ]);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      password: "",
      confirmPassword: "",
      sendCredentials: false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    if (!editingId || form.password) {
      if (form.password.length < 6) {
        toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
        return;
      }
      if (form.password !== form.confirmPassword) {
        toast({ title: "Passwords don't match", variant: "destructive" });
        return;
      }
    }

    if (editingId) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === editingId ? { ...s, name: form.name, email: form.email, role: form.role } : s
        )
      );
      appendLog("Edit", form.name, `${performerName} edited staff account for ${form.name}`);
      toast({ title: "Staff updated" });
    } else {
      const newMember: StaffMember = {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        role: form.role,
        active: true,
      };
      setStaff((prev) => [...prev, newMember]);
      appendLog("Create", form.name, `${performerName} created staff account for ${form.name}`);
      toast({
        title: "Staff created",
        description: form.sendCredentials ? "Login credentials sent via email." : undefined,
      });
    }

    setDialogOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const toggleActive = (id: string) => {
    const member = staff.find((s) => s.id === id);
    if (!member) return;
    const willBeActive = !member.active;
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, active: willBeActive } : s)));
    appendLog(
      willBeActive ? "Enable" : "Disable",
      member.name,
      `${performerName} ${willBeActive ? "enabled" : "disabled"} account for ${member.name}`,
    );
    toast({
      title: willBeActive ? "Account enabled" : "Account disabled",
      description: willBeActive ? "User can now log in." : "User can no longer log in.",
    });
  };

  const resetPassword = (member: StaffMember) => {
    const newPwd = generatePassword();
    appendLog("Password Reset", member.name, `${performerName} reset password for ${member.name}`);
    toast({
      title: "Password reset",
      description: `New temporary password for ${member.name}: ${newPwd}`,
    });
  };

  const downloadAuditLogCSV = () => {
    const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    const headers = ["Date & Time", "Action", "Performed By", "Target", "Details"];
    const rows = auditLog.map((log) =>
      [log.timestamp, log.action, log.performedBy, log.target, log.message].map(escape).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Activity log downloaded" });
  };

  const actionBadgeVariant = (action: AuditLogEntry["action"]) => {
    switch (action) {
      case "Disable":
        return "destructive" as const;
      case "Create":
      case "Enable":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  const showTeam = view === "all" || view === "team";
  const showSecurity = view === "all" || view === "security";
  const visibleLog = showSecurity && activityLimit && !showAllLog ? auditLog.slice(0, activityLimit) : auditLog;

  return (
    <div className="space-y-8">
      {showTeam && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Staff Management</h2>
              <p className="text-sm text-muted-foreground mt-2">Manage staff and doctor access</p>
            </div>
            <Button onClick={openAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-4">Name</TableHead>
              <TableHead className="px-5 py-4">Email / Login ID</TableHead>
              <TableHead className="px-5 py-4">Role</TableHead>
              <TableHead className="px-5 py-4">Status</TableHead>
              <TableHead className="px-5 py-4">Last Login</TableHead>
              <TableHead className="w-[80px] px-5 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10 px-5">
                  No staff members yet.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium px-5 py-4">{member.name}</TableCell>
                  <TableCell className="px-5 py-4">{member.email}</TableCell>
                  <TableCell className="px-5 py-4">{member.role}</TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge variant={member.active ? "default" : "secondary"}>
                      {member.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground px-5 py-4">{member.lastLogin ?? "—"}</TableCell>
                  <TableCell className="text-right px-5 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(member)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(member.id)}>
                          <Power className="h-4 w-4 mr-2" />
                          {member.active ? "Disable" : "Enable"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => resetPassword(member)}>
                          <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
        </>
      )}

      {showSecurity && (
      <div className="rounded-lg border bg-card">
        <div className="flex items-start justify-between gap-4 p-6 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              Activity Log
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Track all staff account changes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={downloadAuditLogCSV}
              disabled={auditLog.length === 0}
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
            {activityLimit && auditLog.length > activityLimit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllLog((s) => !s)}
              >
                {showAllLog ? "Show Less" : "View Full Log"}
              </Button>
            )}
            <Badge variant="secondary" className="text-xs">Read-only</Badge>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[170px]">Date &amp; Time</TableHead>
              <TableHead className="w-[140px]">Action</TableHead>
              <TableHead className="w-[200px]">Performed By</TableHead>
              <TableHead className="w-[180px]">Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleLog.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No activity recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              visibleLog.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionBadgeVariant(log.action)}>{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.performedBy}</TableCell>
                  <TableCell>{log.target}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.message}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      )}


      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Staff" : "Add Staff"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update staff details. Leave password blank to keep unchanged."
                : "Create a new staff or doctor account."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Full Name</Label>
              <Input
                id="staff-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-email">Email (used as login)</Label>
              <Input
                id="staff-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@clinic.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as StaffRole })}
              >
                <SelectTrigger id="staff-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                If a doctor is the clinic boss, assign them Owner/Admin instead of Doctor.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="staff-password">
                  Password {editingId && <span className="text-muted-foreground font-normal">(optional)</span>}
                </Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => {
                    const pwd = generatePassword();
                    setForm({ ...form, password: pwd, confirmPassword: pwd });
                  }}
                >
                  Auto-generate
                </Button>
              </div>
              <Input
                id="staff-password"
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingId ? "Leave blank to keep current" : "Min 6 characters"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-confirm">Confirm Password</Label>
              <Input
                id="staff-confirm"
                type="text"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>

            {!editingId && (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="send-creds" className="text-sm">Send login credentials via email</Label>
                  <p className="text-xs text-muted-foreground">User receives email with their login info.</p>
                </div>
                <Switch
                  id="send-creds"
                  checked={form.sendCredentials}
                  onCheckedChange={(c) => setForm({ ...form, sendCredentials: c })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? "Save Changes" : "Create Staff"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
