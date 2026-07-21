"use client";

import { useState, useEffect } from "react";
import { Button, Tag, Breadcrumb, Spin, App } from "antd";
import { useRouter, useParams } from "next/navigation";
import {
  ClockCircleOutlined,
  CalendarOutlined,
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

// Instanciado fora do componente para manter referência estável na memória
const supabase = createClient();

export default function DadosTarefa() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
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
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let active = true;

    const carregarEstruturaTarefa = async () => {
      if (!user?.id || !idTarefa) return;

      setLoading(true);
      try {
        const { data: dataPai, error: errPai } = await supabase
          .from("tasks")
          .select("*, categories(name)")
          .eq("id", idTarefa)
          .eq("user_id", user.id)
          .single();

        if (errPai) throw errPai;

        // Ordenamos por 'id' (ou 'updated_at' se preferir) para evitar a coluna inexistente 'created_at'
        const { data: dataSteps, error: errSteps } = await supabase
          .from("task_steps")
          .select("*")
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
            message: "Não foi possível carregar os dados da tarefa.",
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
        message: "Não foi possível alterar o status do passo.",
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
      <div className="text-center py-10">
        <p className="text-texto-secundaria">Tarefa não encontrada.</p>
        <Button onClick={() => router.push("/")}>Voltar para o Início</Button>
      </div>
    );
  }

  const exibiSubtarefaAtual = subtarefas.find((s) => s.id === idSubtarefa);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb / Navegação */}
      <Breadcrumb
        items={[
          {
            title: (
              <span
                onClick={() => router.push("/")}
                className="cursor-pointer flex items-center gap-1"
              >
                <HomeOutlined /> Início
              </span>
            ),
          },
          {
            title: idSubtarefa ? (
              <span
                onClick={() => router.push(`/tarefas/${idTarefa}`)}
                className="cursor-pointer text-primaria"
              >
                {tarefaPai.title}
              </span>
            ) : (
              <span>{tarefaPai.title}</span>
            ),
          },
          ...(idSubtarefa && exibiSubtarefaAtual
            ? [
                {
                  title: (
                    <span>
                      {exibiSubtarefaAtual.instruction.slice(0, 20)}...
                    </span>
                  ),
                },
              ]
            : []),
        ]}
      />

      <div className="bg-fundo-secundario p-6 rounded-2xl border border-fundo shadow-sm space-y-6">
        {/* Cabeçalho da Tarefa */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4 border-fundo">
          <div className="space-y-1">
            <h1 className="text-titulo1 font-bold text-secundaria m-0">
              {tarefaPai.title}
            </h1>
            <p className="text-paragrafo text-texto-secundaria m-0">
              {tarefaPai.description || "Sem descrição"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ModalTarefa
              tipo="tarefa"
              dadosEdicao={tarefaPai}
              onSuccess={recarregarDados}
            />
            <BotaoExcluir idTarget={tarefaPai.id} tipo="tarefa" arquivos={[]} />
          </div>
        </div>

        {/* Informações Complementares */}
        <div className="flex flex-wrap gap-4 text-paragrafo text-texto-secundaria">
          <div className="flex items-center gap-1">
            <CalendarOutlined />
            <span>{dayjs(tarefaPai.due_date).format("DD/MM/YYYY")}</span>
          </div>

          <div className="flex items-center gap-1">
            <ClockCircleOutlined />
            <span>{dayjs(tarefaPai.due_date).format("HH:mm")}</span>
          </div>

          <Tag color={tarefaPai.is_completed ? "green" : "blue"}>
            {tarefaPai.is_completed ? "Concluída" : "Pendente"}
          </Tag>
        </div>

        {/* Seção de Passos/Etapas */}
        {!idSubtarefa && (
          <div className="space-y-4 pt-4 border-t border-fundo">
            <div className="flex items-center justify-between">
              <h2 className="text-titulo2 font-semibold text-secundaria m-0">
                Passos da Tarefa
              </h2>
              <ModalEtapa
                idTarefaPai={tarefaPai.id}
                onSuccess={recarregarDados}
              />
            </div>

            <div className="space-y-2">
              {subtarefas.length > 0 ? (
                subtarefas.map((step) => (
                  <div
                    key={step.id}
                    className="p-3 rounded-xl border border-fundo bg-fundo flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
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
