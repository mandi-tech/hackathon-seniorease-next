"use client";

import { ClockCircleOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { tarefasFicticias } from "@/src/libs/types/iTarefa";
import { listaCategorias, listaStatus } from "@/src/libs/mocks/tarefas";
import ModalTarefa from "../tarefas/modalTarefa";
dayjs.locale("pt-br");

export interface iListaTarefasProps {
  className?: string;
}

export default function ListaTarefas({ className }: iListaTarefasProps) {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");
  const router = useRouter();

  const dataAlvoStr = dataParam || dayjs().format("DD-MM-YYYY");

  const tarefasFiltradas = tarefasFicticias.filter(
    (tarefa) => tarefa.data === dataAlvoStr,
  );

  const obtenerDataFormatada = () => {
    let dataObjeto = dayjs();

    if (dataParam) {
      const dataValida = dayjs(dataParam, "DD-MM-YYYY");
      if (dataValida.isValid()) {
        dataObjeto = dataValida;
      }
    }

    const dataFormatada = dataObjeto.format("dddd, DD [de] MMMM [de] YYYY");
    return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  };

  return (
    <section className={className}>
      <h1 className="text-primaria text-titulo1 font-semibold mb-4">
        Agenda do dia
      </h1>
      <div className="min-h-[80vh] flex flex-col gap-8 justify-between">
        <div className="flex pb-2 flex-col gap-5 overflow-y-auto min-h-[fit-content]">
          <p className="text-paragrafo font-bold">{obtenerDataFormatada()}</p>

          {tarefasFiltradas.length > 0 ? (
            tarefasFiltradas.map((tarefa) => {
              const statusInfo = listaStatus.find(
                (st) => st.value === tarefa.status,
              );

              const categoriaInfo = listaCategorias.find(
                (cat) => cat.value === tarefa.categoria,
              );

              return (
                <div
                  key={tarefa.id}
                  className="bg-fundo-secundario border-l-4 p-3 rounded-lg shadow-md flex gap-3 relative overflow-hidden items-start"
                  style={{
                    borderLeftColor: statusInfo?.color || "var(--cor-primaria)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    router.push(`/tarefas/${tarefa.id}`);
                  }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primaria shrink-0 [&>svg]:text-fundo-secundario [&>svg]:text-titulo3">
                    {categoriaInfo?.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-secundaria text-titulo3 font-semibold truncate">
                      {tarefa.titulo}
                    </h2>

                    <p className="text-texto-secundaria text-paragrafo truncate">
                      {(tarefa as any).descricao || "Sem descrição adicional"}
                    </p>

                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-texto-secundaria text-paragrafo">
                        <ClockCircleOutlined />
                        <p>{tarefa.hora}</p>
                      </div>

                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${statusInfo?.color}15`,
                          color: statusInfo?.color,
                        }}
                      >
                        {statusInfo?.label}
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

        <ModalTarefa tipo="tarefa" />
      </div>
    </section>
  );
}
