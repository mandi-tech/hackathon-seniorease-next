"use client";

import React from "react";
import { Avatar, Button, Card, Tag, Spin } from "antd";
import { Pen, User, Mail, Settings, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  getInitials,
  formatFontSize,
  formatPreferenceStatus,
} from "@/src/libs/utils/formatters";

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
            size={96}
            className="bg-primaria text-fundo font-bold text-2xl flex items-center justify-center shrink-0"
          >
            {getInitials(name)}
          </Avatar>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="text-titulo2 font-bold text-secundaria m-0">
              {name}
            </h2>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-texto-secundaria text-paragrafo">
              <Mail size={18} />
              <span>{email}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Cartão de Preferências de Acessibilidade */}
      <Card
        className="shadow-md bg-fundo-secundario border border-fundo"
        title={
          <div className="flex items-center gap-2 text-secundaria font-semibold text-titulo3">
            <Settings size={22} className="text-primaria" />
            Preferências de Acessibilidade
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<Pen size={16} />}
            onClick={() => router.push("/acessibilidade")}
            className="flex items-center gap-1 font-medium"
          >
            Editar
          </Button>
        }
      >
        {preferences ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tamanho da Fonte */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">
                  Tamanho da Fonte
                </h4>
                <p className="text-xs text-texto-secundaria m-0">
                  Escala de texto na interface
                </p>
              </div>
              <Tag
                color="blue"
                className="text-paragrafo py-0.5 px-3 font-semibold"
              >
                {formatFontSize(preferences.font_size)}
              </Tag>
            </div>

            {/* Alto Contraste */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">
                  Modo Alto Contraste
                </h4>
                <p className="text-xs text-texto-secundaria m-0">
                  Aumento de contraste visual
                </p>
              </div>
              <Tag
                color={preferences.contrast_level ? "green" : "default"}
                className="text-paragrafo py-0.5 px-3 font-semibold flex items-center"
              >
                {preferences.contrast_level ? (
                  <CheckCircle2 size={12} className="inline mr-1" />
                ) : (
                  <XCircle size={12} className="inline mr-1" />
                )}
                {formatPreferenceStatus(preferences.contrast_level)}
              </Tag>
            </div>

            {/* Espaçamento das Opções */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">
                  Espaçamento Ampliado
                </h4>
                <p className="text-xs text-texto-secundaria m-0">
                  Aumento na distância entre elementos
                </p>
              </div>
              <Tag
                color={preferences.high_element_spacing ? "green" : "default"}
                className="text-paragrafo py-0.5 px-3 font-semibold flex items-center"
              >
                {preferences.high_element_spacing ? (
                  <CheckCircle2 size={12} className="inline mr-1" />
                ) : (
                  <XCircle size={12} className="inline mr-1" />
                )}
                {formatPreferenceStatus(preferences.high_element_spacing)}
              </Tag>
            </div>

            {/* Tema Escuro */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">
                  Modo Escuro
                </h4>
                <p className="text-xs text-texto-secundaria m-0">
                  Interface em cores escuras
                </p>
              </div>
              <Tag
                color={preferences.ui_mode ? "purple" : "default"}
                className="text-paragrafo py-0.5 px-3 font-semibold flex items-center"
              >
                {preferences.ui_mode ? (
                  <CheckCircle2 size={12} className="inline mr-1" />
                ) : (
                  <XCircle size={12} className="inline mr-1" />
                )}
                {formatPreferenceStatus(preferences.ui_mode)}
              </Tag>
            </div>

            {/* Destaque Visual em Foco */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">
                  Destaque Visual
                </h4>
                <p className="text-xs text-texto-secundaria m-0">
                  Feedback e bordas ao focar botoes
                </p>
              </div>
              <Tag
                color={preferences.visual_feedback ? "green" : "default"}
                icon={
                  preferences.visual_feedback ? (
                    <CheckCircle2 size={12} className="inline mr-1" />
                  ) : (
                    <XCircle size={12} className="inline mr-1" />
                  )
                }
                className="text-paragrafo py-0.5 px-3 font-semibold flex items-center"
              >
                {formatPreferenceStatus(preferences.visual_feedback)}
              </Tag>
            </div>

            {/* Confirmação Extra */}
            <div className="flex justify-between items-center p-4 bg-fundo/40 rounded-lg border border-fundo/50">
              <div>
                <h4 className="font-semibold text-secundaria text-paragrafo m-0">
                  Segurança de Exclusão
                </h4>
                <p className="text-xs text-texto-secundaria m-0">
                  Exigir confirmação antes de apagar itens
                </p>
              </div>
              <Tag
                color={preferences.extra_confirm ? "warning" : "default"}
                className="text-paragrafo py-0.5 px-3 font-semibold"
              >
                {preferences.extra_confirm
                  ? "Confirmação Exigida"
                  : "Direta (Sem confirmação)"}
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
