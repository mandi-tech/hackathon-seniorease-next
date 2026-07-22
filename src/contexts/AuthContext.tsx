"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/src/libs/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  font_size: "padrao" | "grande" | "muito-grande";
  contrast_level: boolean;
  high_element_spacing: boolean;
  ui_mode: boolean;
  visual_feedback: boolean;
  extra_confirm: boolean;
  has_configured?: boolean | null;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePreferences: (
    prefs: Partial<UserPreferences>,
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: {
    name?: string;
    email?: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const applyPreferences = (prefs: UserPreferences) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    if (prefs.font_size === "grande") {
      root.setAttribute("data-font-size", "large");
    } else if (prefs.font_size === "muito-grande") {
      root.setAttribute("data-font-size", "extra-large");
    } else {
      root.removeAttribute("data-font-size");
    }

    if (prefs.contrast_level) {
      root.setAttribute("data-contrast", "high");
    } else {
      root.removeAttribute("data-contrast");
    }

    if (prefs.high_element_spacing) {
      root.setAttribute("data-spacing", "wide");
    } else {
      root.removeAttribute("data-spacing");
    }

    if (prefs.ui_mode) {
      root.setAttribute("data-ui-mode", "simple");
    } else {
      root.removeAttribute("data-ui-mode");
    }

    if (prefs.visual_feedback) {
      root.setAttribute("data-visual-feedback", "high");
    } else {
      root.removeAttribute("data-visual-feedback");
    }
  };

  const clearPreferences = () => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.removeAttribute("data-font-size");
    root.removeAttribute("data-contrast");
    root.removeAttribute("data-spacing");
    root.removeAttribute("data-ui-mode");
    root.removeAttribute("data-visual-feedback");
  };

  const loadUserData = useCallback(
    async (currUser: User | null): Promise<UserPreferences | null> => {
      try {
        if (!currUser) {
          setUser(null);
          setProfile(null);
          setPreferences(null);
          clearPreferences();
          return null;
        }

        setUser(currUser);

        const { data: pData, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currUser.id)
          .maybeSingle();

        let activeProfile = pData;

        if (profileErr) {
          console.error("Erro ao buscar perfil:", profileErr);
        }

        if (!pData && !profileErr) {
          const { data: newProfile, error: createProfileErr } = await supabase
            .from("profiles")
            .insert({
              id: currUser.id,
              name:
                currUser.user_metadata?.name ||
                currUser.user_metadata?.nome ||
                "Usuário SeniorEase",
              email: currUser.email || "",
            })
            .select()
            .maybeSingle();

          if (createProfileErr) {
            console.error("Erro ao criar perfil em falta:", createProfileErr);
          } else if (newProfile) {
            activeProfile = newProfile;
          }
        }

        if (activeProfile) {
          setProfile(activeProfile);
        }

        const { data: prData, error: prefErr } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", currUser.id)
          .maybeSingle();

        let activePreferences = prData;

        if (prefErr) {
          console.error("Erro ao buscar preferências:", prefErr);
        }

        if (!prData && !prefErr) {
          const { data: newPrefs, error: createPrefsErr } = await supabase
            .from("user_preferences")
            .insert({
              user_id: currUser.id,
              font_size: "padrao",
              contrast_level: false,
              high_element_spacing: false,
              ui_mode: false,
              visual_feedback: true,
              extra_confirm: false,
            })
            .select()
            .maybeSingle();

          if (createPrefsErr) {
            console.error(
              "Erro ao criar preferências em falta:",
              createPrefsErr,
            );
          } else if (newPrefs) {
            activePreferences = newPrefs;
          }
        }

        if (activePreferences) {
          setPreferences(activePreferences);
          applyPreferences(activePreferences);
          return activePreferences as UserPreferences;
        }

        return null;
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setPreferences(null);
        clearPreferences();
      }
      setLoading(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          await loadUserData(session.user);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setPreferences(null);
        clearPreferences();
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserData, router]);

  useEffect(() => {
    if (!loading && user && preferences) {
      const isConfigPage = window.location.pathname === "/acessibilidade";
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/novo_cadastro";

      if (
        preferences.has_configured === false &&
        !isConfigPage &&
        !isAuthPage
      ) {
        router.push("/acessibilidade");
      }
    }
  }, [loading, user, preferences, router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const prefs = await loadUserData(data.user);
        if (prefs && prefs.has_configured === false) {
          router.push("/acessibilidade");
        } else {
          router.push("/");
        }
        return { success: true };
      }

      return { success: false, error: "Usuário não encontrado." };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido ao entrar.";
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        await loadUserData(data.user);
        return { success: true };
      }

      return { success: true };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido ao cadastrar.";
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPreferences(null);
    clearPreferences();
    router.push("/login");
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!user) return { success: false, error: "Nenhum usuário logado." };

    try {
      const { has_configured, ...safePrefs } = newPrefs;
      const columnExists = preferences?.has_configured !== undefined;
      const payload = columnExists
        ? { ...safePrefs, has_configured }
        : safePrefs;

      const timestamp = { updated_at: new Date().toISOString() };

      const { data: updatedData, error: updateError } = await supabase
        .from("user_preferences")
        .update({ ...payload, ...timestamp })
        .eq("user_id", user.id)
        .select()
        .maybeSingle();

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (updatedData) {
        setPreferences(updatedData);
        applyPreferences(updatedData);
        return { success: true };
      }

      const { data: insertedData, error: insertError } = await supabase
        .from("user_preferences")
        .insert({
          user_id: user.id,
          font_size: "padrao",
          contrast_level: false,
          high_element_spacing: false,
          ui_mode: false,
          visual_feedback: true,
          extra_confirm: false,
          ...payload,
          ...timestamp,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      if (insertedData) {
        setPreferences(insertedData);
        applyPreferences(insertedData);
        return { success: true };
      }

      return { success: false, error: "Falha ao salvar preferências." };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido ao salvar.";
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (data: {
    name?: string;
    email?: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Nenhum usuário logado." };

    try {
      const authUpdates: {
        email?: string;
        password?: string;
        data?: { name?: string };
      } = {};

      if (data.email && data.email !== user.email) {
        authUpdates.email = data.email;
      }
      if (data.password && data.password.trim() !== "") {
        authUpdates.password = data.password;
      }
      if (data.name) {
        authUpdates.data = { name: data.name };
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(
          authUpdates,
        );
        if (authError) {
          return { success: false, error: authError.message };
        }
      }

      if (data.name || data.email) {
        const profileUpdates: { name?: string; email?: string } = {};
        if (data.name) profileUpdates.name = data.name;
        if (data.email) profileUpdates.email = data.email;

        const { data: updatedProfile, error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdates)
          .eq("id", user.id)
          .select()
          .maybeSingle();

        if (profileError) {
          return { success: false, error: profileError.message };
        }

        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      }

      return { success: true };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao atualizar dados do perfil.";
      return { success: false, error: errorMessage };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        preferences,
        loading,
        signIn,
        signUp,
        signOut,
        updatePreferences,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
