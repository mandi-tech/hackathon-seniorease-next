"use client";

import { useState, useEffect } from "react";
import { Button, Modal, Form, Input, Upload, message, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { Pencil, Plus } from "lucide-react";

export interface iModalEtapaProps {
  idTarefaPai: string;
  onSuccess?: () => void;
  dadosEdicao?: any;
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
  const { notification } = App.useApp();

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

  useEffect(() => {
    if (open) {
      if (isModoEdicao && dadosEdicao) {
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
        const { error: updateError } = await supabase
          .from("task_steps")
          .update({
            instruction: values.instruction,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetStepId);

        if (updateError) throw updateError;
      } else {
        const { data: stepsExistentes, error: errorOrdem } = await supabase
          .from("task_steps")
          .select("step_order")
          .eq("task_id", idTarefaPai);

        if (errorOrdem) throw errorOrdem;

        const proximaOrdem =
          stepsExistentes && stepsExistentes.length > 0
            ? Math.max(...stepsExistentes.map((s) => s.step_order)) + 1
            : 1;

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

      const fileList = values.task_files || [];
      if (fileList.length > 0 && targetStepId) {
        for (const file of fileList) {
          const originFile = file.originFileObj;
          if (!originFile) continue;

          const fileExt = originFile.name.split(".").pop();
          const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${user.id}/${idTarefaPai}/steps/${targetStepId}/${uniqueFileName}`;

          const { error: uploadError } = await supabase.storage
            .from("task-attachments")
            .upload(filePath, originFile);

          if (uploadError) throw uploadError;

          const { error: fileTableError } = await supabase
            .from("task_files")
            .insert([
              {
                task_id: idTarefaPai,
                step_id: targetStepId,
                file_name: originFile.name,
                file_path: filePath,
                file_type: originFile.type,
              },
            ]);

          if (fileTableError) throw fileTableError;
        }
      }

      notification.success({
        title: "Sucesso!",
        description: isModoEdicao
          ? "Passo atualizado com sucesso!"
          : "Novo passo adicionado!",
      });

      form.resetFields();
      handleSetOpen(false);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar etapa:", error);
      notification.error({
        title: "Erro ao salvar",
        description: `Erro ao salvar: ${error.message || "Tente novamente."}`,
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
          onClick={() => handleSetOpen(true)}
          className="text-titulo3! text-fundo!"
          size="large"
          icon={isModoEdicao ? <Pencil /> : <Plus />}
        >
          {isModoEdicao ? "Editar Etapa" : "Adicionar Etapa"}
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
