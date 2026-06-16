import { useState } from "react";
import { DoctorSchedulePanel } from "./DoctorSchedulePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  User,
  Award,
  Languages,
  Clock,
  Mail,
  Phone,
  X,
  Stethoscope,
} from "lucide-react";
import { useDoctorProfiles, DoctorProfile, DoctorProfileInsert } from "@/hooks/useDoctorProfiles";

const emptyForm: Omit<DoctorProfileInsert, "is_active"> = {
  name: "",
  title: "",
  specialization: "",
  certifications: [],
  languages: [],
  years_of_experience: null,
  bio: "",
  email: "",
  phone: "",
  photo_url: "",
};

export const DoctorProfilesPanel = () => {
  const { profiles, isLoading, createProfile, updateProfile, deleteProfile } = useDoctorProfiles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<DoctorProfile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<DoctorProfile | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [certInput, setCertInput] = useState("");
  const [langInput, setLangInput] = useState("");

  const resetForm = () => {
    setFormData(emptyForm);
    setCertInput("");
    setLangInput("");
    setEditingProfile(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (profile: DoctorProfile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      title: profile.title || "",
      specialization: profile.specialization || "",
      certifications: profile.certifications || [],
      languages: profile.languages || [],
      years_of_experience: profile.years_of_experience,
      bio: profile.bio || "",
      email: profile.email || "",
      phone: profile.phone || "",
      photo_url: profile.photo_url || "",
    });
    setDialogOpen(true);
  };

  const handleAddCert = () => {
    const trimmed = certInput.trim();
    if (trimmed && !formData.certifications?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...(prev.certifications || []), trimmed],
      }));
      setCertInput("");
    }
  };

  const handleRemoveCert = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications?.filter((c) => c !== cert) || [],
    }));
  };

  const handleAddLang = () => {
    const trimmed = langInput.trim();
    if (trimmed && !formData.languages?.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...(prev.languages || []), trimmed],
      }));
      setLangInput("");
    }
  };

  const handleRemoveLang = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages?.filter((l) => l !== lang) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      years_of_experience: formData.years_of_experience || null,
      is_active: true,
    };

    if (editingProfile) {
      await updateProfile.mutateAsync({ id: editingProfile.id, updates: payload });
    } else {
      await createProfile.mutateAsync(payload);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (profileToDelete) {
      await deleteProfile.mutateAsync(profileToDelete.id);
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    }
  };

  const confirmDelete = (profile: DoctorProfile) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Doctor Profiles</h2>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      {profiles.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No doctor profiles yet.</p>
            <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
              Add your first doctor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{profile.name}</CardTitle>
                      {profile.title && (
                        <p className="text-sm text-muted-foreground">{profile.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenEdit(profile)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => confirmDelete(profile)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.specialization && (
                  <div className="flex items-center gap-2 text-sm">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.specialization}</span>
                  </div>
                )}

                {profile.years_of_experience && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.years_of_experience} years experience</span>
                  </div>
                )}

                {profile.languages && profile.languages.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Languages className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {profile.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.certifications && profile.certifications.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {profile.certifications.slice(0, 3).map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                      {profile.certifications.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.certifications.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {profile.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                )}

                {(profile.email || profile.phone) && (
                  <div className="flex gap-3 pt-2 border-t text-xs text-muted-foreground">
                    {profile.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? "Edit Doctor Profile" : "Add Doctor Profile"}
            </DialogTitle>
            <DialogDescription>
              Enter the doctor's details, certifications, and contact information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Dr Tan Wei Ming"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Consultant"
                  value={formData.title || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="e.g. General Medicine"
                  value={formData.specialization || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, specialization: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="years">Years of Experience</Label>
                <Input
                  id="years"
                  type="number"
                  min="0"
                  placeholder="e.g. 15"
                  value={formData.years_of_experience || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      years_of_experience: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                />
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. MBBS (Singapore)"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCert();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddCert}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.certifications && formData.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="gap-1 pr-1">
                      {cert}
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(cert)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label>Languages Spoken</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. English"
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLang();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddLang}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.languages && formData.languages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="gap-1 pr-1">
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveLang(lang)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                placeholder="Brief description of the doctor's background and expertise..."
                value={formData.bio || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+65 9123 4567"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProfile.isPending || updateProfile.isPending}
              >
                {editingProfile ? "Update" : "Create"} Profile
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {profileToDelete?.name}'s profile? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
