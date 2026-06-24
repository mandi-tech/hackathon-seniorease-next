"use client";

import { useState, useEffect } from "react";
import { Button, Checkbox, Tag, Input, message } from "antd";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  iSubtarefas,
  tarefasCompletasFicticias,
} from "@/src/libs/types/iTarefa";
import { listaStatus } from "@/src/libs/mocks/tarefas";
import ModalTarefa from "./modalTarefa";

export default function DadosTarefa() {
  const router = useRouter();
  const { tarefa } = useParams();

  // Encontra a tarefa correspondente ao ID da URL
  const tarefaOriginal = tarefasCompletasFicticias.find((t) => t.id === tarefa);

  // Estados locais para controlar as subtarefas dinamicamente na tela
  const [subtarefas, setSubtarefas] = useState<iSubtarefas[]>([]);
  const [novoPasso, setNovoPasso] = useState("");

  // Sincroniza o estado quando a tarefa original carregar
  useEffect(() => {
    if (tarefaOriginal) {
      setSubtarefas(tarefaOriginal.subtarefas);
    }
  }, [tarefaOriginal]);

  if (!tarefaOriginal) {
    return (
      <div className="p-6 text-center bg-fundo-secundario rounded-xl shadow-md">
        <h1 className="text-titulo1 text-primaria font-semibold mb-4">
          Tarefa não encontrada
        </h1>
        <Button type="primary" onClick={() => router.push("/")}>
          Voltar para a Agenda
        </Button>
      </div>
    );
  }

  const statusInfo = listaStatus.find(
    (st) => st.value === tarefaOriginal.status,
  );

  // Adiciona uma nova subtarefa à lista atual
  const handleAdicionarSubtarefa = () => {
    if (!novoPasso.trim()) {
      message.warning("Digite o nome da atividade primeiro.");
      return;
    }

    const novaSub: iSubtarefas = {
      id: `sub-${Date.now()}`,
      titulo: novoPasso,
      status: "pendente",
      upload: "",
      hora: dayjs().format("HH:mm"),
      descricao: "",
    };

    setSubtarefas([...subtarefas, novaSub]);
    setNovoPasso("");
    message.success("Atividade adicionada ao passo a passo!");
  };

  // Altera o estado do checkbox (Concluída / Pendente)
  const handleAlternarCheckbox = (subId: string, checked: boolean) => {
    setSubtarefas(
      subtarefas.map((sub) =>
        sub.id === subId
          ? { ...sub, status: checked ? "concluida" : "pendente" }
          : sub,
      ),
    );
  };

  return (
    <div className=" p-4 sm:p-6 bg-fundo-secundario rounded-xl shadow-md">
      {/* Botão Superior para Voltar */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        className="flex items-center text-primaria font-semibold mb-6 hover:bg-primaria/5 cursor-pointer text-paragrafo"
      >
        Voltar para a Agenda
      </Button>

      {/* Título e Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 mb-5">
        <div>
          <h1 className="text-secundaria text-titulo1 font-bold leading-tight">
            {tarefaOriginal.titulo}
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-texto-secundaria text-paragrafo">
            <span className="flex items-center gap-1">
              <CalendarOutlined /> {tarefaOriginal.data}
            </span>
            <span className="flex items-center gap-1">
              <ClockCircleOutlined /> {tarefaOriginal.hora}
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
        {/* Seção de Descrição */}
        <div>
          <h2 className="text-secundaria text-titulo3 font-semibold mb-2">
            Descrição da Tarefa
          </h2>
          <p className="text-texto-secundaria text-paragrafo bg-fundo/50 p-4 rounded-lg border border-fundo whitespace-pre-line">
            {tarefaOriginal.descricao ||
              "Esta tarefa não possui uma descrição longa informada."}
          </p>
        </div>

        {/* Exibição de Anexo */}
        {tarefaOriginal.upload && (
          <div>
            <h2 className="text-secundaria text-titulo3 font-semibold mb-2">
              Documentos Anexados
            </h2>
            <div className="flex items-center gap-2 p-3 bg-fundo/50 rounded-lg border border-fundo w-fit text-paragrafo">
              <FileTextOutlined className="text-primaria text-titulo3" />
              <span className="text-texto-secundaria font-medium">
                {tarefaOriginal.upload}
              </span>
            </div>
          </div>
        )}

        {/* Gerenciamento das Subtarefas */}
        <div className="flex flex-col gap-4 border-t pt-4">
          <h2 className="text-secundaria text-titulo3 font-semibold">
            Lista de Subtarefas
          </h2>

          {/* Input para nova subtarefa */}
          <div className="flex flex-col sm:flex-row gap-2 bg-fundo/40 p-3 rounded-lg border border-dashed border-primaria/30">
            <ModalTarefa />
          </div>

          {/* Listagem das Subtarefas */}
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
                      className="text-paragrafo text-secundaria font-medium [&_.ant-checkbox-inner]:w-5 [&_.ant-checkbox-inner]:h-5"
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

                    {sub.hora && (
                      <span className="text-[12px] text-texto-secundaria bg-fundo px-2 py-0.5 rounded ml-auto flex items-center gap-1">
                        <ClockCircleOutlined className="text-[10px]" />{" "}
                        {sub.hora}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-texto-secundaria text-paragrafo italic bg-fundo/10 p-4 rounded-lg text-center">
                Nenhum passo cadastrado. Adicione passos acima para facilitar a
                execução da tarefa.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
