"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/src/libs/supabase/client";
import { useRouter } from "next/navigation";

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
  has_configured?: boolean | null; // Opcional: requer migration ALTER TABLE
  updated_at?: string;
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Função para aplicar os estilos de acessibilidade no documentElement
  const applyPreferences = (prefs: UserPreferences) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    // 1. Tamanho da Fonte
    if (prefs.font_size === "grande") {
      root.setAttribute("data-font-size", "large");
    } else if (prefs.font_size === "muito-grande") {
      root.setAttribute("data-font-size", "extra-large");
    } else {
      root.removeAttribute("data-font-size");
    }

    // 2. Alto Contraste
    if (prefs.contrast_level) {
      root.setAttribute("data-contrast", "high");
    } else {
      root.removeAttribute("data-contrast");
    }

    // 3. Espaçamento Amplo
    if (prefs.high_element_spacing) {
      root.setAttribute("data-spacing", "wide");
    } else {
      root.removeAttribute("data-spacing");
    }

    // 4. Modo de UI Simples
    if (prefs.ui_mode) {
      root.setAttribute("data-ui-mode", "simple");
    } else {
      root.removeAttribute("data-ui-mode");
    }

    // 5. Feedback Visual
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

  // Carrega os dados do usuário, perfil e preferências (com auto-criação se estiverem ausentes)
  const loadUserData = async (currUser: any): Promise<UserPreferences | null> => {
    try {
      if (!currUser) {
        setUser(null);
        setProfile(null);
        setPreferences(null);
        clearPreferences();
        return null;
      }

      setUser(currUser);

      // 1. Busca perfil (com maybeSingle para evitar PGRST116)
      const { data: pData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currUser.id)
        .maybeSingle();

      let activeProfile = pData;

      if (profileErr) {
        console.error("Erro ao buscar perfil:", profileErr);
      }

      // Se o perfil não existir (ex: usuário antigo na tabela auth.users), cria automaticamente
      if (!pData && !profileErr) {
        const { data: newProfile, error: createProfileErr } = await supabase
          .from("profiles")
          .insert({
            id: currUser.id,
            name: currUser.user_metadata?.name || currUser.user_metadata?.nome || "Usuário SeniorEase",
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

      // 2. Busca preferências (com maybeSingle para evitar PGRST116)
      const { data: prData, error: prefErr } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", currUser.id)
        .maybeSingle();

      let activePreferences = prData;

      if (prefErr) {
        console.error("Erro ao buscar preferências:", prefErr);
      }

      // Se as preferências não existirem, cria automaticamente
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
            // has_configured omitido: o DEFAULT false do banco cuida disso
          })
          .select()
          .maybeSingle();

        if (createPrefsErr) {
          console.error("Erro ao criar preferências em falta:", createPrefsErr);
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
  };

  useEffect(() => {
    // Verifica sessão atual no mount
    const checkSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
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

    // Ouve alterações no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Efeito global de redirecionamento para primeira configuração
  // Só redireciona se has_configured for explicitamente false (não null/undefined = campo não existe ainda)
  useEffect(() => {
    if (!loading && user && preferences) {
      const isConfigPage = window.location.pathname === "/acessibilidade";
      const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/novo_cadastro";

      if (preferences.has_configured === false && !isConfigPage && !isAuthPage) {
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
    } catch (err: any) {
      return { success: false, error: err.message || "Erro desconhecido ao entrar." };
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
        // O efeito global se encarregará de empurrar para /acessibilidade já que has_configured será falso
        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Erro desconhecido ao cadastrar." };
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
      // Strip has_configured if the column doesn't exist in DB yet
      const { has_configured, ...safePrefs } = newPrefs as any;
      const columnExists = preferences?.has_configured !== undefined;
      const payload = columnExists
        ? { ...safePrefs, has_configured }
        : safePrefs;

      const timestamp = { updated_at: new Date().toISOString() };

      // 1. Tenta UPDATE primeiro (usa a política de UPDATE, que funciona)
      const { data: updatedData, error: updateError } = await supabase
        .from("user_preferences")
        .update({ ...payload, ...timestamp })
        .eq("user_id", user.id)
        .select()
        .maybeSingle();

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // UPDATE retornou dados — linha existia e foi atualizada
      if (updatedData) {
        setPreferences(updatedData);
        applyPreferences(updatedData);
        return { success: true };
      }

      // 2. Linha não existia: tenta INSERT (fallback para usuários sem linha de prefs)
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
          ...payload, // sobrescreve com os valores do formulário
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
    } catch (err: any) {
      return { success: false, error: err.message || "Erro desconhecido ao salvar." };
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
