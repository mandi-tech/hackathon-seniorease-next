"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar, Button, Spin, App } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";

import { iTask } from "@/src/libs/types/iTarefa";

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

export default function Calendario({ className }: iCalendarioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const supabase = createClient();
  const { notification } = App.useApp();

  const [tasks, setTasks] = useState<iTask[]>([]);
  const [loading, setLoading] = useState(false);

  // Deriva o estado inicial da data diretamente a partir da URL
  const [value, setValue] = useState(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsedDate = dayjs(dataParam, "DD-MM-YYYY");
      if (parsedDate.isValid()) return parsedDate;
    }
    return dayjs();
  });

  const carregarTarefasDoMes = useCallback(
    async (dataAtual: dayjs.Dayjs) => {
      const userId = user?.id;
      if (!userId) return;

      setLoading(true);

      try {
        const inicioMes = dataAtual.startOf("month").format("YYYY-MM-DD");
        const fimMes = dataAtual.endOf("month").format("YYYY-MM-DD");

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", userId)
          .gte("due_date", inicioMes)
          .lte("due_date", fimMes);

        if (error) throw error;

        setTasks(data || []);
      } catch (error: unknown) {
        console.error("Erro ao carregar tarefas do mês:", error);
        notification.error({
          title: "Erro ao carregar tarefas",
          description: "Não foi possível carregar o calendário.",
        });
      } finally {
        setLoading(false);
      }
    },
    [user, supabase, notification],
  );

  // Sincroniza a busca de tarefas quando 'value' muda ou o usuário autentica
  useEffect(() => {
    if (user?.id) {
      carregarTarefasDoMes(value);
    }
  }, [value, user?.id, carregarTarefasDoMes]);

  const obterStatusDaTarefa = (tarefa: iTask) => {
    if (tarefa.is_completed) return "concluida";
    if (dayjs(tarefa.due_date).isBefore(dayjs(), "day")) return "em_atraso";
    return "pendente";
  };

  const handleSelect = (newValue: dayjs.Dayjs) => {
    setValue(newValue);
    const dataFormatada = newValue.format("DD-MM-YYYY");
    const params = new URLSearchParams(searchParams.toString());
    params.set("data", dataFormatada);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleMudarMes = (delta: number) => {
    const novoValor = value.add(delta, "month");
    setValue(novoValor);
  };

  return (
    <section
      className={`bg-fundo-secundario rounded-xl shadow-md p-4 flex flex-col justify-between ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-titulo2 text-secundaria font-bold capitalize">
            {value.format("MMMM YYYY")}
          </h2>
          <p className="text-paragrafo text-texto-secundaria">
            Selecione um dia para visualizar as tarefas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            color="primary"
            icon={<LeftOutlined />}
            onClick={() => handleMudarMes(-1)}
            aria-label="Mês anterior"
          />
          <Button
            type="primary"
            onClick={() => handleSelect(dayjs())}
            size="middle"
          >
            Hoje
          </Button>
          <Button
            variant="outlined"
            color="primary"
            icon={<RightOutlined />}
            onClick={() => handleMudarMes(1)}
            aria-label="Próximo mês"
          />
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-fundo-secundario/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
            <Spin size="large" />
          </div>
        )}

        <Calendar
          value={value}
          onSelect={handleSelect}
          headerRender={() => null}
          cellRender={(date) => {
            const dataString = date.format("YYYY-MM-DD");
            const tarefasDoDia = tasks.filter((t) =>
              t.due_date?.startsWith(dataString),
            );

            return (
              <div className="h-full flex flex-col justify-between p-1 overflow-hidden">
                <ul className="m-0 p-0 list-none space-y-1 hidden sm:block">
                  {tarefasDoDia.slice(0, 3).map((tarefa) => {
                    const statusCalculado = obterStatusDaTarefa(tarefa);
                    const statusConfig = listaStatus.find(
                      (s) => s.value === statusCalculado,
                    );

                    return (
                      <li key={tarefa.id} className="text-[11px] truncate">
                        <span className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor: statusConfig?.color || "#2563eb",
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
