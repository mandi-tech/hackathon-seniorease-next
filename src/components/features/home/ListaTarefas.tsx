"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/pt-br";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { iTask } from "@/src/libs/types/iTarefa";
import ModalTarefa from "../tarefas/modalTarefa";

dayjs.extend(customParseFormat);
dayjs.locale("pt-br");

export interface iListaTarefasProps {
  className?: string;
}

const obterStatusInfo = (tarefa: iTask) => {
  if (tarefa.is_completed) {
    return { label: "Concluída", color: "#10b981" };
  }

  const hoje = dayjs();
  const dataVencimento = dayjs(tarefa.due_date);

  if (dataVencimento.isBefore(hoje, "day")) {
    return { label: "Em Atraso", color: "#ef4444" };
  }

  return { label: "Pendente", color: "#2563eb" };
};

export default function ListaTarefas({ className }: iListaTarefasProps) {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [tasks, setTasks] = useState<iTask[]>([]);
  const [loading, setLoading] = useState(false);

  // Parse correto da data recebida no parâmetro
  const dataObjeto = dataParam ? dayjs(dataParam, "DD-MM-YYYY") : dayjs();

  const dataAlvoStr = dataObjeto.isValid()
    ? dataObjeto.format("YYYY-MM-DD")
    : dayjs().format("YYYY-MM-DD");

  const buscarTarefasDoDia = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Coobre todo o dia do início ao fim (previne divergências de horário/timestamp)
      const inicioDia = `${dataAlvoStr}T00:00:00`;
      const fimDia = `${dataAlvoStr}T23:59:59`;

      const { data, error } = await supabase
        .from("tasks")
        .select("*, categories(name)")
        .eq("user_id", user.id)
        .gte("due_date", inicioDia)
        .lte("due_date", fimDia)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Erro ao carregar tarefas do dia:", err);
    } finally {
      setLoading(false);
    }
  }, [user, dataAlvoStr, supabase]);

  useEffect(() => {
    buscarTarefasDoDia();
  }, [buscarTarefasDoDia]);

  // Exibição amigável para a interface (ex: 09-07-2026 ou 09/07/2026)
  const dataExibicao = dataObjeto.isValid()
    ? dataObjeto.format("DD/MM/YYYY")
    : dayjs().format("DD/MM/YYYY");

  return (
    <section className={className}>
      <div className="bg-fundo-secundario p-4 sm:p-6 rounded-2xl border border-fundo shadow-sm flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-fundo-secundario">
            <h2 className="text-titulo2 font-semibold text-secundaria m-0">
              Tarefas de {dataExibicao}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((tarefa) => {
                  const statusInfo = obterStatusInfo(tarefa);
                  const horaFormatada = tarefa.due_date
                    ? dayjs(tarefa.due_date).format("HH:mm")
                    : "Sem hora";
                  const nomeCategoria =
                    (tarefa as iTask & { categories?: { name: string } })
                      .categories?.name || "Sem categoria";

                  return (
                    <div
                      key={tarefa.id}
                      onClick={() => router.push(`/tarefas/${tarefa.id}`)}
                      className="p-4 rounded-xl border border-fundo bg-fundo hover:border-primaria/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <h3
                          className={`text-titulo3 font-medium m-0 ${
                            tarefa.is_completed
                              ? "line-through text-texto-secundaria"
                              : "text-secundaria"
                          }`}
                        >
                          {tarefa.title}
                        </h3>
                        <p className="text-paragrafo text-texto-secundaria line-clamp-1 m-0">
                          {tarefa.description || "Sem descrição adicional"}
                        </p>

                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-texto-secundaria text-paragrafo">
                            <ClockCircleOutlined />
                            <span>{horaFormatada}</span>
                          </div>

                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${statusInfo.color}15`,
                              color: statusInfo.color,
                            }}
                          >
                            {statusInfo.label}
                          </span>

                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-fundo-secundario text-texto-secundaria border border-fundo">
                            {nomeCategoria}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-texto-secundaria text-paragrafo bg-fundo/40 border border-dashed rounded-lg p-4">
                  Nenhuma tarefa agendada para este dia.
                </div>
              )}
            </div>
          )}
        </div>

        <ModalTarefa tipo="tarefa" onSuccess={buscarTarefasDoDia} />
      </div>
    </section>
  );
}
