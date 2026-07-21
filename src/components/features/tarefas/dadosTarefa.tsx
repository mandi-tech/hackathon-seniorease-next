"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Tag, Breadcrumb, Spin, App } from "antd";
import { useRouter, useParams } from "next/navigation";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  HomeOutlined,
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
  const [subtarefas, setSubtarefas] = useState<iTaskStep[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarEstruturaTarefa = useCallback(async () => {
    if (!idTarefa || !user?.id) return;

    setLoading(true);
    try {
      const { data: paiData, error: paiError } = await supabase
        .from("tasks")
        .select("*, categories(name), task_files(*)")
        .eq("id", idTarefa)
        .single();

      if (paiError) throw paiError;
      setTarefaPai(paiData);

      const { data: subData, error: subError } = await supabase
        .from("task_steps")
        .select("*, task_files(*)")
        .eq("task_id", idTarefa)
        .order("step_order", { ascending: true });

      if (subError) throw subError;
      setSubtarefas(subData || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      notification.error({
        title: "Erro ao carregar detalhes",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [idTarefa, user, supabase, notification]);

  useEffect(() => {
    let active = true;
    if (active) {
      carregarEstruturaTarefa();
    }
    return () => {
      active = false;
    };
  }, [carregarEstruturaTarefa]);

  const handleAlternarCheckboxStep = async (
    stepId: string,
    currentStatus: boolean,
  ) => {
    try {
      const { error } = await supabase
        .from("task_steps")
        .update({ is_completed: !currentStatus })
        .eq("id", stepId);

      if (error) throw error;

      setSubtarefas((prev) =>
        prev.map((s) =>
          s.id === stepId ? { ...s, is_completed: !currentStatus } : s,
        ),
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao atualizar passo";
      notification.error({
        title: "Erro na atualização",
        message: msg,
      });
    }
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
      <div className="text-center py-12 text-texto-secundaria">
        Tarefa não encontrada.
      </div>
    );
  }

  const stepAtual = idSubtarefa
    ? subtarefas.find((s) => s.id === idSubtarefa)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          {
            title: <HomeOutlined onClick={() => router.push("/")} />,
            href: "/",
          },
          { title: tarefaPai.title, href: `/tarefas/${tarefaPai.id}` },
          ...(stepAtual ? [{ title: `Etapa: ${stepAtual.instruction}` }] : []),
        ]}
      />

      <div className="bg-fundo-secundario p-6 rounded-2xl border border-fundo shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <div>
            <h1 className="text-titulo1 font-bold text-secundaria m-0">
              {stepAtual ? stepAtual.instruction : tarefaPai.title}
            </h1>
            <p className="text-texto-secundaria text-paragrafo mt-1">
              {stepAtual
                ? `Etapa da tarefa: ${tarefaPai.title}`
                : tarefaPai.description || "Sem descrição registrada."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!stepAtual ? (
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
            ) : (
              <>
                <ModalEtapa
                  idTarefaPai={tarefaPai.id}
                  dadosEdicao={stepAtual}
                  onSuccess={carregarEstruturaTarefa}
                />
                <BotaoExcluir
                  idTarget={stepAtual.id}
                  idTarefaPai={tarefaPai.id}
                  tipo="subtarefa"
                  arquivos={stepAtual.task_files || []}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-paragrafo text-texto-secundaria">
          <div className="flex items-center gap-2">
            <CalendarOutlined />
            <span>Data: {dayjs(tarefaPai.due_date).format("DD/MM/YYYY")}</span>
          </div>
          {tarefaPai.due_date && (
            <div className="flex items-center gap-2">
              <ClockCircleOutlined />
              <span>Hora: {tarefaPai.due_date.substring(0, 5)}</span>
            </div>
          )}
          <Tag color={tarefaPai.is_completed ? "green" : "blue"}>
            {tarefaPai.is_completed ? "Concluída" : "Em Andamento"}
          </Tag>
        </div>

        {!stepAtual && (
          <div className="space-y-4 pt-4 border-t border-fundo">
            <div className="flex justify-between items-center">
              <h2 className="text-titulo2 font-semibold text-secundaria m-0">
                Passos da Tarefa
              </h2>
              <ModalEtapa
                idTarefaPai={tarefaPai.id}
                onSuccess={carregarEstruturaTarefa}
              />
            </div>

            <div className="space-y-3">
              {subtarefas.length > 0 ? (
                subtarefas.map((step, index) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-xl border border-fundo bg-fundo flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primaria">
                        #{index + 1}
                      </span>
                      <p
                        className={`text-paragrafo m-0 ${
                          step.is_completed
                            ? "line-through text-texto-secundaria"
                            : "text-texto"
                        }`}
                      >
                        {step.instruction}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        onClick={() =>
                          handleAlternarCheckboxStep(step.id, step.is_completed)
                        }
                      >
                        {step.is_completed ? "Desmarcar" : "Concluir"}
                      </Button>
                      <Button
                        size="small"
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
