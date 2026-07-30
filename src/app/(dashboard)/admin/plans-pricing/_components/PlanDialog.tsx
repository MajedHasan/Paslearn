"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, Plus, Trash2, Sparkles } from "lucide-react";
import {
  Plan,
  PlanFeature,
  PlanFormValues,
  PlanAudience,
} from "@/types/plan/plan";
import { PlanFeature as PlanFeatureTemplate } from "@/types/plan/planFeature";

const emptyLimits: PlanFormValues["limits"] = {
  maxCourses: 0,
  maxStudents: 0,
  maxTemplates: 0,
  maxLandingPages: 0,
  maxForms: 0,
  maxAutomations: 0,
  maxSalesPages: 0,
  maxFunnels: 0,
  maxEmailCampaigns: 0,
  maxDigitalProducts: 0,
  maxCoachingClients: 0,
  maxCourseEnrollments: 0,
  certificateEnabled: false,
  jobBoardAccess: false,
  aiCredits: 0,
};

const emptyForm: PlanFormValues = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  badge: "",
  ctaText: "",
  ctaUrl: "",
  price: { amount: 0, currency: "USD", billingCycle: "monthly" },
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
  features: [],
  limits: { ...emptyLimits },
  applicableTo: ["teacher", "student"],
};

type Props = {
  plan?: Plan | null;
  onSaved: () => void;
  triggerLabel?: string;
};

export default function PlanDialog({ plan, onSaved, triggerLabel = "Add Plan" }: Props) {
  const isEdit = !!plan;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<PlanFormValues>(emptyForm);
  const [featureCatalog, setFeatureCatalog] = useState<PlanFeatureTemplate[]>([]);
  const [selectedFeatureKey, setSelectedFeatureKey] = useState("");

  // Load feature catalog for the feature selector
  const loadFeatureCatalog = async () => {
    try {
      const res = await api.get("/plan-features");
      setFeatureCatalog(res?.data?.data || []);
    } catch (err) {
      toast.error("Failed to load feature catalog");
    }
  };

  useEffect(() => {
    if (open) {
      loadFeatureCatalog();
      if (plan) {
        setValues({
          name: plan.name,
          slug: plan.slug,
          description: plan.description,
          icon: plan.icon || "",
          badge: plan.badge || "",
          ctaText: plan.ctaText || "",
          ctaUrl: plan.ctaUrl || "",
          price: { ...plan.price },
          isActive: plan.isActive,
          isFeatured: plan.isFeatured,
          sortOrder: plan.sortOrder,
          features: [...plan.features],
          limits: { ...emptyLimits, ...plan.limits },
          applicableTo: [...plan.applicableTo],
        });
      } else {
        setValues(emptyForm);
      }
    }
  }, [open, plan]);

  // Add a feature from the catalog
  const addFeature = () => {
    if (!selectedFeatureKey) return;
    const ft = featureCatalog.find((f) => f.key === selectedFeatureKey);
    if (!ft) return;
    // Check if feature already exists
    if (values.features.find((f) => f.key === ft.key)) {
      toast.error("Feature already added");
      return;
    }
    const newFeature: PlanFeature = {
      key: ft.key,
      label: ft.label,
      type: ft.type,
      value: ft.defaultValue,
      tooltip: ft.description || "",
      icon: ft.icon || "",
    };
    setValues((prev) => ({
      ...prev,
      features: [...prev.features, newFeature],
    }));
    setSelectedFeatureKey("");
  };

  const removeFeature = (index: number) => {
    setValues((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeatureValue = (index: number, newValue: boolean | number | string) => {
    setValues((prev) => {
      const updated = [...prev.features];
      updated[index] = { ...updated[index], value: newValue };
      return { ...prev, features: updated };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = { ...values };
      if (isEdit && plan?._id) {
        await api.patch(`/plans/admin/${plan._id}`, payload);
        toast.success("Plan updated");
      } else {
        await api.post("/plans/admin", payload);
        toast.success("Plan created");
      }
      setOpen(false);
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90">
          {isEdit ? "Edit" : triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Plan" : "Create Plan"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure pricing, features, limits, and audience.
          </p>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Basics */}
          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Basics</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={values.name}
                  onChange={(e) => setValues({ ...values, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={values.slug}
                  onChange={(e) => setValues({ ...values, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={values.description}
                  onChange={(e) => setValues({ ...values, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Input
                  value={values.icon}
                  onChange={(e) => setValues({ ...values, icon: e.target.value })}
                  placeholder="Rocket"
                />
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Input
                  value={values.badge}
                  onChange={(e) => setValues({ ...values, badge: e.target.value })}
                  placeholder="Most Popular"
                />
              </div>
            </div>
          </section>

          {/* Pricing & CTA */}
          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Pricing & CTA</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={values.price.amount}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      price: { ...values.price, amount: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={values.price.currency}
                  onValueChange={(val) =>
                    setValues({ ...values, price: { ...values.price, currency: val } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="BDT">BDT</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <Select
                  value={values.price.billingCycle}
                  onValueChange={(val) =>
                    setValues({
                      ...values,
                      price: { ...values.price, billingCycle: val as any },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input
                  value={values.ctaText}
                  onChange={(e) => setValues({ ...values, ctaText: e.target.value })}
                  placeholder="Start Free Trial"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA URL</Label>
                <Input
                  value={values.ctaUrl}
                  onChange={(e) => setValues({ ...values, ctaUrl: e.target.value })}
                  placeholder="/checkout?plan=pro"
                />
              </div>
            </div>
          </section>

          {/* Features (dynamic from catalog) */}
          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Features</h3>
            </div>
            <div className="flex gap-2 mb-4">
              <Select value={selectedFeatureKey} onValueChange={setSelectedFeatureKey}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a feature" />
                </SelectTrigger>
                <SelectContent>
                  {featureCatalog
                    .filter((f) => f.isActive)
                    .map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label} ({f.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={addFeature}>
                <Plus className="mr-2 h-4 w-4" /> Add Feature
              </Button>
            </div>

            {values.features.length === 0 && (
              <div className="text-sm text-muted-foreground py-4 text-center">
                No features added yet.
              </div>
            )}

            <div className="space-y-3">
              {values.features.map((feat, idx) => (
                <div key={feat.key + idx} className="flex items-center gap-3 border rounded-lg p-3">
                  <div className="flex-1">
                    <p className="font-medium">{feat.label}</p>
                    <p className="text-xs text-muted-foreground">{feat.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {feat.type === "boolean" ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={feat.value as boolean}
                          onCheckedChange={(checked) => updateFeatureValue(idx, checked)}
                        />
                        <span className="text-sm">
                          {(feat.value as boolean) ? "True" : "False"}
                        </span>
                      </div>
                    ) : feat.type === "number" ? (
                      <Input
                        type="number"
                        className="w-24"
                        value={feat.value as number}
                        onChange={(e) => updateFeatureValue(idx, Number(e.target.value))}
                      />
                    ) : (
                      <Input
                        className="w-32"
                        value={feat.value as string}
                        onChange={(e) => updateFeatureValue(idx, e.target.value)}
                      />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(idx)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Limits */}
          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Limits</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Max Courses</Label>
                <Input
                  type="number"
                  value={values.limits.maxCourses}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxCourses: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Students</Label>
                <Input
                  type="number"
                  value={values.limits.maxStudents}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxStudents: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Templates</Label>
                <Input
                  type="number"
                  value={values.limits.maxTemplates}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxTemplates: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Landing Pages</Label>
                <Input
                  type="number"
                  value={values.limits.maxLandingPages}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxLandingPages: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Forms</Label>
                <Input
                  type="number"
                  value={values.limits.maxForms}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxForms: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Automations</Label>
                <Input
                  type="number"
                  value={values.limits.maxAutomations}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxAutomations: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Sales Pages</Label>
                <Input
                  type="number"
                  value={values.limits.maxSalesPages}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxSalesPages: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Funnels</Label>
                <Input
                  type="number"
                  value={values.limits.maxFunnels}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxFunnels: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Email Campaigns</Label>
                <Input
                  type="number"
                  value={values.limits.maxEmailCampaigns}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxEmailCampaigns: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Digital Products</Label>
                <Input
                  type="number"
                  value={values.limits.maxDigitalProducts}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxDigitalProducts: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Coaching Clients</Label>
                <Input
                  type="number"
                  value={values.limits.maxCoachingClients}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxCoachingClients: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Course Enrollments</Label>
                <Input
                  type="number"
                  value={values.limits.maxCourseEnrollments}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, maxCourseEnrollments: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>AI Credits</Label>
                <Input
                  type="number"
                  value={values.limits.aiCredits || 0}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, aiCredits: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <Label>Certificate Enabled</Label>
                <Switch
                  checked={values.limits.certificateEnabled}
                  onCheckedChange={(checked) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, certificateEnabled: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <Label>Job Board Access</Label>
                <Switch
                  checked={values.limits.jobBoardAccess}
                  onCheckedChange={(checked) =>
                    setValues({
                      ...values,
                      limits: { ...values.limits, jobBoardAccess: checked },
                    })
                  }
                />
              </div>
            </div>
          </section>

          {/* Audience */}
          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D4A017]" />
              <h3 className="font-semibold">Audience</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {(["teacher", "student", "affiliate", "all"] as PlanAudience[]).map((role) => (
                <div key={role} className="flex items-center gap-2">
                  <Switch
                    checked={values.applicableTo.includes(role)}
                    onCheckedChange={(checked) =>
                      setValues((prev) => ({
                        ...prev,
                        applicableTo: checked
                          ? [...prev.applicableTo, role]
                          : prev.applicableTo.filter((r) => r !== role),
                      }))
                    }
                  />
                  <Label className="capitalize">{role}</Label>
                </div>
              ))}
            </div>
          </section>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-themeAdminPrimary hover:bg-themeAdminPrimary/90"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}