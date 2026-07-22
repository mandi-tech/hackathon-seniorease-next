"use client";

import { useState, useEffect } from "react";
import { Button, Modal, Form, Input, Upload, App } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { iFileAttachment, iTaskStep } from "@/src/libs/types/iTarefa";
import { Pencil, Plus } from "lucide-react";

export interface iModalEtapaProps {
  idTarefaPai: string;
  onSuccess?: () => void;
  dadosEdicao?: iTaskStep;
  controlOpen?: boolean;
  setControlOpen?: (open: boolean) => void;
}

interface FormStepValues {
  instruction: string;
  task_files?: UploadFile[];
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
  const [form] = Form.useForm<FormStepValues>();
  const { notification } = App.useApp();

  const { user, preferences } = useAuth();
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

  useEffect(() => {
    if (open) {
      if (dadosEdicao) {
        form.setFieldsValue({
          instruction: dadosEdicao.instruction,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, dadosEdicao, form]);

  const handleSalvarEtapa = async (values: FormStepValues) => {
    if (!user) {
      notification.error({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para realizar esta ação.",
      });
      return;
    }

    setLoading(true);

    try {
      let targetStepId = dadosEdicao?.id;

      if (isModoEdicao && targetStepId) {
        const { error: updateError } = await supabase
          .from("task_steps")
          .update({ instruction: values.instruction })
          .eq("id", targetStepId);

        if (updateError) throw updateError;
      } else {
        const { data: stepData, error: stepError } = await supabase
          .from("task_steps")
          .insert([
            {
              task_id: idTarefaPai,
              instruction: values.instruction,
              is_completed: false,
            },
          ])
          .select()
          .single();

        if (stepError) throw stepError;
        targetStepId = stepData.id;
      }

      // Processamento e upload de arquivos anexos
      if (values.task_files && values.task_files.length > 0 && targetStepId) {
        for (const fileItem of values.task_files) {
          const originFile = fileItem.originFileObj;
          if (!originFile) continue;

          // Caminho no bucket incluindo user.id na raiz para respeitar a política RLS do Storage
          const filePath = `${user.id}/${idTarefaPai}/${targetStepId}/${originFile.name}`;

          // Upload no bucket correto 'task-attachments'
          const { error: uploadError } = await supabase.storage
            .from("task-attachments")
            .upload(filePath, originFile, { upsert: true });

          if (uploadError) {
            console.error("Erro no upload do storage:", uploadError);
            throw uploadError;
          }

          // Vinculação na tabela 'task_files' com task_id como null
          const { error: fileTableError } = await supabase
            .from("task_files")
            .insert([
              {
                task_id: null,
                step_id: targetStepId,
                file_name: originFile.name,
                file_path: filePath,
                file_type: originFile.type,
              },
            ]);

          if (fileTableError) {
            console.error("Erro na tabela task_files:", fileTableError);
            throw fileTableError;
          }
        }
      }

      notification.success({
        title: isModoEdicao ? "Etapa atualizada" : "Etapa criada",
        description: isModoEdicao
          ? "A etapa foi atualizada com sucesso!"
          : "Nova etapa adicionada à tarefa!",
      });

      form.resetFields();
      handleSetOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado ao salvar etapa";
      notification.error({
        title: "Erro ao salvar",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {controlOpen === undefined && (
        <Button
          type="primary"
          size="large"
          icon={isModoEdicao ? <Pencil /> : <Plus />}
          onClick={() => handleSetOpen(true)}
          className={`text-titulo3! text-fundo!`}
        >
          {preferences?.ui_mode
            ? ""
            : isModoEdicao
              ? "Editar Etapa"
              : "Adicionar Passo"}
        </Button>
      )}

      <Modal
        title={isModoEdicao ? "Editar Etapa" : "Adicionar Nova Etapa"}
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
            label="Instrução da Etapa"
            name="instruction"
            rules={[
              {
                required: true,
                message: "Por favor, insira o que deve ser feito nesta etapa",
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
            label="Documentos e Evidências da Etapa"
            name="task_files"
            valuePropName="fileList"
            getValueFromEvent={(
              e: UploadFile[] | { fileList: UploadFile[] },
            ) => (Array.isArray(e) ? e : e?.fileList)}
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
