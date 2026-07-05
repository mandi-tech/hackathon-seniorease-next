"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar, Button, Spin, message } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";

dayjs.locale("pt-br");

export interface iCalendarioProps {
  className?: string;
}

const listaStatus = [
  { value: "pendente", color: "#2563eb" },
  { value: "em_andamento", color: "#f59e0b" },
  { value: "concluida", color: "#10b981" },
  { value: "em_atraso", color: "#ef4444" },
];
interface iTask {
  id: string;
  title: string;
  description: string;
  due_date: string;
  is_completed: boolean;
  category_id: string;
}

export default function Calendario({ className }: iCalendarioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();

  const [tasks, setTasks] = useState<iTask[]>([]);
  const [loading, setLoading] = useState(false);

  const [value, setValue] = useState(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsedDate = dayjs(dataParam, "DD-MM-YYYY");
      if (parsedDate.isValid()) return parsedDate;
    }
    return dayjs();
  });

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsedDate = dayjs(dataParam, "DD-MM-YYYY");
      if (parsedDate.isValid() && !parsedDate.isSame(value, "day")) {
        setValue(parsedDate);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    async function buscarTarefasDoMes() {
      if (!user) return;

      setLoading(true);
      try {
        const primeiroDiaDoMes = value.startOf("month").toISOString();
        const ultimoDiaDoMes = value.endOf("month").toISOString();

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .gte("due_date", primeiroDiaDoMes)
          .lte("due_date", ultimoDiaDoMes);

        if (error) throw error;

        setTasks(data || []);
      } catch (error: any) {
        console.error("Erro ao buscar tarefas do calendário:", error);
        message.error("Não foi possível carregar as tarefas deste mês.");
      } finally {
        setLoading(false);
      }
    }

    buscarTarefasDoMes();
  }, [value.month(), value.year(), user]); // 💡 Monitora estritamente a mudança do mês e do ano

  // Função para mapear o status dinamicamente com base na coluna bool e no vencimento
  const obterStatusDaTarefa = (tarefa: iTask) => {
    if (tarefa.is_completed) return "concluida";

    const hoje = dayjs();
    const dataVencimento = dayjs(tarefa.due_date);

    if (dataVencimento.isBefore(hoje, "day")) {
      return "em_atraso";
    }

    return "pendente"; // Retorne "em_andamento" se tiver controle de progresso nos seus steps
  };

  const handleDateChange = (newValue: dayjs.Dayjs) => {
    setValue(newValue);
    const formattedDate = newValue.format("DD-MM-YYYY");
    router.push(`${pathname}?data=${formattedDate}`);
  };

  const handlePrevMonth = () => {
    handleDateChange(value.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    handleDateChange(value.add(1, "month"));
  };

  const formatMonthYear = (date: dayjs.Dayjs) => {
    const month = date.format("MMMM");
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capitalizedMonth} ${date.format("YYYY")}`;
  };

  return (
    <section className={className}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-primaria text-titulo1 font-semibold">
          Calendário de Atividades
        </h1>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <Button
            onClick={handlePrevMonth}
            className="flex items-center justify-center w-10 h-10 border border-primaria rounded-lg text-primaria hover:bg-primaria/5 transition-colors cursor-pointer"
            aria-label="Mês anterior"
            icon={<LeftOutlined />}
          />

          <span className="text-primaria text-titulo2 font-bold min-w-[150px] text-center">
            {formatMonthYear(value)}
          </span>

          <Button
            onClick={handleNextMonth}
            className="flex items-center justify-center w-10 h-10 border border-primaria rounded-lg text-primaria hover:bg-primaria/5 transition-colors cursor-pointer"
            aria-label="Próximo mês"
            icon={<RightOutlined />}
          />
        </div>
      </div>

      <div className="bg-fundo-secundario p-5 rounded-lg shadow-sm relative">
        {/* Spinner para dar feedback visual de carregamento ao trocar de mês */}
        {loading && (
          <div className="absolute inset-0 bg-fundo-secundario/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
            <Spin size="large" />
          </div>
        )}

        <Calendar
          headerRender={() => null}
          value={value}
          onChange={handleDateChange}
          style={{
            fontSize: "var(--text-paragrafo)",
          }}
          className="[&_.ant-picker-cell-inner]:relative [&_.ant-picker-cell-inner]:overflow-hidden"
          cellRender={(current) => {
            const eHoje = current.isSame(dayjs(), "day");

            // Filtra localmente no estado as tarefas que caem exatamente no dia desta célula
            const tarefasDoDia = tasks.filter((tarefa) =>
              dayjs(tarefa.due_date).isSame(current, "day"),
            );

            return (
              <div className="absolute inset-0 p-1 flex flex-col gap-1 overflow-hidden pointer-events-none select-none">
                {eHoje && (
                  <span className="bg-primaria/10 text-primaria text-[10px] font-bold px-1 py-0.5 rounded block text-center w-fit unified-today-badge shrink-0">
                    HOJE
                  </span>
                )}

                {/* Exibição em lista para telas normais/grandes */}
                <ul className="m-0 mt-4 p-0 list-none hidden sm:flex flex-col gap-0.5 overflow-hidden w-full">
                  {tarefasDoDia.slice(0, 3).map((tarefa) => {
                    // Limita a 3 visuais para não estourar layout
                    const statusCalculado = obterStatusDaTarefa(tarefa);
                    const corStatus = listaStatus.find(
                      (st) => st.value === statusCalculado,
                    )?.color;

                    return (
                      <li
                        key={tarefa.id}
                        className="truncate text-paragrafo leading-tight w-full block min-w-0"
                        title={tarefa.title}
                      >
                        <span className="grid grid-cols-[8px_1fr] items-center gap-1">
                          <div
                            className="w-[6px] h-[6px] rounded-full"
                            style={{
                              backgroundColor: corStatus || "transparent",
                            }}
                          ></div>
                          <p className="text-texto truncate">{tarefa.title}</p>
                        </span>
                      </li>
                    );
                  })}
                  {tarefasDoDia.length > 3 && (
                    <span className="text-[10px] text-gray-400 pl-2">
                      +{tarefasDoDia.length - 3} mais
                    </span>
                  )}
                </ul>

                {/* Exibição em pontinhos coloridos para Mobile */}
                {tarefasDoDia.length > 0 && (
                  <div className="flex sm:hidden justify-center gap-1 mt-auto pb-1 shrink-0">
                    {tarefasDoDia.map((tarefa) => {
                      const statusCalculado = obterStatusDaTarefa(tarefa);
                      return (
                        <span
                          key={tarefa.id}
                          className={`w-1.5 h-1.5 rounded-full block ${
                            statusCalculado === "concluida"
                              ? "bg-emerald-500"
                              : statusCalculado === "em_atraso"
                                ? "bg-rose-500"
                                : "bg-blue-500"
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
    </section>
  );
}
