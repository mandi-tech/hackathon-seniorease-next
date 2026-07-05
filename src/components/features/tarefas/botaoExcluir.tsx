"use client";

import { useState } from "react";
import { Button, Modal, message } from "antd";
import { ExclamationCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";

interface iBotaoExcluirProps {
  idTarget: string; // ID do item que será deletado (ID da Task ou ID do Step)
  idTarefaPai?: string; // Obrigatório apenas se tipo for "subtarefa" para podermos voltar à tela do pai
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
  const { user } = useAuth();
  const supabase = createClient();
  const [executando, setExecutando] = useState(false);

  // Define qual tabela e rota usar dependendo do tipo de exclusão
  const tabelaAlvo = tipo === "tarefa" ? "tasks" : "task_steps";
  const rotaRedirecionamento =
    tipo === "tarefa" ? "/" : `/tarefas/${idTarefaPai}`;

  // Função que executa a limpeza de arquivos e remoção no banco
  const executarExclusaoFisica = async () => {
    setExecutando(true);
    try {
      // 1. Remove os arquivos físicos do Bucket vinculados ao item
      if (arquivos && arquivos.length > 0) {
        const caminhos = arquivos.map((f) => f.file_path);
        await supabase.storage.from("task-attachments").remove(caminhos);
      }

      // 2. Deleta o registro na tabela correspondente (tasks ou task_steps)
      const { error } = await supabase
        .from(tabelaAlvo)
        .delete()
        .eq("id", idTarget);

      if (error) throw error;

      message.success(
        `${tipo === "tarefa" ? "Tarefa" : "Passo"} excluído com sucesso!`,
      );
      router.push(rotaRedirecionamento);
    } catch (error: any) {
      console.error(`Erro ao deletar ${tipo}:`, error);
      message.error(`Não foi possível excluir o/a ${tipo}.`);
    } finally {
      setExecutando(false);
    }
  };

  const handleDispararFluxo = async () => {
    if (!user) return;

    try {
      // Busca a preferência 'extra_confirm' direto do perfil do usuário logado
      const { data: perfil, error } = await supabase
        .from("profiles")
        .select("extra_confirm")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Se a preferência exigir confirmação, abre o modal customizado com base no tipo
      if (perfil?.extra_confirm) {
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
    } catch (err) {
      console.error("Erro ao checar preferências do usuário:", err);
      // Fallback de segurança em caso de falha de leitura de preferências
      await executarExclusaoFisica();
    }
  };

  return (
    <Button
      className="text-white"
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
