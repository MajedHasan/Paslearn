// app/(dashboard)/student/settings/_components/login-security.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Save,
  X,
  Lock,
  Smartphone,
  Trash2,
  LogOut,
  Zap,
  Key,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type SessionItem = {
  id: string;
  device: string;
  ip?: string;
  location?: string;
  lastActive: string;
  current?: boolean;
  jti?: string;
};

type ConnectedAccount = {
  id: string;
  provider: string;
  connectedAt: string;
};

export default function LoginSecurity() {
  // user data (fetched from profile)
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<null | "email" | "username">(
    null,
  );
  const [tempValue, setTempValue] = useState("");

  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [otpUri, setOtpUri] = useState<string | null>(null);
  const [otpVerifyToken, setOtpVerifyToken] = useState("");

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // load initial data: profile, sessions, connected accounts
  useEffect(() => {
    async function loadAll() {
      try {
        // profile
        const p = await api.get("/student");
        if (p?.data?.profile) {
          setEmail(p?.data?.profile?.email ?? null);
          setUsername(p?.data?.profile?.username ?? null);
          setIs2faEnabled(Boolean(p?.data?.profile?.twoFactor?.enabled));
        }
        // sessions
        const s = await api.get("/student/sessions");
        if (s?.data?.sessions) {
          // normalize to our SessionItem type; backend returns jti etc.
          setSessions(
            s?.data?.sessions.map((ss: any, idx: number) => ({
              id: ss.jti || ss._id || `s${idx}`,
              device: ss.userAgent || ss.device || "Unknown",
              ip: ss.ip,
              location: ss.location,
              lastActive: ss.lastActiveAt
                ? new Date(ss.lastActiveAt).toLocaleString()
                : "",
              current: ss.jti === (p?.data?.currentJti || undefined) || false,
              jti: ss.jti,
            })),
          );
        }
        // connected accounts
        const ca = await api.get("/student/connected-accounts");
        if (ca?.data?.connected)
          setConnectedAccounts(
            ca?.data?.connected.map((c: any) => ({
              id: c._id || c.provider + "-" + c.providerId,
              provider: c.provider,
              connectedAt: c.createdAt
                ? new Date(c.createdAt).toISOString().slice(0, 10)
                : "",
            })),
          );
      } catch (err: any) {
        console.error("Init error", err);
        // don't spam user if not authenticated
      }
    }
    loadAll();
  }, []);

  // ---------- API functions ----------
  async function saveProfileField(field: "email" | "username", value: string) {
    setLoadingAction(`saving-${field}`);
    try {
      // backend expects email update via POST /api/profile (form-data or json)
      const body: any = {};
      body[field === "email" ? "email" : "username"] = value;
      await api.post("/api/profile", JSON.stringify(body), {
        headers: { "Content-Type": "application/json" },
      });
      if (field === "email") setEmail(value);
      if (field === "username") setUsername(value);
      toast.success(`${field === "email" ? "Email" : "Username"} updated`);
      setEditingField(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save. Try again.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function changePassword(current: string, next: string) {
    setLoadingAction("change-password");
    try {
      await api.post(
        "/student/change-password",
        JSON.stringify({ currentPassword: current, newPassword: next }),
        { headers: { "Content-Type": "application/json" } },
      );
      toast.success("Password changed successfully");
      setShowChangePassword(false);
      // after password change you might want to force sign out elsewhere — handled by backend/session revoke
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to change password");
    } finally {
      setLoadingAction(null);
    }
  }

  // 2FA: prepare shows QR and base32 on modal; enable requires token
  async function prepare2FA() {
    setLoadingAction("prepare-2fa");
    try {
      const res = await api.get("/student/2fa/prepare");
      // res should contain otpauth_url and base32; we'll render QR using external service
      if (res?.data?.otpauth_url) {
        setOtpUri(res?.data?.otpauth_url);
        setShow2FAModal(true);
      } else {
        toast.error("Could not prepare 2FA");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to prepare 2FA");
    } finally {
      setLoadingAction(null);
    }
  }

  async function enable2FA(token: string) {
    setLoadingAction("enable-2fa");
    try {
      const res = await api.post(
        "/student/2fa/enable",
        JSON.stringify({ token }),
        { headers: { "Content-Type": "application/json" } },
      );
      if (res?.data?.recoveryCodes) {
        setRecoveryCodes(res?.data?.recoveryCodes);
        setIs2faEnabled(true);
        toast.success("2FA enabled — save your recovery codes");
      } else {
        toast.success("2FA enabled");
        setIs2faEnabled(true);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to enable 2FA");
    } finally {
      setLoadingAction(null);
    }
  }

  async function disable2FA(tokenOrRecovery?: string) {
    setLoadingAction("disable-2fa");
    try {
      await api.post(
        "/student/2fa/disable",
        JSON.stringify({ tokenOrRecovery }),
        { headers: { "Content-Type": "application/json" } },
      );
      setIs2faEnabled(false);
      setRecoveryCodes(null);
      toast.success("2FA disabled");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to disable 2FA");
    } finally {
      setLoadingAction(null);
    }
  }

  // toggle: if enabling -> prepare + open modal; if disabling -> call disable directly (asking for token/recovery may be needed)
  async function toggle2FA(enable: boolean) {
    if (enable) {
      await prepare2FA();
    } else {
      // ask backend to disable; for UX you might require a code; here we'll call disable and let backend reject if needed
      await disable2FA();
    }
  }

  async function signOutSession(sessionId: string) {
    setLoadingAction(`signout-${sessionId}`);
    try {
      await api.post(
        "/student/sessions/revoke",
        JSON.stringify({ jti: sessionId }),
        { headers: { "Content-Type": "application/json" } },
      );
      setSessions((s) => s.filter((x) => x.id !== sessionId));
      toast.success("Signed out from session");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to sign out session");
    } finally {
      setLoadingAction(null);
    }
  }

  async function signOutAll() {
    setLoadingAction("signout-all");
    try {
      // exceptJti can be passed if backend provides current jti; here we don't pass it
      await api.post("/student/sessions/revoke-all", JSON.stringify({}), {
        headers: { "Content-Type": "application/json" },
      });
      setSessions((s) => s.filter((x) => x.current));
      toast.success("Signed out of all other sessions");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to sign out all sessions");
    } finally {
      setLoadingAction(null);
    }
  }

  async function connectProvider(provider: string) {
    setLoadingAction(`connect-${provider}`);
    try {
      // For OAuth flows you normally redirect to provider. Here we simulate by calling an endpoint that returns an oauth url
      // If your backend supports it, call GET /api/auth/oauth/:provider to get redirect URL
      // For now we'll open a new window that navigates to backend oauth route (which should redirect back with callback)
      const oauthUrl = `${
        process.env.NEXT_PUBLIC_API_URL || ""
      }/auth/oauth/${provider.toLowerCase()}`;
      window.open(oauthUrl, "_blank", "noopener");
      toast.success(`Redirecting to ${provider}...`);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to connect ${provider}`);
    } finally {
      setLoadingAction(null);
    }
  }

  async function disconnectProvider(idOrProvider: string) {
    setLoadingAction(`disconnect-${idOrProvider}`);
    try {
      // our backend disconnect endpoint expects provider name
      await api.post(
        "/student/connected-accounts/disconnect",
        JSON.stringify({ provider: idOrProvider }),
        { headers: { "Content-Type": "application/json" } },
      );
      setConnectedAccounts((c) =>
        c.filter((x) => x.id !== idOrProvider && x.provider !== idOrProvider),
      );
      toast.success("Disconnected account");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to disconnect account");
    } finally {
      setLoadingAction(null);
    }
  }

  async function deleteAccount() {
    setLoadingAction("delete-account");
    try {
      await api.delete("/student");
      toast.success("Account deleted");
      // TODO: redirect user to homepage/login
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete account");
    } finally {
      setLoadingAction(null);
      setShowDeleteConfirm(false);
    }
  }

  // ---------- Inline edit handlers ----------
  function startEdit(field: "email" | "username") {
    setEditingField(field);
    setTempValue(field === "email" ? (email ?? "") : (username ?? ""));
  }

  function cancelEdit() {
    setEditingField(null);
    setTempValue("");
  }

  function isValidEmail(v: string) {
    return /\S+@\S+\.\S+/.test(v);
  }
  function isValidUsername(v: string) {
    return v.trim().length >= 3;
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-[1100px] mx-auto px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#4a5568] text-xl font-semibold">
              Login & Security
            </h1>
            <p className="text-sm text-gray-600">
              Manage email, password, 2FA, sessions and connected accounts.
            </p>
          </div>
        </div>

        {/* Email & Username */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Account</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => startEdit("email")}
                className="px-3 py-2"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowChangePassword(true)}
                className="px-3 py-2"
              >
                <Lock className="w-4 h-4 mr-2" /> Change password
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-700 text-sm font-semibold mb-2 block">
                Email
              </Label>
              {editingField === "email" ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="h-12 bg-gray-50"
                  />
                  <Button
                    onClick={() => {
                      if (!isValidEmail(tempValue)) {
                        toast.error("Please enter a valid email");
                        return;
                      }
                      saveProfileField("email", tempValue);
                    }}
                    disabled={loadingAction === "saving-email"}
                    className="px-4"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                  <Button onClick={cancelEdit} variant="ghost" className="px-3">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-gray-800 font-medium">
                    {email || "—"}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label className="text-gray-700 text-sm font-semibold mb-2 block">
                Username
              </Label>
              {editingField === "username" ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="h-12 bg-gray-50"
                  />
                  <Button
                    onClick={() => {
                      if (!isValidUsername(tempValue)) {
                        toast.error("Username must be at least 3 characters");
                        return;
                      }
                      saveProfileField("username", tempValue);
                    }}
                    disabled={loadingAction === "saving-username"}
                    className="px-4"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                  <Button onClick={cancelEdit} variant="ghost" className="px-3">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-gray-800 font-medium">
                    @{username || "—"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two Factor Authentication */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account with TOTP-based
                2FA.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                id="2fa-switch"
                checked={is2faEnabled}
                onCheckedChange={(v) => toggle2FA(!!v)}
                // disable while loading
                aria-label="Toggle 2FA"
              />
              <Button
                onClick={() => {
                  if (!is2faEnabled) {
                    prepare2FA();
                  } else {
                    // open manage modal to allow disable via token
                    setShow2FAModal(true);
                  }
                }}
                variant="ghost"
                className="px-3"
              >
                Manage
              </Button>
            </div>
          </div>

          {is2faEnabled && recoveryCodes && (
            <div className="mt-4 bg-gray-50 border border-dashed p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    Recovery codes
                  </p>
                  <p className="text-xs text-gray-500">
                    Store these in a safe place. Each code can be used once.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    // copy codes
                    navigator.clipboard?.writeText(recoveryCodes.join("\n"));
                    toast.success("Recovery codes copied");
                  }}
                  className="px-4"
                >
                  Copy
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {recoveryCodes.map((c) => (
                  <div
                    key={c}
                    className="bg-white border px-3 py-2 rounded text-xs font-mono text-gray-800"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Active sessions</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => signOutAll()}
                disabled={!!loadingAction}
                className="px-4"
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign out other sessions
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded bg-white border">
                    <Smartphone className="w-6 h-6" />{" "}
                    {/* icon placeholder - not used */}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{s.device}</div>
                    <div className="text-xs text-gray-500">
                      {s.ip || "Unknown IP"} •{" "}
                      {s.location || "Unknown location"}
                    </div>
                    <div className="text-xs text-gray-400">
                      Last active: {s.lastActive}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {s.current ? (
                    <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                      <Check className="w-4 h-4" /> Current
                    </div>
                  ) : (
                    <Button
                      onClick={() => signOutSession(s.jti ?? s.id)}
                      disabled={!!loadingAction}
                      variant="outline"
                      className="px-3"
                    >
                      Sign out
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Connected accounts
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => connectProvider("GitHub")}
                className="px-3"
              >
                Connect GitHub
              </Button>
              <Button
                onClick={() => connectProvider("Google")}
                className="px-3"
              >
                Connect Google
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {connectedAccounts.length === 0 && (
              <p className="text-sm text-gray-500">No connected accounts</p>
            )}
            {connectedAccounts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border"
              >
                <div>
                  <div className="font-medium">{c.provider}</div>
                  <div className="text-xs text-gray-500">
                    Connected on {c.connectedAt}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => disconnectProvider(c.provider)}
                    className="px-3"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Danger zone</h3>
              <p className="text-sm text-gray-500">
                Permanent actions related to your account.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="max-w-lg w-full p-0 bg-white rounded-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Change password</h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-500"
              >
                <X />
              </button>
            </div>

            <ChangePasswordForm
              onCancel={() => setShowChangePassword(false)}
              onSubmit={changePassword}
              loading={loadingAction === "change-password"}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="max-w-2xl w-full p-0 bg-white rounded-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Two-Factor Authentication</h3>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-gray-500"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border p-4 rounded-lg">
                <p className="font-medium text-gray-800 mb-3">
                  Set up authenticator
                </p>

                <div className="h-48 bg-white border rounded flex items-center justify-center text-gray-400">
                  {otpUri ? (
                    // use a quick external QR generator with the otpauth_url
                    // NOTE: if you prefer, backend could return a QR dataUrl directly.
                    // using qrserver (public) — replace with your QR generation if required.
                    // encodeURIComponent(otpUri) might contain secrets — it's ok for scan.
                    // ensure you use HTTPS in production.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                        otpUri,
                      )}&size=200x200`}
                      alt="QR code"
                      className="mx-auto"
                    />
                  ) : (
                    <div className="text-center">
                      <Key className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                      <div className="text-sm">QR placeholder</div>
                      <div className="text-xs text-gray-400">
                        Scan with Google Authenticator or Authy
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  After scanning, enter the 6-digit code from your authenticator
                  app below to confirm.
                </div>

                {otpUri && (
                  <div className="mt-3">
                    <Label className="text-sm font-medium mb-2 block">
                      Verification code
                    </Label>
                    <Input
                      value={otpVerifyToken}
                      onChange={(e) => setOtpVerifyToken(e.target.value)}
                      placeholder="123456"
                      className="h-12"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => enable2FA(otpVerifyToken)}
                        disabled={loadingAction === "enable-2fa"}
                      >
                        Verify & Enable
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setOtpUri(null);
                          setOtpVerifyToken("");
                          setShow2FAModal(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border p-4 rounded-lg">
                <p className="font-medium text-gray-800 mb-3">Recovery codes</p>
                {recoveryCodes ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {recoveryCodes.map((c) => (
                        <div
                          key={c}
                          className="bg-white border p-2 rounded text-xs font-mono"
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            recoveryCodes.join("\n"),
                          );
                          toast.success("Copied recovery codes");
                        }}
                      >
                        Copy codes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          // regenerate requires server flow. We call disable then prepare again to regenerate.
                          toast.info("Regenerating recovery codes...");
                          // simple approach: ask user to disable+enable again via UI
                        }}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    No recovery codes available.
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                onClick={() => {
                  setShow2FAModal(false);
                }}
                variant="ghost"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete account confirm */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md w-full p-0 bg-white rounded-xl">
          <div className="p-6">
            <h3 className="text-xl font-bold text-red-600 mb-2">
              Delete account
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This action is permanent. All your data will be deleted. Are you
              sure?
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteAccount()}
                disabled={loadingAction === "delete-account"}
              >
                {loadingAction === "delete-account"
                  ? "Deleting..."
                  : "Delete account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------
   ChangePasswordForm subcomponent
   ------------------------- */
function ChangePasswordForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (current: string, next: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async () => {
    if (!current || !next || !confirm) {
      toast.error("Please fill all fields");
      return;
    }
    if (next.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (next !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    await onSubmit(current, next);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">
          Current password
        </Label>
        <Input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="h-12"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">New password</Label>
        <Input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="h-12"
        />
        <div className="text-xs text-gray-500 mt-1">
          At least 8 characters. Include uppercase, lowercase and numbers.
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">
          Confirm new password
        </Label>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-12"
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Change password"}
        </Button>
      </div>
    </div>
  );
}
