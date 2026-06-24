"use client";

import { Badge, Button, Calendar } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import "dayjs/locale/pt-br";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { tarefasFicticias } from "@/src/libs/types/iTarefa";
import { listaStatus } from "@/src/libs/mocks/tarefas";

dayjs.locale("pt-br");

export interface iCalendarioProps {
  className?: string;
}

const mapearStatusBadge = {
  pendente: "processing", // azul / cor primária
  em_andamento: "warning", // amarelo / alerta
  concluida: "success", // verde / sucesso
  em_atraso: "error", // vermelho / perigo
};

export default function Calendario({ className }: iCalendarioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Inicializa o estado com a data da URL se existir, senão usa a data atual
  const [value, setValue] = useState(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsedDate = dayjs(dataParam, "DD-MM-YYYY");
      if (parsedDate.isValid()) return parsedDate;
    }
    return dayjs();
  });

  // Sincroniza o estado caso a URL mude externamente (opcional, mas boa prática)
  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (dataParam) {
      const parsedDate = dayjs(dataParam, "DD-MM-YYYY");
      if (parsedDate.isValid() && !parsedDate.isSame(value, "day")) {
        setValue(parsedDate);
      }
    }
  }, [searchParams]);

  // 2. Função modificada para atualizar o estado e a URL
  const handleDateChange = (newValue: dayjs.Dayjs) => {
    setValue(newValue);

    // Formata a data para DD-MM-YYYY
    const formattedDate = newValue.format("DD-MM-YYYY");

    // Atualiza a URL mantendo a rota atual e adicionando/substituindo o parâmetro ?data=
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

      <div className="bg-fundo-secundario p-5 rounded-lg shadow-sm">
        <Calendar
          headerRender={() => null}
          value={value}
          onChange={handleDateChange}
          style={{
            fontSize: "var(--text-paragrafo)",
          }}
          // 1. Forçamos as células internas do AntD a aceitarem o overflow oculto e posição relativa
          className="[&_.ant-picker-cell-inner]:relative [&_.ant-picker-cell-inner]:overflow-hidden"
          cellRender={(current) => {
            const dataCelularFormatada = current.format("DD-MM-YYYY");
            const eHoje = current.isSame(dayjs(), "day");

            const tarefasDoDia = tarefasFicticias.filter(
              (tarefa) => tarefa.data === dataCelularFormatada,
            );

            return (
              // 2. Usamos absolute inset-0 com p-1 para envelopar perfeitamente o conteúdo sem estourar a célula
              <div className="absolute inset-0 p-1 flex flex-col gap-1 overflow-hidden pointer-events-none select-none">
                {eHoje && (
                  <span className="bg-primaria/10 text-primaria text-[10px] font-bold px-1 py-0.5 rounded block text-center w-fit unified-today-badge shrink-0">
                    HOJE
                  </span>
                )}

                <ul className="m-0 mt-4 p-0 list-none hidden sm:flex flex-col gap-0.5 overflow-hidden w-full">
                  {tarefasDoDia.map((tarefa) => (
                    <li
                      key={tarefa.id}
                      className="truncate text-paragrafo leading-tight w-full block min-w-0"
                      title={tarefa.titulo}
                    >
                      <span className="grid grid-cols-[10px_1fr] items-center gap-1">
                        <div
                          className="w-[8px] h-[8px] rounded-full"
                          style={{
                            backgroundColor:
                              listaStatus.find(
                                (st) => st.value === tarefa.status,
                              )?.color || "transparent",
                          }}
                        ></div>
                        <p className="text-texto">{tarefa.titulo}</p>
                      </span>
                    </li>
                  ))}
                </ul>

                {tarefasDoDia.length > 0 && (
                  <div className="flex sm:hidden justify-center gap-1 mt-auto pb-1 shrink-0">
                    {tarefasDoDia.map((tarefa) => (
                      <span
                        key={tarefa.id}
                        className={`w-1.5 h-1.5 rounded-full block ${
                          tarefa.status === "concluida"
                            ? "bg-emerald-500"
                            : tarefa.status === "em_andamento"
                              ? "bg-amber-500"
                              : tarefa.status === "em_atraso"
                                ? "bg-rose-500"
                                : "bg-blue-500"
                        }`}
                      />
                    ))}
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
