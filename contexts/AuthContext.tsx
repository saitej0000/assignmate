import { sendEmailVerification } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth as firebaseAuth, presence } from '../services/firebase';
import { userApi, dbService } from '../services/firestoreService';
import { notificationService } from '../services/notificationService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  // ✅ FIXED: Now accepts 7 arguments including fullName and bio
  register: (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => Promise<any>;
  completeGoogleSignup: (handle: string, school: string, is_writer: boolean, bio?: string, fullName?: string, aiProfile?: any) => Promise<void>;
  loginAnonymously: () => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const syncingRef = useRef<string | null>(null);
  const skipNextSyncRef = useRef<boolean>(false); // Flag to prevent race condition after registration
  const userJustSetRef = useRef<boolean>(false); // Flag to track if user was just set by register/completeSignup
  const isManualRegistration = useRef<boolean>(false); // ✅ Fix: Flag to pause sync logic during manual registration


  // Sync user profile from Firestore
  const syncUser = async (fbUser: any) => {
    const userId = fbUser.uid;

    // Skip sync if we are manually handling registration
    if (isManualRegistration.current) {
      setLoading(false);
      return;
    }

    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      // User was already set synchronously by register/completeSignup
      // Just ensure loading is false and exit
      if (userJustSetRef.current) {
        userJustSetRef.current = false;
        setLoading(false);
        return;
      }
    }

    if (syncingRef.current === userId) return;
    syncingRef.current = userId;

    try {
      const profile = await userApi.getProfile(userId);

      if (profile) {
        // Cast profile to User type for proper property access
        const typedProfile = profile as User;

        // ✅ FIX: Sync avatar_url from Google Auth if missing in Firestore
        if (!typedProfile.avatar_url && fbUser.photoURL) {
          typedProfile.avatar_url = fbUser.photoURL;
          // Fire and forget update to Firestore to persist it
          dbService.updateProfile(userId, { avatar_url: fbUser.photoURL }).catch(console.error);
        }

        setUser({
          ...typedProfile,
          email: fbUser.email || typedProfile.email || '',
          emailVerified: fbUser.emailVerified, // ✅ Sync from Auth
          // Use the actual value from Firestore, don't override!
          is_incomplete: typedProfile.is_incomplete ?? false
        } as User);
        presence.init(userId);

        // ✅ Update last_active timestamp for accurate online status
        dbService.updateProfile(userId, { last_active: new Date().toISOString() }).catch(console.error);
      } else {
        // ✅ ISSUE 3 FIX: Don't use invalid defaults like 'Student' or 'Not Specified'
        // Use empty strings which will correctly trigger the onboarding flow
        // The isProfileComplete() helper will properly detect these as incomplete
        const newProfile: Partial<User> = {
          id: userId,
          email: fbUser.email || '',
          handle: fbUser.displayName?.replace(/\s+/g, '_').toLowerCase() || 'user_' + userId.substring(0, 6),
          school: '', // Empty string - will be set in onboarding
          avatar_url: fbUser.photoURL || null,
          full_name: fbUser.displayName || '', // Empty string instead of 'Student'
          xp: 0,
          is_writer: false,
          is_incomplete: true // This forces onboarding
        };

        // Create the partial profile so we don't get 404s
        await userApi.createProfile(userId, newProfile);
        setUser(newProfile as User);
      }
    } catch (e) {
      console.error("AuthContext: Sync Failed", e);
      setUser(null);
    } finally {
      syncingRef.current = null;
    }
  };

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        await syncUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseAuth.logout();
    setUser(null);
  };

  // ✅ FIXED: register function now SAVES the name and bio
  const register = async (email: string, pass: string, fullName: string, handle: string, school: string, is_writer: boolean, bio?: string) => {
    // Flag to tell syncUser to back off
    isManualRegistration.current = true;

    try {
      const res = await firebaseAuth.register(email, pass);
      if (res.error) {
        isManualRegistration.current = false;
        return res;
      }

      if (res.data?.user) {
        try {
          // Create full profile immediately
          const profile = await userApi.createProfile(res.data.user.uid, {
            handle,
            school,
            email,
            full_name: fullName,
            bio: bio || '',
            is_writer,
            is_incomplete: false,
            avatar_url: null
          });

          // CRITICAL: Set user state FIRST
          const completeProfile = {
            ...profile,
            email: res.data.user.email || email,
            is_incomplete: false,
            emailVerified: false // Manual signup is not verified initially
          } as User;
          setUser(completeProfile);

          presence.init(res.data.user.uid);
          notificationService.sendWelcome(res.data.user.uid, handle).catch(console.error);

          // ✅ Native Firebase Email Verification
          try {
            await sendEmailVerification(res.data.user);
            console.log("Verification email sent (Native)");
            alert("Verification email sent! Please check your inbox before continuing.");
          } catch (err) {
            console.error("Failed to send verification email:", err);
          }

          // Reset flag after successful setup
          isManualRegistration.current = false;
          return { data: { ...res.data, session: true } };
        } catch (error: any) {
          console.error("Registration Error - Profile creation failed:", error);

          // Rollback
          try {
            await firebaseAuth.deleteUser();
            console.log("Rollback: Firebase Auth user deleted after profile creation failure");
          } catch (deleteError) {
            console.error("Rollback failed - orphaned Auth user may exist:", deleteError);
          }

          isManualRegistration.current = false;
          return { error: { message: "Registration failed. Please try again." } };
        }
      }
      return res;
    } catch (e) {
      isManualRegistration.current = false;
      throw e;
    }
  };

  const completeGoogleSignup = async (handle: string, school: string, is_writer: boolean, bio?: string, fullName?: string, aiProfile?: any) => {
    if (!user) throw new Error("User not found.");

    try {
      const profile = await userApi.createProfile(user.id, {
        handle,
        school,
        email: user.email,
        avatar_url: user.avatar_url || null,
        full_name: fullName || user.full_name || 'Student',
        bio: bio || '',
        is_writer,
        is_incomplete: false,
        ai_profile: aiProfile // Pass AI data
      });

      setUser({ ...profile, email: user.email, is_incomplete: false } as User);
      presence.init(user.id);
      notificationService.sendWelcome(user.id, handle).catch(console.error);

    } catch (e: any) {
      console.error("Profile Completion Failed:", e);
      throw e;
    }
  };

  const login = async (email: string, password: string) => {
    return await firebaseAuth.login(email, password);
  };
  const loginWithGoogle = firebaseAuth.loginWithGoogle;
  const loginAnonymously = firebaseAuth.loginAnonymously;
  const deleteAccount = async () => {
    if (!firebaseAuth.currentUser) return;
    try {
      // 1. Delete from Firestore first
      await userApi.deleteProfile(firebaseAuth.currentUser.uid);
      // 2. Delete from Auth
      await firebaseAuth.deleteUser();
      setUser(null);
    } catch (e) {
      throw e;
    }
  };

  const resendVerification = async () => {
    if (firebaseAuth.currentUser) {
      await sendEmailVerification(firebaseAuth.currentUser);
    }
  };

  const resetPassword = async (email: string) => { const res = await firebaseAuth.resetPassword(email); if (res.error) throw res.error; };

  const refreshProfile = async () => {
    if (!firebaseAuth.currentUser) return;

    // 1. Force reload of Auth user to get fresh emailVerified status
    await firebaseAuth.currentUser.reload();

    // 2. Reset sync lock
    syncingRef.current = null;

    // 3. Sync with the FRESH current user object
    await syncUser(firebaseAuth.currentUser);
  };

  const value = {
    user,
    loading,
    login: firebaseAuth.login,
    loginWithGoogle,
    register,
    completeGoogleSignup,
    loginAnonymously,
    logout,
    refreshProfile,
    deleteAccount,
    resetPassword,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
