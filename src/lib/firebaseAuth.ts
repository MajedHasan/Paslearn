// firebaseAuth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  deleteUser,
  getAdditionalUserInfo,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "./firebase";

// --- Providers ---
const googleProvider = new GoogleAuthProvider();

// --- Email/Password ---
export const signupWithEmailAndPassword = async (
  email: string,
  password: string,
  name?: string
) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  if (name) {
    await updateProfile(user, { displayName: name });
  }

  return user;
};

export const signinWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

// --- Google Signup ---
export const signupWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const { user } = result;

  // const info = getAdditionalUserInfo(result);
  // if (!info?.isNewUser) {
  //   // Already exists → cleanup
  //   await deleteUser(user);
  //   throw new Error(
  //     "This Google account is already registered. Please sign in instead."
  //   );
  // }

  return user;
};

// --- Google Signin ---
export const signinWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const { user } = result;

  const info = getAdditionalUserInfo(result);
  console.log(info);
  // if (info?.isNewUser) {
  //   // Not registered → cleanup
  //   await deleteUser(user);
  //   throw new Error("No account found. Please register with Google first.");
  // }

  return user;
};

// --- Extra helpers ---
export const sendVerifyEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

export const sendResetPassword = async (email: string) => {
  // Optionally pass actionCodeSettings to redirect back to your app after clicking link
  // const actionCodeSettings = { url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/forgot-password`, handleCodeInApp: true };
  const actionCodeSettings = {
    // URL you want to redirect back to
    url: `${window.location.origin}/auth/forgot-password`,
    handleCodeInApp: true, // important for SPA routing
  };
  await sendPasswordResetEmail(auth, email, actionCodeSettings);
  return true;
};

// returns the email for the given oobCode (so we know which account)
export const verifyResetCode = async (oobCode: string): Promise<string> => {
  const email = await verifyPasswordResetCode(auth, oobCode);
  return email;
};

// confirm reset with code + new password
export const confirmResetPassword = async (
  oobCode: string,
  newPassword: string
) => {
  await confirmPasswordReset(auth, oobCode, newPassword);
  return true;
};

// sign in and return firebase user + idToken
export const signinAndGetIdToken = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const user = res.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
};
