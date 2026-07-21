"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Checkbox, Tag, Breadcrumb, Spin, App } from "antd";
import { useRouter, useParams } from "next/navigation";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  HomeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { iTaskStep, iMainTask } from "@/src/libs/types/iTarefa";
import ModalTarefa from "./modalTarefa";
import ModalEtapa from "./modalEtapa";
import BotaoExcluir from "./botaoExcluir";

dayjs.locale("pt-br");

export default function DadosTarefa() {
  const router = useRouter();
  const params = useParams();
  const { user, preferences } = useAuth();
  const supabase = createClient();
  const { notification } = App.useApp();

  const tarefaParams = params?.tarefa;

  const idTarefa = Array.isArray(tarefaParams) ? tarefaParams[0] : undefined;
  const idSubtarefa =
    Array.isArray(tarefaParams) && tarefaParams.length > 1
      ? tarefaParams[1]
      : undefined;

  const [tarefaPai, setTarefaPai] = useState<iMainTask | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarEstruturaTarefa = useCallback(async () => {
    if (!idTarefa || !user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          task_steps (*),
          task_files (*)
        `,
        )
        .eq("id", idTarefa)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        if (data.task_steps) {
          data.task_steps.sort(
            (a: iTaskStep, b: iTaskStep) => a.step_order - b.step_order,
          );
        }

        if (idSubtarefa) {
          const { data: filesStep, error: filesStepErr } = await supabase
            .from("task_files")
            .select("*")
            .eq("step_id", idSubtarefa);

          if (!filesStepErr && filesStep && data.task_steps) {
            data.task_steps = data.task_steps.map((step: iTaskStep) =>
              step.id === idSubtarefa
                ? { ...step, task_files: filesStep }
                : step,
            );
          }
        }

        setTarefaPai(data);
      }
    } catch (error: unknown) {
      console.error("Erro ao carregar detalhes da tarefa:", error);
      notification.error({
        title: "Erro ao carregar detalhes da tarefa",
        description: "Não foi possível encontrar a atividade solicitada.",
      });
    } finally {
      setLoading(false);
    }
  }, [idTarefa, idSubtarefa, user?.id, supabase, notification]);

  useEffect(() => {
    if (user?.id && idTarefa) {
      carregarEstruturaTarefa();
    }
  }, [user?.id, idTarefa, carregarEstruturaTarefa]);

  const handleAlternarCheckboxTarefa = async (novaStatus: boolean) => {
    if (!tarefaPai) return;
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ is_completed: novaStatus })
        .eq("id", tarefaPai.id);

      if (error) throw error;

      setTarefaPai((prev) =>
        prev ? { ...prev, is_completed: novaStatus } : null,
      );

      notification.success({
        title: "Atualizado!",
        description: `Tarefa marcada como ${
          novaStatus ? "concluída" : "pendente"
        }.`,
      });
    } catch (error: unknown) {
      console.error("Erro ao atualizar status:", error);
      notification.error({
        title: "Erro ao atualizar status",
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const handleAlternarCheckboxStep = async (
    stepId: string,
    novaStatus: boolean,
  ) => {
    try {
      const { error } = await supabase
        .from("task_steps")
        .update({ is_completed: novaStatus })
        .eq("id", stepId);

      if (error) throw error;

      setTarefaPai((prev) => {
        if (!prev || !prev.task_steps) return prev;
        return {
          ...prev,
          task_steps: prev.task_steps.map((s) =>
            s.id === stepId ? { ...s, is_completed: novaStatus } : s,
          ),
        };
      });

      notification.success({
        title: "Passo atualizado!",
        description: `O passo foi marcado como ${
          novaStatus ? "concluído" : "pendente"
        }.`,
      });
    } catch (error: unknown) {
      console.error("Erro ao atualizar passo:", error);
      notification.error({
        title: "Erro ao atualizar passo",
        description: "Tente novamente mais tarde.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    );
  }

  if (!tarefaPai) {
    return (
      <div className="p-8 text-center text-texto-secundaria">
        Tarefa não encontrada ou sem permissão de acesso.
      </div>
    );
  }

  const subtarefaAtiva = idSubtarefa
    ? tarefaPai.task_steps?.find((s) => s.id === idSubtarefa)
    : null;

  const arquivosGeraisTarefa =
    tarefaPai.task_files?.filter((f) => !f.step_id) || [];

  const statusTextoPai = tarefaPai.is_completed
    ? "Concluída"
    : dayjs(tarefaPai.due_date).isBefore(dayjs(), "day")
      ? "Em Atraso"
      : "Pendente";

  const statusCorPai = tarefaPai.is_completed
    ? "success"
    : dayjs(tarefaPai.due_date).isBefore(dayjs(), "day")
      ? "error"
      : "processing";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            href: "/",
            title: (
              <span className="flex items-center gap-1 text-paragrafo text-texto">
                <HomeOutlined /> Início
              </span>
            ),
          },
          {
            href: `/tarefas/${tarefaPai.id}`,
            title: (
              <span className="text-paragrafo text-texto font-medium">
                {tarefaPai.title}
              </span>
            ),
          },
          ...(subtarefaAtiva
            ? [
                {
                  title: (
                    <span className="text-paragrafo text-primaria font-semibold">
                      Detalhes do Passo
                    </span>
                  ),
                },
              ]
            : []),
        ]}
      />

      <div className="bg-fundo-secundario rounded-xl p-6 md:p-8 shadow-md border border-fundo space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-titulo1 font-bold text-secundaria m-0">
                {subtarefaAtiva ? subtarefaAtiva.instruction : tarefaPai.title}
              </h1>
              <Tag color={statusCorPai} className="text-paragrafo px-3 py-1">
                {statusTextoPai}
              </Tag>
            </div>

            <div className="flex items-center gap-4 text-paragrafo text-texto-secundaria">
              <div className="flex items-center gap-1">
                <CalendarOutlined />
                <span>
                  {dayjs(tarefaPai.due_date).format("DD [de] MMMM [de] YYYY")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ClockCircleOutlined />
                <span>{dayjs(tarefaPai.due_date).format("HH:mm")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {subtarefaAtiva ? (
              <>
                <ModalEtapa
                  idTarefaPai={tarefaPai.id}
                  dadosEdicao={subtarefaAtiva}
                  onSuccess={carregarEstruturaTarefa}
                />
                <BotaoExcluir
                  idTarget={subtarefaAtiva.id}
                  idTarefaPai={tarefaPai.id}
                  tipo="subtarefa"
                  arquivos={subtarefaAtiva.task_files || []}
                />
              </>
            ) : (
              <>
                <ModalTarefa
                  tipo="tarefa"
                  dadosEdicao={tarefaPai}
                  onSuccess={carregarEstruturaTarefa}
                />
                <BotaoExcluir
                  idTarget={tarefaPai.id}
                  tipo="tarefa"
                  arquivos={tarefaPai.task_files || []}
                />
              </>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-3">
          <h2 className="text-titulo3 font-semibold text-secundaria m-0">
            {subtarefaAtiva ? "Instruções do Passo" : "Descrição da Tarefa"}
          </h2>
          <p className="text-paragrafo text-texto whitespace-pre-line leading-relaxed bg-fundo/30 p-4 rounded-lg border border-fundo">
            {subtarefaAtiva
              ? subtarefaAtiva.instruction
              : tarefaPai.description || "Nenhuma descrição informada."}
          </p>
        </div>

        {/* Ações rápidas de Conclusão */}
        {!subtarefaAtiva && (
          <div className="bg-fundo/20 p-4 rounded-lg border flex items-center justify-between">
            <span className="text-paragrafo font-medium text-secundaria">
              Status Geral da Tarefa:
            </span>
            <Checkbox
              checked={tarefaPai.is_completed}
              onChange={(e) => handleAlternarCheckboxTarefa(e.target.checked)}
              className="text-paragrafo font-semibold text-texto"
            >
              Marcar como Concluída
            </Checkbox>
          </div>
        )}

        {/* Anexos */}
        <div className="space-y-4">
          <h2 className="text-titulo3 font-semibold text-secundaria m-0 flex items-center gap-2">
            <FileTextOutlined className="text-primaria" /> Documentos Anexados
          </h2>

          {(() => {
            const listaExibição = subtarefaAtiva
              ? subtarefaAtiva.task_files || []
              : arquivosGeraisTarefa;

            if (listaExibição.length === 0) {
              return (
                <p className="text-texto-secundaria text-paragrafo italic">
                  Nenhum arquivo anexado a este item.
                </p>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listaExibição.map((arq) => (
                  <a
                    key={arq.id}
                    href={arq.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-fundo/40 rounded-lg border hover:border-primaria transition-colors group"
                  >
                    <FileTextOutlined className="text-xl text-primaria group-hover:scale-110 transition-transform" />
                    <div className="truncate flex-1">
                      <p className="text-paragrafo font-medium text-secundaria truncate m-0">
                        {arq.file_name}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Lista de Etapas/Subtarefas */}
        {!subtarefaAtiva && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h2 className="text-titulo2 font-bold text-secundaria m-0">
                Passos para Execução
              </h2>
              <ModalEtapa
                idTarefaPai={tarefaPai.id}
                onSuccess={carregarEstruturaTarefa}
              />
            </div>

            <div className="space-y-3">
              {tarefaPai.task_steps && tarefaPai.task_steps.length > 0 ? (
                tarefaPai.task_steps.map((step, idx) => {
                  return (
                    <div
                      key={step.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-fundo/40 rounded-lg border gap-4"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="font-bold text-primaria text-paragrafo">
                          #{idx + 1}
                        </span>
                        <div>
                          <p
                            className={`text-paragrafo font-medium m-0 ${
                              step.is_completed
                                ? "line-through text-texto-secundaria"
                                : "text-secundaria"
                            }`}
                          >
                            {step.instruction}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {preferences?.extra_confirm ? (
                          <Checkbox
                            checked={step.is_completed}
                            onChange={(e) =>
                              handleAlternarCheckboxStep(
                                step.id,
                                e.target.checked,
                              )
                            }
                          >
                            Concluído
                          </Checkbox>
                        ) : (
                          <Button
                            onClick={() =>
                              handleAlternarCheckboxStep(
                                step.id,
                                !step.is_completed,
                              )
                            }
                            className="w-full"
                            size="large"
                            variant="outlined"
                            color={step.is_completed ? "red" : "green"}
                          >
                            {step.is_completed
                              ? "Tirar de Concluída"
                              : "Concluir"}
                          </Button>
                        )}

                        <Button
                          className="text-primaria! text-paragrafo! border! border-primaria!"
                          onClick={() =>
                            router.push(`/tarefas/${idTarefa}/${step.id}`)
                          }
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-texto-secundaria text-paragrafo italic bg-fundo/10 p-4 rounded-lg text-center">
                  Nenhum passo cadastrado. Adicione passos acima para facilitar
                  a execução da tarefa.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
