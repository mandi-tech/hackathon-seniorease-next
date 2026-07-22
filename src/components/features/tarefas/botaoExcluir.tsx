"use client";

import { useState } from "react";
import { App, Button, Modal } from "antd";
import { ExclamationCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";

interface iBotaoExcluirProps {
  idTarget: string;
  idTarefaPai?: string;
  tipo: "tarefa" | "subtarefa";
  arquivos: Array<{ file_path: string }>;
}

export default function BotaoExcluir({
  idTarget,
  idTarefaPai,
  tipo,
  arquivos,
}: iBotaoExcluirProps) {
  const router = useRouter();
  const { user, preferences } = useAuth();
  const supabase = createClient();
  const [executando, setExecutando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const { notification } = App.useApp();

  const tabelaAlvo = tipo === "tarefa" ? "tasks" : "task_steps";
  const rotaRedirecionamento =
    tipo === "tarefa" ? "/" : `/tarefas/${idTarefaPai}`;

  const executarExclusaoFisica = async () => {
    setExecutando(true);
    try {
      if (arquivos && arquivos.length > 0) {
        const caminhos = arquivos.map((f) => f.file_path);
        await supabase.storage.from("task-files").remove(caminhos);
      }

      const { error } = await supabase
        .from(tabelaAlvo)
        .delete()
        .eq("id", idTarget);

      if (error) throw error;

      notification.success({
        title: `${tipo === "tarefa" ? "Tarefa" : "Passo"} excluído(a)`,
        description: "O item foi removido com sucesso.",
      });

      setModalAberto(false);
      router.push(rotaRedirecionamento);
      router.refresh();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido ao excluir";
      notification.error({
        title: "Erro ao excluir",
        description: errorMessage,
      });
    } finally {
      setExecutando(false);
    }
  };

  const handleDispararFluxo = () => {
    if (!user) return;

    if (preferences?.extra_confirm) {
      setModalAberto(true);
    } else {
      executarExclusaoFisica();
    }
  };

  return (
    <>
      <Button
        className="text-titulo3!"
        size="large"
        type="primary"
        danger
        disabled={executando}
        icon={executando ? <LoadingOutlined spin /> : <Trash2 size={22} />}
        onClick={handleDispararFluxo}
      >
        {!preferences?.ui_mode ? "Excluir" : ""}
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2 text-titulo3">
            <ExclamationCircleFilled className="text-red-500" />
            <span>
              Tem certeza que deseja excluir esta{" "}
              {tipo === "tarefa" ? "tarefa" : "subtarefa"}?
            </span>
          </div>
        }
        open={modalAberto}
        onOk={executarExclusaoFisica}
        onCancel={() => setModalAberto(false)}
        okText="Sim, excluir"
        okType="danger"
        cancelText="Cancelar"
        confirmLoading={executando}
        centered
      >
        <p className="text-paragrafo text-texto-secundaria my-4">
          {tipo === "tarefa"
            ? "Esta ação removerá permanentemente a tarefa, todos os seus subpassos e arquivos anexados."
            : "Esta ação removerá permanentemente este passo e os arquivos associados a ele."}
        </p>
      </Modal>
    </>
  );
}
