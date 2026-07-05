"use client";

import { useState, useEffect } from "react";
import { Button, Modal, Form, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";

export interface iModalEtapaProps {
  idTarefaPai: string; // ID da Task principal essencial para vincular o Step
  onSuccess?: () => void;
  dadosEdicao?: any; // Se passado, o modal entra em modo Edição de Step
  controlOpen?: boolean;
  setControlOpen?: (open: boolean) => void;
}

export default function ModalEtapa({
  idTarefaPai,
  onSuccess,
  dadosEdicao,
  controlOpen,
  setControlOpen,
}: iModalEtapaProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const { user } = useAuth();
  const supabase = createClient();

  const isModoEdicao = !!dadosEdicao;
  const open = controlOpen !== undefined ? controlOpen : internalOpen;

  const handleSetOpen = (status: boolean) => {
    if (setControlOpen) {
      setControlOpen(status);
    } else {
      setInternalOpen(status);
    }
  };

  // Preenche os campos caso entre em modo edição
  useEffect(() => {
    if (open) {
      if (isModoEdicao && dadosEdicao) {
        // Formata os arquivos vinculados a esse step específico
        const arquivosFormatados =
          dadosEdicao.task_files?.map((file: any) => ({
            uid: file.id,
            name: file.file_name,
            status: "done",
            url: supabase.storage
              .from("task-attachments")
              .getPublicUrl(file.file_path).data.publicUrl,
            originFileObj: null,
          })) || [];

        form.setFieldsValue({
          instruction: dadosEdicao.instruction,
          task_files: arquivosFormatados,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, dadosEdicao, isModoEdicao, form]);

  const handleSalvarEtapa = async (values: any) => {
    setLoading(true);
    try {
      if (!user) throw new Error("Usuário não autenticado.");
      if (!idTarefaPai) throw new Error("ID da tarefa pai é obrigatório.");

      let targetStepId = dadosEdicao?.id;

      if (isModoEdicao) {
        // 1. Modo Edição: UPDATE na tabela task_steps
        const { error: updateError } = await supabase
          .from("task_steps")
          .update({
            instruction: values.instruction,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetStepId);

        if (updateError) throw updateError;
      } else {
        // 2. Modo Criação: Descobrir o próximo número da ordem (step_order)
        const { data: stepsExistentes, error: errorOrdem } = await supabase
          .from("task_steps")
          .select("step_order")
          .eq("task_id", idTarefaPai);

        if (errorOrdem) throw errorOrdem;

        const proximaOrdem =
          stepsExistentes && stepsExistentes.length > 0
            ? Math.max(...stepsExistentes.map((s) => s.step_order)) + 1
            : 1;

        // 3. Executa o INSERT na tabela task_steps
        const { data: stepData, error: stepError } = await supabase
          .from("task_steps")
          .insert([
            {
              task_id: idTarefaPai,
              instruction: values.instruction,
              step_order: proximaOrdem,
              is_completed: false,
            },
          ])
          .select()
          .single();

        if (stepError) throw stepError;
        targetStepId = stepData?.id;
      }

      // 4. Tratamento de uploads de novos arquivos vinculados ao Step
      const fileList = values.task_files || [];
      if (fileList.length > 0 && targetStepId) {
        for (const file of fileList) {
          const originFile = file.originFileObj;
          if (!originFile) continue; // Pula arquivos antigos já salvos

          const fileExt = originFile.name.split(".").pop();
          const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
          // Organiza a estrutura de pastas incluindo o ID do step no caminho físico do storage
          const filePath = `${user.id}/${idTarefaPai}/steps/${targetStepId}/${uniqueFileName}`;

          const { error: uploadError } = await supabase.storage
            .from("task-attachments")
            .upload(filePath, originFile);

          if (uploadError) throw uploadError;

          // Insere metadados amarrando tanto a Task pai quanto o Step correspondente
          const { error: fileTableError } = await supabase
            .from("task_files")
            .insert([
              {
                task_id: idTarefaPai,
                step_id: targetStepId, // 💡 Agora o arquivo aponta diretamente para o Step
                file_name: originFile.name,
                file_path: filePath,
                file_type: originFile.type,
              },
            ]);

          if (fileTableError) throw fileTableError;
        }
      }

      message.success(
        isModoEdicao
          ? "Passo atualizado com sucesso!"
          : "Novo passo adicionado!",
      );

      form.resetFields();
      handleSetOpen(false);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar etapa:", error);
      message.error(`Erro ao salvar: ${error.message || "Tente novamente."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {controlOpen === undefined && (
        <Button
          type="primary"
          onClick={() => handleSetOpen(true)}
          className="text-titulo3! text-fundo!"
          size="large"
        >
          {isModoEdicao ? "Editar Passo" : "+ Adicionar Passo"}
        </Button>
      )}

      <Modal
        title={isModoEdicao ? "Editar Passo / Etapa" : "Adicionar Novo Passo"}
        open={open}
        confirmLoading={loading}
        onOk={() => form.submit()}
        onCancel={() => {
          form.resetFields();
          handleSetOpen(false);
        }}
        cancelText="Cancelar"
        okText={isModoEdicao ? "Salvar Alterações" : "Adicionar"}
      >
        <Form
          form={form}
          variant="outlined"
          layout="vertical"
          onFinish={handleSalvarEtapa}
          className="mt-4"
        >
          <Form.Item
            label="Instrução do Passo"
            name="instruction"
            rules={[
              {
                required: true,
                message: "Por favor, insira o que deve ser feito neste passo",
              },
            ]}
          >
            <Input.TextArea
              maxLength={500}
              rows={3}
              placeholder="Ex: Revisar as métricas de latência coletadas pelo SkyWatch"
            />
          </Form.Item>

          <Form.Item
            label="Documentos e Evidências do Passo"
            name="task_files"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>
                Selecionar arquivos para a etapa
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
