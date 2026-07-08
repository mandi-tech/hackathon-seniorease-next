"use client";

import { useState } from "react";
import { App, Button, Modal, message } from "antd";
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
  const { notification } = App.useApp();

  const tabelaAlvo = tipo === "tarefa" ? "tasks" : "task_steps";
  const rotaRedirecionamento =
    tipo === "tarefa" ? "/" : `/tarefas/${idTarefaPai}`;

  const executarExclusaoFisica = async () => {
    setExecutando(true);
    try {
      if (arquivos && arquivos.length > 0) {
        const caminhos = arquivos.map((f) => f.file_path);
        await supabase.storage.from("task-attachments").remove(caminhos);
      }

      const { error } = await supabase
        .from(tabelaAlvo)
        .delete()
        .eq("id", idTarget);

      if (error) throw error;

      notification.success({
        title: "Sucesso!",
        description: `${tipo === "tarefa" ? "Tarefa" : "Passo"} excluído com sucesso!`,
      });
      router.push(rotaRedirecionamento);
    } catch (error: any) {
      console.error(`Erro ao deletar ${tipo}:`, error);
      notification.error({
        title: "Erro ao deletar",
        message: `Não foi possível excluir o/a ${tipo}.`,
      });
    } finally {
      setExecutando(false);
    }
  };

  const handleDispararFluxo = async () => {
    if (!user) return;

    if (preferences?.extra_confirm) {
      Modal.confirm({
        title: `Tem certeza que deseja excluir este ${tipo === "tarefa" ? "tarefa" : "passo"}?`,
        icon: <ExclamationCircleFilled />,
        content:
          tipo === "tarefa"
            ? "Esta ação removerá permanentemente a tarefa, todos os seus subpassos e arquivos anexados."
            : "Esta ação removerá permanentemente este passo e os arquivos associados a ele.",
        okText: "Sim, excluir",
        okType: "danger",
        cancelText: "Cancelar",
        centered: true,
        onOk: async () => {
          await executarExclusaoFisica();
        },
      });
    } else {
      // Se extra_confirm for falso, deleta sumariamente sem perguntar nada
      await executarExclusaoFisica();
    }
  };

  return (
    <Button
      className="text-titulo3!"
      size="large"
      type="primary"
      danger
      disabled={executando}
      icon={executando ? <LoadingOutlined spin /> : <Trash2 size={22} />}
      onClick={handleDispararFluxo}
    >
      {executando ? "Excluindo..." : "Excluir"}
    </Button>
  );
}
