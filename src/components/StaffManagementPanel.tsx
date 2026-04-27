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
import { Plus, MoreHorizontal, KeyRound, Pencil, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type StaffRole = "Doctor" | "Admin" | "Staff" | "Receptionist";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  lastLogin?: string;
}

const initialStaff: StaffMember[] = [
  { id: "1", name: "Dr. Emily Tan", email: "emily.tan@clinic.com", role: "Doctor", active: true, lastLogin: "2026-04-26 09:12" },
  { id: "2", name: "Admin User", email: "admin@clinic.com", role: "Admin", active: true, lastLogin: "2026-04-27 08:30" },
  { id: "3", name: "Jasmine Lee", email: "jasmine.lee@clinic.com", role: "Receptionist", active: true, lastLogin: "2026-04-26 17:45" },
  { id: "4", name: "Marcus Ong", email: "marcus.ong@clinic.com", role: "Staff", active: false, lastLogin: "2026-04-10 11:20" },
];

const generatePassword = () =>
  Math.random().toString(36).slice(-10) + Math.floor(Math.random() * 100);

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

export const StaffManagementPanel = () => {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffFormState>(emptyForm);

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
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    const member = staff.find((s) => s.id === id);
    toast({
      title: member?.active ? "Account disabled" : "Account enabled",
      description: member?.active ? "User can no longer log in." : "User can now log in.",
    });
  };

  const resetPassword = (member: StaffMember) => {
    const newPwd = generatePassword();
    toast({
      title: "Password reset",
      description: `New temporary password for ${member.name}: ${newPwd}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Staff Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage staff and doctor access</p>
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
              <TableHead>Name</TableHead>
              <TableHead>Email / Login ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No staff members yet.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Badge variant={member.active ? "default" : "secondary"}>
                      {member.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.lastLogin ?? "—"}</TableCell>
                  <TableCell className="text-right">
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
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
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
