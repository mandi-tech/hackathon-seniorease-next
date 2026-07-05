"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClockCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Spin, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import ModalTarefa from "../tarefas/modalTarefa";

dayjs.locale("pt-br");

export interface iListaTarefasProps {
  className?: string;
}

// Interfaces baseadas na modelagem do seu banco de dados
interface iTask {
  id: string;
  title: string;
  description: string;
  due_date: string;
  is_completed: boolean;
  category_id: string;
  categories?: {
    name: string;
  } | null;
}

// Configuração visual estática para mapear o status com base no booleano e tempo
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

  // Estados locais para dados e controle de loading
  const [tarefas, setTarefas] = useState<iTask[]>([]);
  const [loading, setLoading] = useState(false);

  // Define a data alvo baseando-se no parâmetro da URL ou no dia de hoje
  const dataAlvoStr = dataParam || dayjs().format("DD-MM-YYYY");
  const dataObjeto = dayjs(dataAlvoStr, "DD-MM-YYYY").isValid()
    ? dayjs(dataAlvoStr, "DD-MM-YYYY")
    : dayjs();

  // Função isolada para buscar as tarefas do dia específico no banco
  const buscarTarefasDoDia = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Define o primeiro e o último milissegundo do dia selecionado
      const inicioDoDia = dataObjeto.startOf("day").toISOString();
      const fimDoDia = dataObjeto.endOf("day").toISOString();

      // Busca as tarefas daquele dia trazendo junto o nome da categoria (JOIN implicit)
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          categories ( name )
        `,
        )
        .eq("user_id", user.id)
        .gte("due_date", inicioDoDia)
        .lte("due_date", fimDoDia)
        .order("due_date", { ascending: true });

      if (error) throw error;

      setTarefas(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar tarefas do dia:", error);
      message.error("Não foi possível carregar a agenda deste dia.");
    } finally {
      setLoading(false);
    }
  };

  // Dispara a busca sempre que o dia mudar na URL ou o usuário logar
  useEffect(() => {
    buscarTarefasDoDia();
  }, [dataParam, user]);

  const obtenerDataFormatada = () => {
    const dataFormatada = dataObjeto.format("dddd, DD [de] MMMM [de] YYYY");
    return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  };

  return (
    <section className={className}>
      <h1 className="text-primaria text-titulo1 font-semibold mb-4">
        Agenda do dia
      </h1>
      <div className="min-h-[80vh] flex flex-col gap-8 justify-between relative">
        <div className="flex pb-2 flex-col gap-5 overflow-y-auto min-h-[fit-content]">
          <p className="text-paragrafo font-bold">{obtenerDataFormatada()}</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
              />
            </div>
          ) : tarefas.length > 0 ? (
            tarefas.map((tarefa) => {
              const statusInfo = obterStatusInfo(tarefa);
              const horaFormatada = dayjs(tarefa.due_date).format("HH:mm");
              const nomeCategoria = tarefa.categories?.name || "Sem categoria";

              return (
                <div
                  key={tarefa.id}
                  className="bg-fundo-secundario border-l-4 p-3 rounded-lg shadow-md flex gap-3 relative overflow-hidden items-start"
                  style={{
                    borderLeftColor: statusInfo.color,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    router.push(`/tarefas/${tarefa.id}`);
                  }}
                >
                  {/* Ícone ou Identificador visual da Categoria */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primaria/10 shrink-0 text-primaria font-bold text-center text-xs">
                    {nomeCategoria.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-secundaria text-titulo3 font-semibold truncate">
                      {tarefa.title}
                    </h2>

                    <p className="text-texto-secundaria text-paragrafo truncate">
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

        {/* Repassamos a função de buscarTarefasDoDia no onSuccess para atualizar dinamicamente a lista */}
        <ModalTarefa tipo="tarefa" onSuccess={buscarTarefasDoDia} />
      </div>
    </section>
  );
}
