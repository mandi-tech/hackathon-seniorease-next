"use client";

import { useState, useEffect } from "react";
import { Button, Tag, Breadcrumb, Spin, App, Checkbox } from "antd";
import { useRouter, useParams } from "next/navigation";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  HomeOutlined,
  PaperClipOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  iTaskStep,
  iMainTask,
  iFileAttachment,
} from "@/src/libs/types/iTarefa";
import ModalTarefa from "./modalTarefa";
import ModalEtapa from "./modalEtapa";
import BotaoExcluir from "./botaoExcluir";

dayjs.locale("pt-br");

const supabase = createClient();

export default function DadosTarefa() {
  const router = useRouter();
  const params = useParams();
  const { user, preferences } = useAuth();
  const { notification } = App.useApp();

  // Obtém a preferência ui_mode diretamente do contexto de autenticação
  const uiMode = !!preferences?.ui_mode;

  const tarefaParams = params?.tarefa;

  // Extrai o ID da tarefa principal e, caso exista, o ID da subtarefa/etapa
  const idTarefa = Array.isArray(tarefaParams) ? tarefaParams[0] : undefined;
  const idSubtarefa =
    Array.isArray(tarefaParams) && tarefaParams.length > 1
      ? tarefaParams[1]
      : undefined;

  const [tarefaPai, setTarefaPai] = useState<iMainTask | null>(null);
  const [subtarefas, setSubtarefas] = useState<iTaskStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let active = true;

    const carregarEstruturaTarefa = async () => {
      if (!user?.id || !idTarefa) return;

      setLoading(true);
      try {
        // 1. Busca a tarefa principal + categorias + seus arquivos anexos
        const { data: dataPai, error: errPai } = await supabase
          .from("tasks")
          .select("*, categories(name), task_files(*)")
          .eq("id", idTarefa)
          .eq("user_id", user.id)
          .single();

        if (errPai) throw errPai;

        // 2. Busca todas as etapas/subtarefas vinculadas + seus arquivos anexos
        const { data: dataSteps, error: errSteps } = await supabase
          .from("task_steps")
          .select("*, task_files(*)")
          .eq("task_id", idTarefa)
          .order("id", { ascending: true });

        if (errSteps) throw errSteps;

        if (active) {
          setTarefaPai(dataPai as iMainTask);
          setSubtarefas((dataSteps as iTaskStep[]) || []);
        }
      } catch (err) {
        if (active) {
          console.error("Erro ao carregar detalhes da tarefa:", err);
          notification.error({
            title: "Erro ao carregar",
            description: "Não foi possível carregar os dados da tarefa.",
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    carregarEstruturaTarefa();

    return () => {
      active = false;
    };
  }, [user?.id, idTarefa, reloadTrigger, notification]);

  const recarregarDados = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  const handleAlternarCheckboxStep = async (
    stepId: string,
    isCompletedAtual: boolean,
  ) => {
    try {
      const { error } = await supabase
        .from("task_steps")
        .update({ is_completed: !isCompletedAtual })
        .eq("id", stepId);

      if (error) throw error;
      recarregarDados();
    } catch (err) {
      console.error("Erro ao alterar status do passo:", err);
      notification.error({
        title: "Erro na atualização",
        description: "Não foi possível alterar o status da etapa.",
      });
    }
  };

  const handleAlternarCheckboxTarefaPai = async (isCompletedAtual: boolean) => {
    if (!tarefaPai) return;
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ is_completed: !isCompletedAtual })
        .eq("id", tarefaPai.id);

      if (error) throw error;
      recarregarDados();
    } catch (err) {
      console.error("Erro ao alterar status da tarefa:", err);
      notification.error({
        title: "Erro na atualização",
        description: "Não foi possível alterar o status da tarefa.",
      });
    }
  };

  // Função auxiliar para obter a URL pública do arquivo no Storage
  const obterUrlArquivo = (filePath: string) => {
    const { data } = supabase.storage
      .from("task-attachments")
      .getPublicUrl(filePath);
    return data?.publicUrl;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!tarefaPai) {
    return (
      <div className="text-center py-10">
        <p className="text-texto-secundaria">Tarefa não encontrada.</p>
        <Button onClick={() => router.push("/")}>Voltar para o Início</Button>
      </div>
    );
  }

  // Identifica se estamos visualizando uma etapa específica
  const subtarefaAtual = subtarefas.find((s) => s.id === idSubtarefa);
  const visualizandoEtapa = Boolean(idSubtarefa && subtarefaAtual);

  // Seleciona quais arquivos exibir de acordo com a visão atual (etapa ou tarefa principal)
  const arquivosExibicao: iFileAttachment[] = visualizandoEtapa
    ? subtarefaAtual?.task_files || []
    : tarefaPai?.task_files || [];

  return (
    <div className="bg-fundo-secundario p-6 rounded-2xl border border-fundo space-y-6!">
      {/* Breadcrumb / Navegação Dinâmica */}
      <Breadcrumb
        className="bg-fundo p-4! rounded-lg text-paragrafo!"
        items={[
          {
            title: (
              <span
                onClick={() => router.push("/")}
                className="cursor-pointer flex items-center gap-1 hover:text-primaria"
              >
                <HomeOutlined /> Início
              </span>
            ),
          },
          {
            title: visualizandoEtapa ? (
              <span
                onClick={() => router.push(`/tarefas/${idTarefa}`)}
                className="cursor-pointer text-primaria hover:underline"
              >
                {tarefaPai.title}
              </span>
            ) : (
              <span className="font-semibold text-secundaria">
                {tarefaPai.title}
              </span>
            ),
          },
          ...(visualizandoEtapa && subtarefaAtual
            ? [
                {
                  title: (
                    <span className="font-semibold text-primaria">
                      Etapa: {subtarefaAtual.instruction.slice(0, 25)}
                      {subtarefaAtual.instruction.length > 25 ? "..." : ""}
                    </span>
                  ),
                },
              ]
            : []),
        ]}
      />

      <div className="space-y-8!">
        {/* Cabeçalho do Item Visualizado (Tarefa ou Etapa) */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4 border-fundo">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-paragrafo font-medium px-2.5 py-1 rounded-md bg-primaria/10 text-primaria uppercase tracking-wider">
                {visualizandoEtapa ? "Etapa / Passo" : "Tarefa Principal"}
              </span>
              {tarefaPai.categories?.name && !visualizandoEtapa && (
                <span className="text-paragrafo! font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
                  {tarefaPai.categories.name}
                </span>
              )}
            </div>

            <h1 className="text-titulo1 font-bold text-secundaria m-0 pt-2">
              {visualizandoEtapa
                ? subtarefaAtual?.instruction
                : tarefaPai.title}
            </h1>

            <p className="text-paragrafo! text-texto-secundaria m-0 pt-1">
              {visualizandoEtapa
                ? "Esta é uma etapa vinculada à tarefa principal."
                : tarefaPai.description || "Sem descrição adicional"}
            </p>
          </div>

          {/* Botões de Ação (Editar e Excluir de acordo com a visualização) */}
          <div className="flex items-center gap-2">
            {visualizandoEtapa && subtarefaAtual ? (
              <>
                <ModalEtapa
                  idTarefaPai={tarefaPai.id}
                  dadosEdicao={subtarefaAtual}
                  onSuccess={recarregarDados}
                />
                <BotaoExcluir
                  idTarget={subtarefaAtual.id}
                  idTarefaPai={tarefaPai.id}
                  tipo="subtarefa"
                  arquivos={subtarefaAtual.task_files || []}
                />
              </>
            ) : (
              <>
                <ModalTarefa
                  tipo="tarefa"
                  dadosEdicao={tarefaPai}
                  onSuccess={recarregarDados}
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

        {/* Informações Complementares e Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-fundo border border-fundo">
          <div className="flex flex-wrap items-center gap-6 text-paragrafo text-texto-secundaria">
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-primaria" />
              <span>{dayjs(tarefaPai.due_date).format("DD/MM/YYYY")}</span>
            </div>

            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-primaria" />
              <span>{dayjs(tarefaPai.due_date).format("HH:mm")}</span>
            </div>

            <Tag
              className="border-0 text-paragrafo! px-3 py-1 rounded-full font-medium"
              color={
                visualizandoEtapa
                  ? subtarefaAtual?.is_completed
                    ? "green"
                    : "blue"
                  : tarefaPai.is_completed
                    ? "green"
                    : dayjs().isAfter(tarefaPai.due_date)
                      ? "red"
                      : "blue"
              }
            >
              {visualizandoEtapa
                ? subtarefaAtual?.is_completed
                  ? "Concluída"
                  : "Pendente"
                : tarefaPai.is_completed
                  ? "Concluída"
                  : dayjs().isAfter(tarefaPai.due_date)
                    ? "Em atraso"
                    : "Pendente"}
            </Tag>
          </div>

          {/* Alternância dinâmica entre Checkbox e Botão conforme ui_mode */}
          {visualizandoEtapa && subtarefaAtual ? (
            uiMode ? (
              <Checkbox
                checked={subtarefaAtual.is_completed}
                onChange={() =>
                  handleAlternarCheckboxStep(
                    subtarefaAtual.id,
                    subtarefaAtual.is_completed,
                  )
                }
                className="text-paragrafo font-medium"
              >
                Concluído
              </Checkbox>
            ) : (
              <Button
                type={subtarefaAtual.is_completed ? "default" : "primary"}
                onClick={() =>
                  handleAlternarCheckboxStep(
                    subtarefaAtual.id,
                    subtarefaAtual.is_completed,
                  )
                }
                className="text-paragrafo!"
              >
                {subtarefaAtual.is_completed
                  ? "Marcar como Pendente"
                  : "Concluir Etapa"}
              </Button>
            )
          ) : uiMode ? (
            <Checkbox
              checked={tarefaPai.is_completed}
              onChange={() =>
                handleAlternarCheckboxTarefaPai(tarefaPai.is_completed)
              }
              className="text-paragrafo font-medium"
            >
              Concluído
            </Checkbox>
          ) : (
            <Button
              type={tarefaPai.is_completed ? "default" : "primary"}
              onClick={() =>
                handleAlternarCheckboxTarefaPai(tarefaPai.is_completed)
              }
              className="text-paragrafo!"
            >
              {tarefaPai.is_completed
                ? "Marcar como Pendente"
                : "Concluir Tarefa"}
            </Button>
          )}
        </div>

        {/* --- SEÇÃO DE ARQUIVOS VINCULADOS --- */}
        <div className="space-y-3 pt-2">
          <h2 className="text-titulo3 font-semibold text-secundaria flex items-center gap-2 m-0">
            <PaperClipOutlined className="text-primaria" />
            Arquivos Anexados ({arquivosExibicao.length})
          </h2>

          {arquivosExibicao.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {arquivosExibicao.map((arquivo) => {
                const url = obterUrlArquivo(arquivo.file_path);
                return (
                  <Button
                    key={arquivo.id}
                    icon={<FileTextOutlined />}
                    type="default"
                    className="flex items-center gap-2 h-auto py-2 px-3 border-fundo bg-fundo hover:border-primaria"
                    onClick={() => {
                      if (url) {
                        window.open(url, "_blank", "noopener,noreferrer");
                      } else {
                        notification.error({
                          title: "Erro ao abrir arquivo",
                          description: "Não foi possível gerar a URL do anexo.",
                        });
                      }
                    }}
                  >
                    <span className="font-medium text-texto text-paragrafo max-w-xs truncate">
                      {arquivo.file_name}
                    </span>
                    <EyeOutlined className="text-primaria ml-1" />
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-texto-secundaria text-paragrafo italic m-0">
              Nenhum arquivo anexado a esta{" "}
              {visualizandoEtapa ? "etapa" : "tarefa"}.
            </p>
          )}
        </div>

        {/* Exibe a lista de Passos Apenas quando estiver na visão da Tarefa Principal */}
        {!visualizandoEtapa && (
          <div className="space-y-4 pt-4 border-t border-fundo">
            <div className="flex items-center justify-between">
              <h2 className="text-titulo2 font-semibold text-secundaria m-0">
                Passos da Tarefa ({subtarefas.length})
              </h2>
              <ModalEtapa
                idTarefaPai={tarefaPai.id}
                onSuccess={recarregarDados}
              />
            </div>

            <div className="space-y-2">
              {subtarefas.length > 0 ? (
                subtarefas.map((step, index) => (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-xl border border-fundo bg-fundo flex items-center justify-between gap-3 hover:border-primaria/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-paragrafo font-bold w-8 h-8 rounded-full bg-primaria/10 text-primaria flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <p
                          className={`text-paragrafo m-0 font-medium ${
                            step.is_completed
                              ? "line-through text-texto-secundaria"
                              : "text-texto"
                          }`}
                        >
                          {step.instruction}
                        </p>
                        {step.task_files && step.task_files.length > 0 && (
                          <span className="text-paragrafo text-texto-secundaria flex items-center gap-1 mt-1">
                            <PaperClipOutlined /> {step.task_files.length}{" "}
                            {step.task_files.length === 1 ? "anexo" : "anexos"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {uiMode ? (
                        <Checkbox
                          checked={step.is_completed}
                          onChange={() =>
                            handleAlternarCheckboxStep(
                              step.id,
                              step.is_completed,
                            )
                          }
                          className="text-paragrafo font-medium"
                        >
                          Concluído
                        </Checkbox>
                      ) : (
                        <Button
                          size="medium"
                          onClick={() =>
                            handleAlternarCheckboxStep(
                              step.id,
                              step.is_completed,
                            )
                          }
                          className={`text-paragrafo! ${
                            step.is_completed ? "text-alerta!" : "text-sucesso!"
                          }`}
                        >
                          {step.is_completed
                            ? "Marcar como pendente"
                            : "Concluir Etapa"}
                        </Button>
                      )}
                      <Button
                        size="medium"
                        className="text-paragrafo!"
                        type="link"
                        onClick={() =>
                          router.push(`/tarefas/${idTarefa}/${step.id}`)
                        }
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))
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
