"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClockCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { App, Spin } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { iTask } from "@/src/libs/types/iTarefa";
import ModalTarefa from "../tarefas/modalTarefa";

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
  const { notification } = App.useApp();

  const [tarefas, setTarefas] = useState<iTask[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarTarefasDoDia = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);

    const dataBase = dataParam ? dayjs(dataParam, "DD-MM-YYYY") : dayjs();

    const inicioDoDia = dataBase.startOf("day").toISOString();
    const fimDoDia = dataBase.endOf("day").toISOString();

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          category:categories(name)
        `,
        )
        .eq("user_id", user.id)
        .gte("due_date", inicioDoDia)
        .lte("due_date", fimDoDia)
        .order("due_date", { ascending: true });

      if (error) throw error;

      setTarefas(data || []);
    } catch (error: unknown) {
      console.error("Erro ao carregar tarefas do dia:", error);
      notification.error({
        title: "Erro ao carregar tarefas",
        description: "Não foi possível carregar as tarefas do dia.",
      });
    } finally {
      setLoading(false);
    }
  }, [user, dataParam, supabase, notification]);

  useEffect(() => {
    if (user?.id) {
      buscarTarefasDoDia();
    }
  }, [user?.id, buscarTarefasDoDia]);

  const dataAlvoStr = dataParam || dayjs().format("DD-MM-YYYY");
  const dataExibicao = dayjs(dataAlvoStr, "DD-MM-YYYY").format(
    "D [de] MMMM [de] YYYY",
  );

  return (
    <section
      className={`bg-fundo-secundario rounded-xl shadow-md p-6 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h2 className="text-titulo2 text-secundaria font-bold capitalize">
              Atividades do Dia
            </h2>
            <p className="text-paragrafo text-texto-secundaria">
              {dataExibicao}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 my-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
              />
            </div>
          ) : tarefas.length > 0 ? (
            tarefas.map((tarefa) => {
              const statusInfo = obterStatusInfo(tarefa);
              const horaFormatada = dayjs(tarefa.due_date).format("HH:mm");
              const nomeCategoria =
                (tarefa.categories?.name as string) || "Sem categoria";

              return (
                <div
                  key={tarefa.id}
                  onClick={() => router.push(`/tarefas/${tarefa.id}`)}
                  className="flex items-center justify-between p-4 bg-fundo/40 rounded-lg border border-fundo hover:border-primaria/50 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-paragrafo font-bold text-secundaria group-hover:text-primaria transition-colors">
                        {tarefa.title}
                      </h3>
                    </div>

                    <p className="text-texto-secundaria text-paragrafo line-clamp-1">
                      {tarefa.description || "Sem descrição adicional"}
                    </p>

                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-texto-secundaria text-paragrafo">
                        <ClockCircleOutlined />
                        <p>{horaFormatada}</p>
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

                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {nomeCategoria}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-texto-secundaria text-paragrafo bg-fundo-secundario/50 border border-dashed rounded-lg p-4">
              Nenhuma tarefa agendada para este dia.
            </div>
          )}
        </div>

        <ModalTarefa tipo="tarefa" onSuccess={buscarTarefasDoDia} />
      </div>
    </section>
  );
}
