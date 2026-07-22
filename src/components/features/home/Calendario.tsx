"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar, Button, Spin, App } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/pt-br";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { iTask } from "@/src/libs/types/iTarefa";

dayjs.extend(customParseFormat);
dayjs.locale("pt-br");

const supabase = createClient();

export interface iCalendarioProps {
  className?: string;
}

const obterStatusDaTarefa = (tarefa: iTask) => {
  if (tarefa.is_completed) return "concluida";
  const hoje = dayjs();
  const dataVencimento = dayjs(tarefa.due_date);
  if (dataVencimento.isBefore(hoje, "day")) return "em_atraso";
  return "pendente";
};

export default function Calendario({ className }: iCalendarioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { notification } = App.useApp();

  const [tasks, setTasks] = useState<iTask[]>([]);
  const [loading, setLoading] = useState(false);

  const dataParam = searchParams.get("data");
  const parsedParam = dataParam ? dayjs(dataParam, "DD-MM-YYYY") : null;
  const value = parsedParam && parsedParam.isValid() ? parsedParam : dayjs();

  const anoMesChave = value.format("YYYY-MM");

  useEffect(() => {
    let active = true;

    const buscarTarefas = async () => {
      if (!user?.id) return;

      setLoading(true);
      const inicioMes = value.startOf("month").format("YYYY-MM-DD");
      const fimMes = value.endOf("month").format("YYYY-MM-DD");

      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .gte("due_date", inicioMes)
          .lte("due_date", fimMes);

        if (!active) return;

        if (error) {
          notification.error({
            title: "Erro ao carregar calendário",
            message: "Não foi possível carregar as tarefas do mês.",
          });
        } else {
          setTasks((data as iTask[]) || []);
        }
      } catch (err) {
        if (active) console.error("Erro inesperado ao buscar tarefas:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    buscarTarefas();

    return () => {
      active = false;
    };
  }, [user?.id, anoMesChave]);

  const handleSelectDate = (newValue: dayjs.Dayjs) => {
    const dataFormatada = newValue.format("DD-MM-YYYY");
    const params = new URLSearchParams(searchParams.toString());
    params.set("data", dataFormatada);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleMudarMes = (direcao: "anterior" | "proximo") => {
    const novoValor =
      direcao === "anterior"
        ? value.subtract(1, "month")
        : value.add(1, "month");
    handleSelectDate(novoValor);
  };

  return (
    <section
      className={`w-full! mx-auto bg-fundo text-texto ${className || ""}`}
    >
      {/* Cabeçalho do Calendário */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-fundo-secundario">
        <h1 className="text-titulo1 font-bold text-primaria flex items-center gap-2 m-0">
          Calendário de Tarefas
        </h1>

        <div className="flex items-center gap-2">
          <Button
            icon={<LeftOutlined />}
            onClick={() => handleMudarMes("anterior")}
            className="text-paragrafo"
            aria-label="Mês anterior"
          />
          <span className="text-titulo3 font-semibold text-texto px-2 min-w-32 text-center capitalize">
            {value.format("MMMM YYYY")}
          </span>
          <Button
            icon={<RightOutlined />}
            onClick={() => handleMudarMes("proximo")}
            className="text-paragrafo"
            aria-label="Próximo mês"
          />
        </div>
      </div>

      {/* Legenda de Status */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-paragrafo text-texto-secundaria">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />{" "}
          Pendente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />{" "}
          Concluída
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Em
          Atraso
        </span>
      </div>

      {/* Conteúdo do Calendário */}
      <div className="bg-fundo-secundario rounded-lg border border-fundo p-2 shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-fundo/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <Spin size="large" />
          </div>
        )}

        <Calendar
          value={value}
          onSelect={handleSelectDate}
          headerRender={() => null}
          cellRender={(current) => {
            const dataString = current.format("YYYY-MM-DD");
            const tarefasDoDia = tasks.filter(
              (t) => dayjs(t.due_date).format("YYYY-MM-DD") === dataString,
            );

            return (
              <div className="h-full flex flex-col justify-between overflow-hidden p-1">
                {/* Desktop */}
                <ul className="hidden sm:block space-y-1 p-0 m-0 list-none">
                  {tarefasDoDia.slice(0, 3).map((tarefa) => {
                    const status = obterStatusDaTarefa(tarefa);
                    const corDot =
                      status === "concluida"
                        ? "bg-emerald-500"
                        : status === "em_atraso"
                          ? "bg-rose-500"
                          : "bg-blue-500";

                    return (
                      <li key={tarefa.id} className="text-paragrafo-pnl">
                        <span className="flex items-center gap-1.5 rounded px-1 py-0.5 bg-fundo">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${corDot}`}
                          />
                          <p className="text-texto text-paragrafo truncate m-0 font-medium">
                            {tarefa.title}
                          </p>
                        </span>
                      </li>
                    );
                  })}
                  {tarefasDoDia.length > 3 && (
                    <span className="text-paragrafo-pnl text-texto-secundaria pl-1 block font-semibold">
                      +{tarefasDoDia.length - 3} mais
                    </span>
                  )}
                </ul>

                {/* Mobile */}
                {tarefasDoDia.length > 0 && (
                  <div className="flex sm:hidden justify-center gap-1 mt-auto pb-1 shrink-0">
                    {tarefasDoDia.map((tarefa) => {
                      const status = obterStatusDaTarefa(tarefa);
                      const corDot =
                        status === "concluida"
                          ? "bg-emerald-500"
                          : status === "em_atraso"
                            ? "bg-rose-500"
                            : "bg-blue-500";
                      return (
                        <span
                          key={tarefa.id}
                          className={`w-2 h-2 rounded-full block ${corDot}`}
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
