"use client";

import React from "react";
import { Avatar, Button, Card, Descriptions, Tag, Spin } from "antd";
import { Pen, User, Mail, Settings, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { getInitials, formatFontSize, formatPreferenceStatus } from "@/src/libs/utils/formatters";

export default function DadosPerfil() {
  const router = useRouter();
  const { profile, user, preferences, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  const name = profile?.name || "Usuário SeniorEase";
  const email = profile?.email || user?.email || "Sem e-mail cadastrado";

  return (
    <section className="w-full space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-primaria text-titulo1 font-semibold m-0 flex items-center gap-2">
          <User size={32} /> Meu Perfil
        </h1>
      </div>

      {/* Cartão do Usuário */}
      <Card className="shadow-md bg-fundo-secundario border border-fundo">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar 
            size={90} 
            style={{ backgroundColor: "var(--theme-primaria)", color: "#fff", fontSize: "2rem" }}
            className="flex items-center justify-center font-bold"
          >
            {getInitials(name, email)}
          </Avatar>
          
          <div className="space-y-2 text-center sm:text-left flex-1">
            <h2 className="text-titulo2 font-bold text-secundaria m-0">{name}</h2>
            <p className="text-primaria text-titulo3 flex items-center justify-center sm:justify-start gap-2 m-0">
              <Mail size={18} /> {email}
            </p>
          </div>
        </div>
      </Card>

      {/* Preferências de Acessibilidade */}
      <Card 
        className="shadow-md bg-fundo-secundario border border-fundo"
        title={
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-titulo2 font-semibold text-secundaria">
              <Settings size={22} className="text-primaria" /> Minhas Preferências de Acessibilidade
            </span>
            <Button
              type="primary"
              icon={<Pen size={16} />}
              className="text-paragrafo font-medium flex items-center gap-1"
              onClick={() => router.push("/acessibilidade")}
            >
              Editar
            </Button>
          </div>
        }
      >
        {preferences ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            {/* Modo de Interface */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">Modo de Interface</h4>
                <p className="text-xs text-texto-secundaria m-0">Interface visual padrão ou simplificada</p>
              </div>
              <Tag color={preferences.ui_mode ? "blue" : "default"} className="text-paragrafo py-0.5 px-3 font-semibold">
                {preferences.ui_mode ? "Modo Simples" : "Modo Padrão"}
              </Tag>
            </div>

            {/* Tamanho da Fonte */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">Tamanho da Fonte</h4>
                <p className="text-xs text-texto-secundaria m-0">Escala de legibilidade do texto</p>
              </div>
              <Tag color="purple" className="text-paragrafo py-0.5 px-3 font-semibold">
                {formatFontSize(preferences.font_size)}
              </Tag>
            </div>

            {/* Contraste Alto */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">Contraste Alto</h4>
                <p className="text-xs text-texto-secundaria m-0">Aumenta o contraste visual da tela</p>
              </div>
              <Tag 
                color={preferences.contrast_level ? "success" : "default"} 
                icon={preferences.contrast_level ? <CheckCircle2 size={12} className="inline mr-1" /> : <XCircle size={12} className="inline mr-1" />}
                className="text-paragrafo py-0.5 px-3 font-semibold flex items-center"
              >
                {formatPreferenceStatus(preferences.contrast_level)}
              </Tag>
            </div>

            {/* Espaçamento Amplo */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">Espaçamento</h4>
                <p className="text-xs text-texto-secundaria m-0">Aumenta o espaçamento entre elementos</p>
              </div>
              <Tag color={preferences.high_element_spacing ? "cyan" : "default"} className="text-paragrafo py-0.5 px-3 font-semibold">
                {preferences.high_element_spacing ? "Amplo" : "Confortável"}
              </Tag>
            </div>

            {/* Feedback Visual Reforçado */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">Feedback Visual</h4>
                <p className="text-xs text-texto-secundaria m-0">Indicadores e destaques visuais extras</p>
              </div>
              <Tag 
                color={preferences.visual_feedback ? "success" : "default"}
                icon={preferences.visual_feedback ? <CheckCircle2 size={12} className="inline mr-1" /> : <XCircle size={12} className="inline mr-1" />}
                className="text-paragrafo py-0.5 px-3 font-semibold flex items-center"
              >
                {formatPreferenceStatus(preferences.visual_feedback)}
              </Tag>
            </div>

            {/* Confirmação Extra */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">Segurança de Exclusão</h4>
                <p className="text-xs text-texto-secundaria m-0">Exigir confirmação antes de apagar itens</p>
              </div>
              <Tag 
                color={preferences.extra_confirm ? "warning" : "default"}
                className="text-paragrafo py-0.5 px-3 font-semibold"
              >
                {preferences.extra_confirm ? "Confirmação Exigida" : "Direta (Sem confirmação)"}
              </Tag>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-texto-secundaria text-paragrafo">
            Nenhuma preferência de acessibilidade configurada.
          </div>
        )}
      </Card>
    </section>
  );
}
