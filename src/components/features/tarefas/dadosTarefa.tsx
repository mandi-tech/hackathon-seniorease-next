"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Tag,
  message,
  Breadcrumb,
  Spin,
  Modal,
  App,
} from "antd";
import { useRouter, useParams } from "next/navigation";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  HomeOutlined,
  LoadingOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  iFileAttachment,
  iTaskStep,
  iMainTask,
} from "@/src/libs/types/iTarefa";
import ModalTarefa from "./modalTarefa";
import ModalEtapa from "./modalEtapa";
import BotaoExcluir from "./botaoExcluir";

dayjs.locale("pt-br");

export default function DadosTarefa() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
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

  const modoSubtarefa = !!idSubtarefa;

  const carregarEstruturaTarefa = async () => {
    if (!idTarefa || !user) return;

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
    } catch (error: any) {
      console.error("Erro ao carregar detalhes da tarefa:", error);
      notification.error({
        title: "Erro ao carregar detalhes da tarefa",
        message: "Não foi possível encontrar a atividade solicitada.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEstruturaTarefa();
  }, [idTarefa, idSubtarefa, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    );
  }

  if (!tarefaPai) {
    return (
      <div className="p-6 text-center bg-fundo-secundario rounded-xl shadow-md">
        <h1 className="text-titulo1 text-primaria font-semibold mb-4">
          Item não encontrado
        </h1>
        <Button type="primary" onClick={() => router.push("/")}>
          Voltar para a Agenda
        </Button>
      </div>
    );
  }

  const subtarefaSelecionada = tarefaPai.task_steps?.find(
    (s) => s.id === idSubtarefa,
  );

  const infoExibida = {
    titulo:
      modoSubtarefa && subtarefaSelecionada
        ? subtarefaSelecionada.instruction
        : tarefaPai.title,
    descricao:
      modoSubtarefa && subtarefaSelecionada ? "" : tarefaPai.description,
    is_completed:
      modoSubtarefa && subtarefaSelecionada
        ? subtarefaSelecionada.is_completed
        : tarefaPai.is_completed,
    arquivos:
      modoSubtarefa && subtarefaSelecionada
        ? subtarefaSelecionada.task_files || []
        : tarefaPai.task_files || [],
    data: dayjs(tarefaPai.due_date).format("DD/MM/YYYY"),
    hora: dayjs(tarefaPai.due_date).format("HH:mm"),
  };

  const obterStatusTag = () => {
    if (infoExibida.is_completed)
      return { label: "Concluída", color: "#10b981" };
    if (!modoSubtarefa && dayjs(tarefaPai.due_date).isBefore(dayjs(), "day")) {
      return { label: "Em Atraso", color: "#ef4444" };
    }
    return { label: "Pendente", color: "#2563eb" };
  };

  const statusInfo = obterStatusTag();

  const handleAlternarCheckboxStep = async (
    stepId: string,
    checked: boolean,
  ) => {
    try {
      const { error } = await supabase
        .from("task_steps")
        .update({ is_completed: checked, updated_at: new Date().toISOString() })
        .eq("id", stepId);

      if (error) throw error;

      if (tarefaPai.task_steps) {
        const novosSteps = tarefaPai.task_steps.map((sub) =>
          sub.id === stepId ? { ...sub, is_completed: checked } : sub,
        );
        setTarefaPai({ ...tarefaPai, task_steps: novosSteps });
      }
      notification.success({
        title: "Sucesso!",
        description: "Progresso do passo atualizado!",
      });
    } catch (error) {
      console.error(error);
      notification.error({
        title: "Erro ao atualizar",
        description: "Erro ao atualizar o status do passo.",
      });
    }
  };

  const handleAlternarConclusaoPrincipal = async (checked: boolean) => {
    if (!tarefaPai) return;

    try {
      if (modoSubtarefa && idSubtarefa) {
        const { error } = await supabase
          .from("task_steps")
          .update({ is_completed: checked, updated_at: new Date().toISOString() })
          .eq("id", idSubtarefa);

        if (error) throw error;

        if (tarefaPai.task_steps) {
          const novosSteps = tarefaPai.task_steps.map((sub) =>
            sub.id === idSubtarefa ? { ...sub, is_completed: checked } : sub,
          );
          setTarefaPai({ ...tarefaPai, task_steps: novosSteps });
        }
      } else if (idTarefa) {
        const { error } = await supabase
          .from("tasks")
          .update({ is_completed: checked })
          .eq("id", idTarefa);

        if (error) throw error;

        setTarefaPai({ ...tarefaPai, is_completed: checked });
      }

      notification.success({
        title: "Sucesso!",
        description: "Status de conclusão atualizado!",
      });
    } catch (error) {
      console.error(error);
      notification.error({
        title: "Erro ao atualizar",
        description: "Não foi possível alterar o status de conclusão.",
      });
    }
  };

  const itensBreadcrumb = [
    {
      title: (
        <span
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center gap-1 hover:text-primaria"
        >
          <HomeOutlined /> Agenda
        </span>
      ),
    },
    {
      title: modoSubtarefa ? (
        <span
          onClick={() => router.push(`/tarefas/${idTarefa}`)}
          className="cursor-pointer hover:text-primaria"
        >
          {tarefaPai.title}
        </span>
      ) : (
        <span className="text-texto-secundaria font-semibold">
          {tarefaPai.title}
        </span>
      ),
    },
  ];

  if (modoSubtarefa && subtarefaSelecionada) {
    itensBreadcrumb.push({
      title: (
        <span className="text-texto-secundaria font-semibold">
          Passo {subtarefaSelecionada.step_order}
        </span>
      ),
    });
  }

  return (
    <div className="p-4 sm:p-6 bg-fundo-secundario rounded-xl shadow-md">
      <div className="mb-6 bg-fundo/40 p-2.5 rounded-lg border border-fundo">
        <Breadcrumb
          items={itensBreadcrumb}
          style={{ fontSize: "var(--text-paragrafo)" }}
        />
      </div>

      {/* Cabeçalho de Dados */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 mb-5">
        <div>
          {modoSubtarefa && (
            <span className="text-primaria text-xs font-bold uppercase tracking-wider block mb-1">
              Passo de: {tarefaPai.title}
            </span>
          )}
          <div className="flex items-center gap-4">
            <Checkbox
              checked={infoExibida.is_completed}
              onChange={(e) => handleAlternarConclusaoPrincipal(e.target.checked)}
              className="scale-150 mr-2"
            />
            <h1 className="text-secundaria text-titulo1 font-bold leading-tight m-0">
              {infoExibida.titulo}
            </h1>
            <Tag
              style={{
                backgroundColor: `${statusInfo.color}15`,
                color: statusInfo.color,
                borderColor: statusInfo.color,
                fontSize: "var(--text-paragrafo)",
                padding: "4px 12px",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              {statusInfo.label}
            </Tag>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-texto-secundaria text-paragrafo">
            <span className="flex items-center gap-1">
              <CalendarOutlined /> {infoExibida.data}
            </span>
            <span className="flex items-center gap-1">
              <ClockCircleOutlined /> {infoExibida.hora}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          {modoSubtarefa ? (
            <ModalEtapa
              idTarefaPai={tarefaPai.id}
              onSuccess={carregarEstruturaTarefa}
              dadosEdicao={tarefaPai}
            />
          ) : (
            <ModalTarefa
              tipo="tarefa"
              onSuccess={carregarEstruturaTarefa}
              dadosEdicao={tarefaPai}
            />
          )}

          <BotaoExcluir
            tipo={modoSubtarefa ? "subtarefa" : "tarefa"}
            idTarget={modoSubtarefa ? idSubtarefa! : idTarefa!}
            idTarefaPai={idTarefa}
            arquivos={infoExibida.arquivos}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Seção de Descrição (Apenas se houver ou se for a tarefa raiz) */}
        {!modoSubtarefa && (
          <div>
            <h2 className="text-secundaria text-titulo3 font-semibold mb-2">
              Descrição da Tarefa
            </h2>
            <p className="text-texto-secundaria text-paragrafo bg-fundo/50 p-4 rounded-lg border border-fundo whitespace-pre-line">
              {infoExibida.descricao ||
                "Esta tarefa não possui uma descrição longa informada."}
            </p>
          </div>
        )}

        {/* Exibição Relacional dos Anexos do Banco via bucket Storage */}
        {infoExibida.arquivos.length > 0 && (
          <div>
            <h2 className="text-secundaria text-titulo3 font-semibold mb-2">
              Documentos Anexados
            </h2>
            <div className="flex flex-wrap gap-3">
              {infoExibida.arquivos.map((file) => (
                <a
                  key={file.id}
                  href={`${supabase.storage.from("task-attachments").getPublicUrl(file.file_path).data.publicUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-fundo/50 rounded-lg border border-fundo text-paragrafo hover:border-primaria transition-colors"
                >
                  <FileTextOutlined className="text-primaria text-titulo3" />
                  <span className="text-texto-secundaria font-medium">
                    {file.file_name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Passos/Subtarefas (Renderizada unicamente na visualização da Task pai) */}
        {!modoSubtarefa && (
          <div className="flex flex-col gap-4 border-t pt-4">
            <h2 className="text-secundaria text-titulo3 font-semibold">
              Passos e Subtarefas
            </h2>

            <div className="flex flex-col justify-end">
              <ModalEtapa
                idTarefaPai={tarefaPai.id}
                onSuccess={carregarEstruturaTarefa}
              />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {tarefaPai.task_steps && tarefaPai.task_steps.length > 0 ? (
                tarefaPai.task_steps.map((step) => {
                  return (
                    <div
                      key={step.id}
                      className="flex items-center justify-between p-3 bg-fundo/30 border rounded-lg hover:bg-fundo/60 transition-colors"
                    >
                      <Checkbox
                        checked={step.is_completed}
                        onChange={(e) =>
                          handleAlternarCheckboxStep(step.id, e.target.checked)
                        }
                        className="text-paragrafo! text-secundaria font-medium [&_.ant-checkbox-inner]:w-5 [&_.ant-checkbox-inner]:h-5"
                      >
                        <span
                          className={
                            step.is_completed
                              ? "line-through text-texto-secundaria/50 font-normal"
                              : ""
                          }
                        >
                          {step.instruction}
                        </span>
                      </Checkbox>

                      <div className="flex items-center gap-3 ml-auto">
                        <span className="text-paragrafo text-texto-secundaria bg-fundo px-2 py-1 rounded">
                          Ordem: {step.step_order}
                        </span>

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
