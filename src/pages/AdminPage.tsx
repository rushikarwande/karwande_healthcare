import { useCallback, useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ArrowDown, ArrowLeft, ArrowUp, FileText, ImagePlus, LayoutGrid, MapPinned, Minus, Plus, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createId, defaultSiteContent, useSiteContent, type ColorKey, type GalleryCategory, type IconKey, type SiteContent } from "@/content/siteContent";
import { iconOptions } from "@/content/iconMap";
import LogoMark from "@/components/LogoMark";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { uploadSiteImage } from "@/lib/cmsStorage";

const colorOptions: ColorKey[] = ["primary", "secondary"];
const galleryOptions: GalleryCategory[] = ["Facility", "Event"];

const cloneContent = (value: SiteContent): SiteContent => JSON.parse(JSON.stringify(value)) as SiteContent;
const GALLERY_IMAGE_ASPECT = 4 / 3;
const LOGO_IMAGE_ASPECT = 1;
const MIN_CROP_ZOOM = 0.5;
const MAX_CROP_ZOOM = 3;

interface CropDialogState {
  imageUrl: string;
  apply: (value: string) => void;
  aspect: number;
  description: string;
}

const AdminPage = () => {
  const { content, loading, saveContent } = useSiteContent();
  const [draftContent, setDraftContent] = useState<SiteContent>(() => cloneContent(content));
  const [saveMessage, setSaveMessage] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [cropDialog, setCropDialog] = useState<CropDialogState | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropSubmitting, setCropSubmitting] = useState(false);

  useEffect(() => {
    setDraftContent(cloneContent(content));
  }, [content]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);


  const update = (recipe: (draft: SiteContent) => void) => {
    const next = cloneContent(draftContent);
    recipe(next);
    setDraftContent(next);
    setSaveMessage("");
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    apply: (value: string) => void,
    options?: { aspect?: number; description?: string },
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(file);
      setCropDialog({
        imageUrl,
        apply,
        aspect: options?.aspect ?? GALLERY_IMAGE_ASPECT,
        description: options?.description ?? "Drag and zoom the image so it fits the gallery card exactly how the client wants.",
      });
      setCropPosition({ x: 0, y: 0 });
      setCropZoom(1);
      setCroppedAreaPixels(null);
      setSaveError("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      event.target.value = "";
    }
  };

  const handleCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const adjustZoom = useCallback((delta: number) => {
    setCropZoom((current) => Math.min(MAX_CROP_ZOOM, Math.max(MIN_CROP_ZOOM, Number((current + delta).toFixed(2)))));
  }, []);

  const resetCropState = useCallback(() => {
    setCropPosition({ x: 0, y: 0 });
    setCropZoom(1);
  }, []);

  const closeCropDialog = useCallback(() => {
    if (cropDialog) {
      URL.revokeObjectURL(cropDialog.imageUrl);
    }
    setCropDialog(null);
    setCropSubmitting(false);
    resetCropState();
    setCroppedAreaPixels(null);
  }, [cropDialog, resetCropState]);

  const handleCropConfirm = async () => {
    if (!cropDialog || !croppedAreaPixels) {
      return;
    }

    setCropSubmitting(true);

    try {
      const croppedBlob = await getCroppedImageBlob(cropDialog.imageUrl, croppedAreaPixels);
      const fileName = `cropped-${Date.now()}.jpg`;
      const croppedFile = new File([croppedBlob], fileName, { type: "image/jpeg" });
      const result = await uploadSiteImage(croppedFile, "content");
      cropDialog.apply(result);
      setSaveError("");
      closeCropDialog();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to crop image.");
      setCropSubmitting(false);
    }
  };

  const moveGalleryItem = (index: number, direction: -1 | 1) => {
    update((draft) => {
      const target = index + direction;
      if (target < 0 || target >= draft.gallery.items.length) {
        return;
      }

      const temp = draft.gallery.items[index];
      draft.gallery.items[index] = draft.gallery.items[target];
      draft.gallery.items[target] = temp;
    });
  };

  const handleSaveChanges = async () => {
    try {
      await saveContent(cloneContent(draftContent));
      setSaveMessage("Saved changes successfully.");
      setSaveError("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save changes.");
      setSaveMessage("");
    }
  };

  const handleResetToDefault = async () => {
    const next = cloneContent(defaultSiteContent);
    setDraftContent(next);

    try {
      await saveContent(next);
      setSaveMessage("Saved changes successfully.");
      setSaveError("");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to reset content.");
      setSaveMessage("");
    }
  };

  const handleLogin = async () => {
    if (!supabase) {
      return;
    }

    setAuthSubmitting(true);
    setAuthError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    setAuthSubmitting(false);

    if (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSaveMessage("");
  };

  if (!isSupabaseConfigured) {
    return (
      <AdminShell>
        <AdminSection
          title="Supabase Setup Required"
          description="Admin login is now protected by Supabase email and password authentication."
        >
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Add these values in your local `.env` file before opening `/admin`:</p>
            <code className="block rounded-xl bg-muted px-4 py-3 text-foreground">
              VITE_SUPABASE_URL=your-project-url
              <br />
              VITE_SUPABASE_ANON_KEY=your-anon-key
            </code>
            <p>Create the admin user in Supabase Auth with the email and password you want your client to use.</p>
          </div>
        </AdminSection>
      </AdminShell>
    );
  }

  if (loading || authLoading) {
    return (
      <AdminShell>
        <AdminSection title="Checking Admin Access" description="Verifying the current Supabase session." />
      </AdminShell>
    );
  }

  if (!session) {
    return (
      <AdminShell>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-stretch">
          <section className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-foreground via-foreground/95 to-primary p-6 md:p-10 text-background shadow-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-background/15 bg-background/10 px-4 py-2 text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              Protected Admin Access
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight mb-4">
              Manage Your Website From One Secure Dashboard
            </h1>
            <p className="text-background/75 max-w-xl leading-relaxed mb-8">
              Update content, gallery photos, contact details, and branding from a cleaner admin workspace.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-background/10 border border-background/10 p-4">
                <LayoutGrid className="w-5 h-5 mb-3 text-accent" />
                <div className="text-sm font-semibold">Section Control</div>
                <div className="text-xs text-background/65 mt-1">Edit hero, services, about, contact, and footer.</div>
              </div>
              <div className="rounded-2xl bg-background/10 border border-background/10 p-4">
                <ImagePlus className="w-5 h-5 mb-3 text-accent" />
                <div className="text-sm font-semibold">Gallery Uploads</div>
                <div className="text-xs text-background/65 mt-1">Add and reorder facility and event photos.</div>
              </div>
              <div className="rounded-2xl bg-background/10 border border-background/10 p-4">
                <MapPinned className="w-5 h-5 mb-3 text-accent" />
                <div className="text-sm font-semibold">Brand Updates</div>
                <div className="text-xs text-background/65 mt-1">Replace logo, update map details, and save changes.</div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 md:p-10 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3 mb-8">
              <LogoMark />
              <div>
                <div className="text-sm font-medium text-primary">Secure Entry</div>
                <h2 className="font-heading text-3xl font-bold text-foreground">Admin Login</h2>
              </div>
            </div>
            <div className="space-y-5">
              <Field label="Email">
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => {
                    setLoginEmail(event.target.value);
                    setAuthError("");
                  }}
                  placeholder="admin@example.com"
                  className="h-11"
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => {
                    setLoginPassword(event.target.value);
                    setAuthError("");
                  }}
                  placeholder="Enter password"
                  className="h-11"
                />
              </Field>
              {authError && <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{authError}</p>}
              <Button className="w-full h-11" onClick={handleLogin} disabled={authSubmitting}>
                {authSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          </section>
        </div>
      </AdminShell>
    );
  }


  const adminStats = [
    { label: "Service Groups", value: draftContent.services.categories.length.toString(), icon: LayoutGrid },
    { label: "Gallery Photos", value: draftContent.gallery.items.length.toString(), icon: ImagePlus },
    { label: "Doctors", value: draftContent.doctors.items.length.toString(), icon: FileText },
    { label: "Clinics", value: draftContent.contact.clinics.length.toString(), icon: MapPinned },
  ];

  return (
    <AdminShell>
      <div className="rounded-[2rem] border border-border/70 bg-card/90 shadow-xl backdrop-blur overflow-hidden">
        <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-r from-primary/10 via-background to-secondary/10 px-6 py-8 md:px-8">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_58%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" />
                Back to website
              </Link>
              <div className="flex min-w-0 items-center gap-4">
                <LogoMark />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-primary">Content Control Center</div>
                  <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Website Admin Panel</h1>
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    Manage branding, content, gallery ordering, doctor profiles, and contact information from one dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex w-full flex-col gap-3 rounded-2xl border border-border/70 bg-background/90 px-4 py-3 shadow-sm sm:w-auto sm:flex-row sm:items-center">
                <span className="min-w-0 break-all text-sm text-muted-foreground">{session.user.email}</span>
                <Button variant="outline" className="w-full sm:w-auto" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
              <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => void handleResetToDefault()}>
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
            {adminStats.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-2xl border border-border/70 bg-muted/30 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-heading text-3xl font-bold text-foreground">{item.value}</div>
                </div>
              );
            })}
          </div>
          <div className="space-y-8">
          <AdminSection title="Branding" description="Replace the blue K logo, update site name, and control the header branding.">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Site Name">
                <Input value={draftContent.branding.siteName} onChange={(event) => update((draft) => { draft.branding.siteName = event.target.value; })} />
              </Field>
              <Field label="Short Name">
                <Input value={draftContent.branding.shortName} onChange={(event) => update((draft) => { draft.branding.shortName = event.target.value; })} />
              </Field>
              <Field label="Tag Line">
                <Input value={draftContent.branding.tagLine} onChange={(event) => update((draft) => { draft.branding.tagLine = event.target.value; })} />
              </Field>
              <Field label="Fallback Logo Text">
                <Input value={draftContent.branding.logoText} onChange={(event) => update((draft) => { draft.branding.logoText = event.target.value; })} maxLength={3} />
              </Field>
            </div>
            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <LogoMark />
                <div className="text-sm text-muted-foreground">Current header logo preview</div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  <ImagePlus className="w-4 h-4" />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      void handleImageUpload(event, (value) => update((draft) => { draft.branding.logoImage = value; }), {
                        aspect: LOGO_IMAGE_ASPECT,
                        description: "Use the square crop area so the full logo stays centered and readable.",
                      })
                    }
                  />
                </label>
                {draftContent.branding.logoImage && (
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => update((draft) => { draft.branding.logoImage = ""; })}>Remove Logo Image</Button>
                )}
              </div>
            </div>
          </AdminSection>

          <AdminSection title="Hero Section" description="Edit the landing section text, call-to-action labels, stats, and background image.">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Badge"><Input value={draftContent.hero.badge} onChange={(event) => update((draft) => { draft.hero.badge = event.target.value; })} /></Field>
              <Field label="Primary Button Label"><Input value={draftContent.hero.primaryCtaLabel} onChange={(event) => update((draft) => { draft.hero.primaryCtaLabel = event.target.value; })} /></Field>
              <Field label="Title Start"><Input value={draftContent.hero.titleStart} onChange={(event) => update((draft) => { draft.hero.titleStart = event.target.value; })} /></Field>
              <Field label="Title Highlight"><Input value={draftContent.hero.titleHighlight} onChange={(event) => update((draft) => { draft.hero.titleHighlight = event.target.value; })} /></Field>
              <Field label="Title End"><Input value={draftContent.hero.titleEnd} onChange={(event) => update((draft) => { draft.hero.titleEnd = event.target.value; })} /></Field>
              <Field label="Secondary Button Label"><Input value={draftContent.hero.secondaryCtaLabel} onChange={(event) => update((draft) => { draft.hero.secondaryCtaLabel = event.target.value; })} /></Field>
              <Field label="Location"><Input value={draftContent.hero.location} onChange={(event) => update((draft) => { draft.hero.location = event.target.value; })} /></Field>
              <Field label="Hours"><Input value={draftContent.hero.hours} onChange={(event) => update((draft) => { draft.hero.hours = event.target.value; })} /></Field>
            </div>
            <Field label="Hero Description" className="mt-6"><Textarea value={draftContent.hero.description} onChange={(event) => update((draft) => { draft.hero.description = event.target.value; })} className="min-h-[120px]" /></Field>
            <div className="mt-6 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <ImagePlus className="w-4 h-4" />
                Upload Hero Image
                <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event, (value) => update((draft) => { draft.hero.backgroundImage = value; }))} />
              </label>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {draftContent.hero.stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                  <Field label="Number"><Input value={stat.number} onChange={(event) => update((draft) => { draft.hero.stats[index].number = event.target.value; })} /></Field>
                  <Field label="Label"><Input value={stat.label} onChange={(event) => update((draft) => { draft.hero.stats[index].label = event.target.value; })} /></Field>
                </div>
              ))}
            </div>
          </AdminSection>

          <AdminSection title="Services" description="Update service headings, banner images, and cards for each specialty.">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Section Eyebrow"><Input value={draftContent.services.eyebrow} onChange={(event) => update((draft) => { draft.services.eyebrow = event.target.value; })} /></Field>
              <Field label="Section Title"><Input value={draftContent.services.title} onChange={(event) => update((draft) => { draft.services.title = event.target.value; })} /></Field>
            </div>
            <Field label="Section Description" className="mt-6"><Textarea value={draftContent.services.description} onChange={(event) => update((draft) => { draft.services.description = event.target.value; })} /></Field>
            <div className="space-y-6 mt-6">
              {draftContent.services.categories.map((category, categoryIndex) => (
                <div key={category.id} className="rounded-2xl border border-border bg-background p-4 md:p-5 space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-heading text-lg font-semibold break-words">Service Category {categoryIndex + 1}</h3>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => update((draft) => { draft.services.categories.splice(categoryIndex, 1); })}>Remove Category</Button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Field label="Category Name"><Input value={category.category} onChange={(event) => update((draft) => { draft.services.categories[categoryIndex].category = event.target.value; })} /></Field>
                    <Field label="Color">
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={category.color} onChange={(event) => update((draft) => { draft.services.categories[categoryIndex].color = event.target.value as ColorKey; })}>
                        {colorOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                    <Field label="Banner Image">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">
                        <ImagePlus className="w-4 h-4" />
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event, (value) => update((draft) => { draft.services.categories[categoryIndex].image = value; }))} />
                      </label>
                    </Field>
                  </div>
                  <Field label="Category Description"><Textarea value={category.description} onChange={(event) => update((draft) => { draft.services.categories[categoryIndex].description = event.target.value; })} /></Field>
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={`${category.id}-${itemIndex}`} className="rounded-xl border border-border p-4 space-y-4">
                        <div className="grid md:grid-cols-[180px_1fr] gap-4">
                          <div className="space-y-3">
                            <img src={item.image} alt={item.title} className="w-full h-36 rounded-xl object-cover border border-border" />
                            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">
                              <ImagePlus className="w-4 h-4" />
                              Upload Image
                              <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event, (value) => update((draft) => { draft.services.categories[categoryIndex].items[itemIndex].image = value; }))} />
                            </label>
                          </div>
                          <div className="grid min-w-0 md:grid-cols-2 gap-4">
                            <Field label="Service Title"><Input value={item.title} onChange={(event) => update((draft) => { draft.services.categories[categoryIndex].items[itemIndex].title = event.target.value; })} /></Field>
                            <Field label="Icon">
                              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={item.icon} onChange={(event) => update((draft) => { draft.services.categories[categoryIndex].items[itemIndex].icon = event.target.value as IconKey; })}>
                                {iconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                              </select>
                            </Field>
                            <div className="md:col-span-2"><Field label="Service Description"><Textarea value={item.description} onChange={(event) => update((draft) => { draft.services.categories[categoryIndex].items[itemIndex].description = event.target.value; })} /></Field></div>
                            <div className="md:col-span-2 flex justify-stretch sm:justify-end"><Button variant="outline" className="w-full sm:w-auto" onClick={() => update((draft) => { draft.services.categories[categoryIndex].items.splice(itemIndex, 1); })}>Remove Service</Button></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="gap-2" onClick={() => update((draft) => { draft.services.categories[categoryIndex].items.push({ icon: "sparkles", title: "New Service", description: "Service description", image: draft.hero.backgroundImage }); })}><Plus className="w-4 h-4" />Add Service Item</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 gap-2" onClick={() => update((draft) => {
              draft.services.categories.push({ id: createId("service"), category: "New Category", color: "primary", image: content.hero.backgroundImage, description: "Add category description", items: [{ icon: "sparkles", title: "New Service", description: "Service description", image: draft.hero.backgroundImage }] });
            })}><Plus className="w-4 h-4" />Add Service Category</Button>
          </AdminSection>
          <AdminSection title="Gallery" description="Add photos section-wise, reorder them, and control which top 9 appear first on the site.">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Section Eyebrow"><Input value={draftContent.gallery.eyebrow} onChange={(event) => update((draft) => { draft.gallery.eyebrow = event.target.value; })} /></Field>
              <Field label="Section Title"><Input value={draftContent.gallery.title} onChange={(event) => update((draft) => { draft.gallery.title = event.target.value; })} /></Field>
            </div>
            <Field label="Section Description" className="mt-6"><Textarea value={draftContent.gallery.description} onChange={(event) => update((draft) => { draft.gallery.description = event.target.value; })} /></Field>
            <div className="mt-4 text-sm text-muted-foreground">Gallery order controls the website display order. The first 9 images are shown first on the live site.</div>
            <div className="space-y-4 mt-6">
              {draftContent.gallery.items.map((item, index) => (
                <div key={item.id} className="rounded-2xl border border-border bg-background p-4 md:p-5">
                  <div className="grid lg:grid-cols-[160px_1fr] gap-5">
                    <div className="space-y-3">
                      <img src={item.image} alt={item.title} className="w-full h-36 rounded-xl object-cover border border-border" />
                      <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">
                        <ImagePlus className="w-4 h-4" />
                        Upload Photo
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event, (value) => update((draft) => { draft.gallery.items[index].image = value; }))} />
                      </label>
                    </div>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Photo Title"><Input value={item.title} onChange={(event) => update((draft) => { draft.gallery.items[index].title = event.target.value; })} /></Field>
                        <Field label="Section">
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={item.category} onChange={(event) => update((draft) => { draft.gallery.items[index].category = event.target.value as GalleryCategory; })}>
                            {galleryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field label="Photo Description"><Textarea value={item.description} onChange={(event) => update((draft) => { draft.gallery.items[index].description = event.target.value; })} /></Field>
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => moveGalleryItem(index, -1)} disabled={index === 0}><ArrowUp className="w-4 h-4" />Move Up</Button>
                        <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => moveGalleryItem(index, 1)} disabled={index === draftContent.gallery.items.length - 1}><ArrowDown className="w-4 h-4" />Move Down</Button>
                        <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => update((draft) => { draft.gallery.items.splice(index, 1); })}><Trash2 className="w-4 h-4" />Delete</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 gap-2" onClick={() => update((draft) => {
              draft.gallery.items.push({ id: createId("gallery"), title: "New Gallery Photo", category: "Facility", description: "Add photo description", image: content.hero.backgroundImage });
            })}><Plus className="w-4 h-4" />Add Gallery Photo</Button>
          </AdminSection>

          <AdminSection title="Doctors" description="Manage doctor cards and the details shown on the website.">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Section Eyebrow"><Input value={draftContent.doctors.eyebrow} onChange={(event) => update((draft) => { draft.doctors.eyebrow = event.target.value; })} /></Field>
              <Field label="Section Title"><Input value={draftContent.doctors.title} onChange={(event) => update((draft) => { draft.doctors.title = event.target.value; })} /></Field>
            </div>
            <Field label="Section Description" className="mt-6"><Textarea value={draftContent.doctors.description} onChange={(event) => update((draft) => { draft.doctors.description = event.target.value; })} /></Field>
            <div className="space-y-6 mt-6">
              {draftContent.doctors.items.map((doctor, doctorIndex) => (
                <div key={doctor.id} className="rounded-2xl border border-border bg-background p-4 md:p-5 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-heading text-lg font-semibold break-words">{doctor.name}</h3>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => update((draft) => { draft.doctors.items.splice(doctorIndex, 1); })}>Remove Doctor</Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Name"><Input value={doctor.name} onChange={(event) => update((draft) => { draft.doctors.items[doctorIndex].name = event.target.value; })} /></Field>
                    <Field label="Title"><Input value={doctor.title} onChange={(event) => update((draft) => { draft.doctors.items[doctorIndex].title = event.target.value; })} /></Field>
                    <Field label="Qualifications"><Input value={doctor.qualifications} onChange={(event) => update((draft) => { draft.doctors.items[doctorIndex].qualifications = event.target.value; })} /></Field>
                    <Field label="Certification"><Input value={doctor.certification} onChange={(event) => update((draft) => { draft.doctors.items[doctorIndex].certification = event.target.value; })} /></Field>
                    <Field label="Clinic"><Input value={doctor.clinic} onChange={(event) => update((draft) => { draft.doctors.items[doctorIndex].clinic = event.target.value; })} /></Field>
                    <Field label="Initials"><Input value={doctor.initials} onChange={(event) => update((draft) => { draft.doctors.items[doctorIndex].initials = event.target.value; })} /></Field>
                    <Field label="Color">
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={doctor.color} onChange={(event) => update((draft) => { draft.doctors.items[doctorIndex].color = event.target.value as ColorKey; })}>
                        {colorOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                    <Field label="Specialties (comma separated)"><Input value={doctor.specialties.join(", ")} onChange={(event) => update((draft) => { draft.doctors.items[doctorIndex].specialties = event.target.value.split(",").map((item) => item.trim()).filter(Boolean); })} /></Field>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-6 gap-2" onClick={() => update((draft) => {
              draft.doctors.items.push({ id: createId("doctor"), name: "New Doctor", title: "Specialist", qualifications: "Qualification", certification: "Certification", clinic: "Clinic Name", specialties: ["Specialty"], color: "primary", initials: "ND" });
            })}><Plus className="w-4 h-4" />Add Doctor</Button>
          </AdminSection>

          <AdminSection title="About Section" description="Edit the story, paragraphs, and highlight cards shown in the about section.">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Section Eyebrow"><Input value={draftContent.about.eyebrow} onChange={(event) => update((draft) => { draft.about.eyebrow = event.target.value; })} /></Field>
              <Field label="Title Start"><Input value={draftContent.about.title} onChange={(event) => update((draft) => { draft.about.title = event.target.value; })} /></Field>
            </div>
            <Field label="Title Highlight" className="mt-6"><Input value={draftContent.about.titleHighlight} onChange={(event) => update((draft) => { draft.about.titleHighlight = event.target.value; })} /></Field>
            <div className="space-y-4 mt-6">
              {draftContent.about.paragraphs.map((paragraph, paragraphIndex) => (
                <div key={`paragraph-${paragraphIndex}`} className="rounded-xl border border-border bg-background p-4 space-y-3">
                  <Field label={`Paragraph ${paragraphIndex + 1}`}><Textarea value={paragraph} onChange={(event) => update((draft) => { draft.about.paragraphs[paragraphIndex] = event.target.value; })} /></Field>
                  <Button variant="outline" onClick={() => update((draft) => { draft.about.paragraphs.splice(paragraphIndex, 1); })}>Remove Paragraph</Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 gap-2" onClick={() => update((draft) => { draft.about.paragraphs.push("New paragraph"); })}><Plus className="w-4 h-4" />Add Paragraph</Button>
            <div className="space-y-4 mt-6">
              {draftContent.about.highlights.map((highlight, highlightIndex) => (
                <div key={`${highlight.title}-${highlightIndex}`} className="rounded-xl border border-border bg-background p-4 grid md:grid-cols-3 gap-4">
                  <Field label="Title"><Input value={highlight.title} onChange={(event) => update((draft) => { draft.about.highlights[highlightIndex].title = event.target.value; })} /></Field>
                  <Field label="Icon">
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={highlight.icon} onChange={(event) => update((draft) => { draft.about.highlights[highlightIndex].icon = event.target.value as IconKey; })}>
                      {iconOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </Field>
                  <div className="flex items-stretch md:items-end"><Button variant="outline" className="w-full" onClick={() => update((draft) => { draft.about.highlights.splice(highlightIndex, 1); })}>Remove Highlight</Button></div>
                  <div className="md:col-span-3"><Field label="Description"><Textarea value={highlight.description} onChange={(event) => update((draft) => { draft.about.highlights[highlightIndex].description = event.target.value; })} /></Field></div>
                </div>
              ))}
            </div>
            <Button className="mt-4 gap-2" onClick={() => update((draft) => { draft.about.highlights.push({ icon: "shield", title: "New Highlight", description: "Highlight description" }); })}><Plus className="w-4 h-4" />Add Highlight</Button>
          </AdminSection>
          <AdminSection title="Contact and Footer" description="Edit contact cards, map links, footer phones, and address details.">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Contact Eyebrow"><Input value={draftContent.contact.eyebrow} onChange={(event) => update((draft) => { draft.contact.eyebrow = event.target.value; })} /></Field>
              <Field label="Contact Title"><Input value={draftContent.contact.title} onChange={(event) => update((draft) => { draft.contact.title = event.target.value; })} /></Field>
            </div>
            <Field label="Contact Description" className="mt-6"><Textarea value={draftContent.contact.description} onChange={(event) => update((draft) => { draft.contact.description = event.target.value; })} /></Field>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Field label="Call Now Number (Header Button)"><Input value={draftContent.contact.callNumber} onChange={(event) => update((draft) => { draft.contact.callNumber = event.target.value; })} placeholder="9405 568 568" /></Field>
              <Field label="Appointment Number (Book + Contact Buttons)"><Input value={draftContent.contact.appointmentNumber} onChange={(event) => update((draft) => { draft.contact.appointmentNumber = event.target.value; })} placeholder="9405 568 568" /></Field>
            </div>
            <div className="space-y-6 mt-6">
              {draftContent.contact.clinics.map((clinic, clinicIndex) => (
                <div key={clinic.id} className="rounded-2xl border border-border bg-background p-4 md:p-5 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-heading text-lg font-semibold break-words">{clinic.name}</h3>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => update((draft) => { draft.contact.clinics.splice(clinicIndex, 1); })}>Remove Clinic</Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Clinic Name"><Input value={clinic.name} onChange={(event) => update((draft) => { draft.contact.clinics[clinicIndex].name = event.target.value; })} /></Field>
                    <Field label="Subtitle"><Input value={clinic.subtitle} onChange={(event) => update((draft) => { draft.contact.clinics[clinicIndex].subtitle = event.target.value; })} /></Field>
                    <Field label="Doctor"><Input value={clinic.doctor} onChange={(event) => update((draft) => { draft.contact.clinics[clinicIndex].doctor = event.target.value; })} /></Field>
                    <Field label="Email"><Input value={clinic.email} onChange={(event) => update((draft) => { draft.contact.clinics[clinicIndex].email = event.target.value; })} /></Field>
                    <Field label="Phones (comma separated)"><Input value={clinic.phones.join(", ")} onChange={(event) => update((draft) => { draft.contact.clinics[clinicIndex].phones = event.target.value.split(",").map((item) => item.trim()).filter(Boolean); })} /></Field>
                    <Field label="Hours"><Input value={clinic.hours} onChange={(event) => update((draft) => { draft.contact.clinics[clinicIndex].hours = event.target.value; })} /></Field>
                    <Field label="Color">
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={clinic.color} onChange={(event) => update((draft) => { draft.contact.clinics[clinicIndex].color = event.target.value as ColorKey; })}>
                        {colorOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <Button className="mt-4 gap-2" onClick={() => update((draft) => {
              draft.contact.clinics.push({ id: createId("clinic"), name: "New Clinic", subtitle: "Clinic Subtitle", doctor: "Doctor Name", phones: ["0000 000 000"], email: "clinic@example.com", hours: "Working hours", color: "primary" });
            })}><Plus className="w-4 h-4" />Add Clinic Card</Button>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Field label="Map Embed URL"><Textarea value={draftContent.contact.mapEmbedUrl} onChange={(event) => update((draft) => { draft.contact.mapEmbedUrl = event.target.value; })} /></Field>
              <div className="space-y-6">
                <Field label="Google Map Link"><Input value={draftContent.contact.mapLink} onChange={(event) => update((draft) => { draft.contact.mapLink = event.target.value; })} /></Field>
                <Field label="Location Title"><Input value={draftContent.contact.locationTitle} onChange={(event) => update((draft) => { draft.contact.locationTitle = event.target.value; })} /></Field>
                <Field label="Map Button Label"><Input value={draftContent.contact.mapButtonLabel} onChange={(event) => update((draft) => { draft.contact.mapButtonLabel = event.target.value; })} /></Field>
              </div>
            </div>
            <Field label="Address Lines (one per line)" className="mt-6"><Textarea value={draftContent.contact.addressLines.join("\n")} onChange={(event) => update((draft) => { draft.contact.addressLines = event.target.value.split("\n").map((item) => item.trim()).filter(Boolean); })} /></Field>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Field label="Footer Description"><Textarea value={draftContent.footer.description} onChange={(event) => update((draft) => { draft.footer.description = event.target.value; })} /></Field>
              <div className="space-y-6">
                <Field label="Footer Email"><Input value={draftContent.footer.email} onChange={(event) => update((draft) => { draft.footer.email = event.target.value; })} /></Field>
                <Field label="Footer Phones (comma separated)"><Input value={draftContent.footer.phones.join(", ")} onChange={(event) => update((draft) => { draft.footer.phones = event.target.value.split(",").map((item) => item.trim()).filter(Boolean); })} /></Field>
                <Field label="Footer Address"><Input value={draftContent.footer.address} onChange={(event) => update((draft) => { draft.footer.address = event.target.value; })} /></Field>
                <Field label="Copyright Name"><Input value={draftContent.footer.copyrightName} onChange={(event) => update((draft) => { draft.footer.copyrightName = event.target.value; })} /></Field>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Field label="Instagram URL"><Input value={draftContent.footer.socialLinks.instagram} onChange={(event) => update((draft) => { draft.footer.socialLinks.instagram = event.target.value; })} placeholder="https://instagram.com/your-account" /></Field>
              <Field label="Facebook URL"><Input value={draftContent.footer.socialLinks.facebook} onChange={(event) => update((draft) => { draft.footer.socialLinks.facebook = event.target.value; })} placeholder="https://facebook.com/your-page" /></Field>
              <Field label="YouTube URL"><Input value={draftContent.footer.socialLinks.youtube} onChange={(event) => update((draft) => { draft.footer.socialLinks.youtube = event.target.value; })} placeholder="https://youtube.com/@your-channel" /></Field>
              <Field label="LinkedIn URL"><Input value={draftContent.footer.socialLinks.linkedin} onChange={(event) => update((draft) => { draft.footer.socialLinks.linkedin = event.target.value; })} placeholder="https://linkedin.com/company/your-page" /></Field>
            </div>
          </AdminSection>
          <div className="sticky bottom-4 z-20 flex justify-center">
            <div className="flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-border bg-card/95 px-4 py-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0 text-sm">
                {saveError && <span className="font-medium break-words text-destructive">{saveError}</span>}
                {!saveError && saveMessage && <span className="font-medium break-words text-primary">{saveMessage}</span>}
                {!saveError && !saveMessage && <span className="break-words text-muted-foreground">Review your edits and save when you are ready.</span>}
              </div>
              <Button className="w-full gap-2 sm:w-auto" onClick={() => void handleSaveChanges()}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
      <CropImageDialog
        open={Boolean(cropDialog)}
        imageUrl={cropDialog?.imageUrl ?? ""}
        aspect={cropDialog?.aspect ?? GALLERY_IMAGE_ASPECT}
        description={cropDialog?.description ?? "Drag and zoom the image so it fits the gallery card exactly how the client wants."}
        zoom={cropZoom}
        crop={cropPosition}
        onZoomChange={setCropZoom}
        onCropChange={setCropPosition}
        onCropComplete={handleCropComplete}
        onClose={closeCropDialog}
        onConfirm={() => void handleCropConfirm()}
        onZoomOut={() => adjustZoom(-0.1)}
        onZoomIn={() => adjustZoom(0.1)}
        onReset={resetCropState}
        submitting={cropSubmitting}
      />
    </AdminShell>
  );
};

const AdminShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,#f7fbfd_0%,#edf4f7_100%)]">
    <div className="container mx-auto px-3 py-6 sm:px-4 md:py-10">{children}</div>
  </div>
);

const AdminSection = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <section className="rounded-[1.75rem] border border-border/70 bg-card/90 p-4 sm:p-6 md:p-8 shadow-sm backdrop-blur">
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
      </div>
      <div className="h-10 w-10 rounded-2xl bg-primary/10" />
    </div>
    {children}
  </section>
);

const Field = ({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) => (
  <div className={className}>
    <Label className="mb-2 block text-foreground/85">{label}</Label>
    {children}
  </div>
);

const CropImageDialog = ({
  open,
  imageUrl,
  aspect,
  description,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onClose,
  onConfirm,
  onZoomOut,
  onZoomIn,
  onReset,
  submitting,
}: {
  open: boolean;
  imageUrl: string;
  aspect: number;
  description: string;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (value: { x: number; y: number }) => void;
  onZoomChange: (value: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onClose: () => void;
  onConfirm: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onReset: () => void;
  submitting: boolean;
}) => {
  const cropWidth = aspect === LOGO_IMAGE_ASPECT ? 320 : 360;
  const cropHeight = Math.round(cropWidth / aspect);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-3xl rounded-[1.5rem] p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <DialogTitle>Adjust Image Crop</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="relative h-[280px] rounded-2xl overflow-hidden bg-foreground sm:h-[420px]">
            {imageUrl && (
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropSize={{ width: cropWidth, height: cropHeight }}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropComplete}
                showGrid={false}
                objectFit="contain"
                restrictPosition={false}
                zoomSpeed={0.15}
                style={{
                  cropAreaStyle: {
                    border: "2px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.58)",
                    borderRadius: aspect === LOGO_IMAGE_ASPECT ? "24px" : "20px",
                  },
                }}
              />
            )}
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Drag the image inside the box, then zoom in or zoom out until it fits exactly the way you want.
              </div>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onReset}>
                Reset
              </Button>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Button type="button" size="icon" variant="outline" className="shrink-0" onClick={onZoomOut} disabled={zoom <= MIN_CROP_ZOOM}>
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <Slider
                  min={MIN_CROP_ZOOM}
                  max={MAX_CROP_ZOOM}
                  step={0.05}
                  value={[zoom]}
                  onValueChange={(value) => onZoomChange(value[0] ?? 1)}
                />
              </div>
              <Button type="button" size="icon" variant="outline" className="shrink-0" onClick={onZoomIn} disabled={zoom >= MAX_CROP_ZOOM}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t border-border bg-muted/30 px-4 py-4 sm:px-6">
          <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button className="w-full sm:w-auto" onClick={onConfirm} disabled={submitting}>
            {submitting ? "Saving..." : "Use This Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

async function getCroppedImageBlob(imageSrc: string, crop: Area) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create crop canvas.");
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to export cropped image."));
        return;
      }

      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Unable to load image.")));
    image.src = src;
  });
}

export default AdminPage;











