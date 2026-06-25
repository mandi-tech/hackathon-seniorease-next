"use client";

import { useState, useEffect } from "react";
import { Button, Checkbox, Tag, Input, message, Breadcrumb } from "antd";
import { useRouter, useParams } from "next/navigation";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import {
  iSubtarefas,
  tarefasCompletasFicticias,
} from "@/src/libs/types/iTarefa";
import { listaStatus } from "@/src/libs/mocks/tarefas";
import ModalTarefa from "./modalTarefa";

export default function DadosTarefa() {
  const router = useRouter();
  const params = useParams();
  const tarefaParams = params?.tarefa;

  // Extrai os IDs com base na posição da rota [...tarefa]
  const idTarefa = Array.isArray(tarefaParams) ? tarefaParams[0] : undefined;
  const idSubtarefa =
    Array.isArray(tarefaParams) && tarefaParams.length > 1
      ? tarefaParams[1]
      : undefined;

  // Encontra a tarefa pai
  const tarefaOriginal = tarefasCompletasFicticias.find(
    (t) => t.id === idTarefa,
  );

  // 1. Encontra a subtarefa específica (se houver o segundo parâmetro na URL)
  const subtarefaOriginal = tarefaOriginal?.subtarefas.find(
    (s) => s.id === idSubtarefa,
  );

  const [subtarefas, setSubtarefas] = useState<iSubtarefas[]>([]);
  const [novoPasso, setNovoPasso] = useState("");

  useEffect(() => {
    if (tarefaOriginal) {
      setSubtarefas(tarefaOriginal.subtarefas);
    }
  }, [tarefaOriginal]);

  if (!tarefaOriginal || (idSubtarefa && !subtarefaOriginal)) {
    return (
      <div className="p-6 text-center bg-fundo-secundario rounded-xl shadow-md">
        <h1 className="text-titulo1 text-primaria font-semibold mb-4">
          Item não encontrado
        </h1>
        <Button type="primary" onClick={() => router.push("/")}>
          Voltar para a Agenda
        </Button>
      </div>
    );
  }

  const modoSubtarefa = !!idSubtarefa;
  const itemExibido = modoSubtarefa ? subtarefaOriginal! : tarefaOriginal;

  const statusInfo = listaStatus.find((st) => st.value === itemExibido.status);

  const handleAlternarCheckbox = (subId: string, checked: boolean) => {
    setSubtarefas(
      subtarefas.map((sub) =>
        sub.id === subId
          ? { ...sub, status: checked ? "concluida" : "pendente" }
          : sub,
      ),
    );
  };

  const itensBreadcrumb = [
    {
      title: (
        <span
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center gap-1 hover:text-primaria"
        >
          <HomeOutlined /> Agenda
        </span>
      ),
    },
    {
      title: modoSubtarefa ? (
        <span
          onClick={() => router.push(`/tarefas/${idTarefa}`)}
          className="cursor-pointer hover:text-primaria"
        >
          {tarefaOriginal.titulo}
        </span>
      ) : (
        <span className="text-texto-secundaria font-semibold">
          {tarefaOriginal.titulo}
        </span>
      ),
    },
  ];

  // Se estiver visualizando uma subtarefa, adiciona o terceiro nível no caminho
  if (modoSubtarefa && subtarefaOriginal) {
    itensBreadcrumb.push({
      title: (
        <span className="text-texto-secundaria font-semibold">
          {subtarefaOriginal.titulo}
        </span>
      ),
    });
  }

  return (
    <div className="p-4 sm:p-6 bg-fundo-secundario rounded-xl shadow-md">
      <div className="mb-6 bg-fundo/40 p-2.5 rounded-lg border border-fundo">
        <Breadcrumb
          items={itensBreadcrumb}
          style={{ fontSize: "var(--text-paragrafo)" }}
        />
      </div>

      {/* Título e Status Dinâmicos */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 mb-5">
        <div>
          {modoSubtarefa && (
            <span className="text-primaria text-xs font-bold uppercase tracking-wider block mb-1">
              Subtarefa de: {tarefaOriginal.titulo}
            </span>
          )}
          <h1 className="text-secundaria text-titulo1 font-bold leading-tight">
            {itemExibido.titulo}
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-texto-secundaria text-paragrafo">
            <span className="flex items-center gap-1">
              <CalendarOutlined /> {tarefaOriginal.data}{" "}
              {/* Mantém a data do pai */}
            </span>
            <span className="flex items-center gap-1">
              <ClockCircleOutlined /> {itemExibido.hora}
            </span>
          </div>
        </div>

        <Tag
          style={{
            backgroundColor: `${statusInfo?.color}15`,
            color: statusInfo?.color,
            borderColor: statusInfo?.color,
            fontSize: "var(--text-paragrafo)",
            padding: "4px 12px",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          {statusInfo?.label}
        </Tag>
      </div>

      <div className="flex flex-col gap-6">
        {/* Seção de Descrição Dinâmica */}
        <div>
          <h2 className="text-secundaria text-titulo3 font-semibold mb-2">
            Descrição {modoSubtarefa ? "da Subtarefa" : "da Tarefa"}
          </h2>
          <p className="text-texto-secundaria text-paragrafo bg-fundo/50 p-4 rounded-lg border border-fundo whitespace-pre-line">
            {itemExibido.descricao ||
              `Esta ${modoSubtarefa ? "subtarefa" : "tarefa"} não possui uma descrição longa informada.`}
          </p>
        </div>

        {/* Exibição de Anexo Dinâmico */}
        {itemExibido.upload && (
          <div>
            <h2 className="text-secundaria text-titulo3 font-semibold mb-2">
              Documentos Anexados
            </h2>
            <div className="flex items-center gap-2 p-3 bg-fundo/50 rounded-lg border border-fundo w-fit text-paragrafo">
              <FileTextOutlined className="text-primaria text-titulo3" />
              <span className="text-texto-secundaria font-medium">
                {itemExibido.upload}
              </span>
            </div>
          </div>
        )}

        {/* 3. Só renderiza a lista de subtarefas se NÃO estivermos no modo ver subtarefa */}
        {!modoSubtarefa && tarefaParams && tarefaParams.length === 1 && (
          <div className="flex flex-col gap-4 border-t pt-4">
            <h2 className="text-secundaria text-titulo3 font-semibold">
              Lista de Subtarefas
            </h2>

            <div className="flex flex-col justify-end">
              <ModalTarefa tipo="subtarefa" />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {subtarefas.length > 0 ? (
                subtarefas.map((sub) => {
                  const checked = sub.status === "concluida";
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 bg-fundo/30 border rounded-lg hover:bg-fundo/60 transition-colors"
                    >
                      <Checkbox
                        checked={checked}
                        onChange={(e) =>
                          handleAlternarCheckbox(sub.id, e.target.checked)
                        }
                        className="text-paragrafo! text-secundaria font-medium [&_.ant-checkbox-inner]:w-5 [&_.ant-checkbox-inner]:h-5"
                      >
                        <span
                          className={
                            checked
                              ? "line-through text-texto-secundaria/50 font-normal"
                              : ""
                          }
                        >
                          {sub.titulo}
                        </span>
                      </Checkbox>

                      <div className="flex items-center gap-3 ml-auto">
                        {sub.hora && (
                          <span className="text-paragrafo text-texto-secundaria bg-fundo px-2 py-0.5 rounded flex items-center gap-1">
                            <ClockCircleOutlined className="text-paragrafo" />{" "}
                            {sub.hora}
                          </span>
                        )}

                        <Button
                          className="text-primaria! text-paragrafo! border! border-primaria!"
                          onClick={() => {
                            router.push(`/tarefas/${idTarefa}/${sub.id}`);
                          }}
                          title="Ver detalhes da subtarefa"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  );
                })
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
