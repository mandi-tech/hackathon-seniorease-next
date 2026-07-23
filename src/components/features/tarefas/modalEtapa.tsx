"use client";

import { useState, useEffect } from "react";
import { Button, Modal, Form, Input, Upload, App } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { InboxOutlined } from "@ant-design/icons";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { iTaskStep } from "@/src/libs/types/iTarefa";
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

const { Dragger } = Upload;

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
      if (isModoEdicao && dadosEdicao) {
        const arquivosIniciais: UploadFile[] = (
          dadosEdicao.task_files || []
        ).map((file) => ({
          uid: file.id,
          name: file.file_name,
          status: "done",
          url: supabase.storage
            .from("task-attachments")
            .getPublicUrl(file.file_path).data.publicUrl,
        }));

        form.setFieldsValue({
          instruction: dadosEdicao.instruction,
          task_files: arquivosIniciais,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, isModoEdicao, dadosEdicao, form, supabase]);

  const handleSalvarEtapa = async (values: FormStepValues) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error("Usuário não autenticado no sistema.");
      }

      let targetStepId = dadosEdicao?.id;

      if (isModoEdicao && targetStepId) {
        const { error: updateError } = await supabase
          .from("task_steps")
          .update({ instruction: values.instruction })
          .eq("id", targetStepId);

        if (updateError) throw updateError;

        const arquivosAntigos = dadosEdicao.task_files || [];
        const UIDsMantidos = (values.task_files || [])
          .map((f) => f.uid)
          .filter(Boolean);

        const arquivosRemovidos = arquivosAntigos.filter(
          (file) => !UIDsMantidos.includes(file.id),
        );

        if (arquivosRemovidos.length > 0) {
          const idsParaDeletar = arquivosRemovidos.map((f) => f.id);
          const pathsParaDeletar = arquivosRemovidos.map((f) => f.file_path);

          const { error: dbDeleteError } = await supabase
            .from("task_files")
            .delete()
            .in("id", idsParaDeletar);

          if (dbDeleteError)
            console.error("Erro ao deletar task_files:", dbDeleteError);

          const { error: storageDeleteError } = await supabase.storage
            .from("task-attachments")
            .remove(pathsParaDeletar);

          if (storageDeleteError)
            console.error("Erro ao deletar do Storage:", storageDeleteError);
        }
      } else {
        const { count } = await supabase
          .from("task_steps")
          .select("*", { count: "exact", head: true })
          .eq("task_id", idTarefaPai);

        const proximaOrdem = (count || 0) + 1;

        const { data: stepData, error: stepError } = await supabase
          .from("task_steps")
          .insert([
            {
              task_id: idTarefaPai,
              instruction: values.instruction,
              is_completed: false,
              step_order: proximaOrdem,
            },
          ])
          .select()
          .single();

        if (stepError) throw stepError;
        targetStepId = stepData.id;
      }

      if (values.task_files && values.task_files.length > 0 && targetStepId) {
        const novosArquivos = values.task_files.filter(
          (file) => file.originFileObj,
        );

        for (const file of novosArquivos) {
          if (!file.originFileObj) continue;

          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${targetStepId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("task-attachments")
            .upload(filePath, file.originFileObj);

          if (uploadError) throw uploadError;

          const { error: dbFileError } = await supabase
            .from("task_files")
            .insert([
              {
                step_id: targetStepId,
                file_name: file.name,
                file_path: filePath,
                file_type: file.type || "unknown",
              },
            ]);

          if (dbFileError) throw dbFileError;
        }
      }

      notification.success({
        title: isModoEdicao ? "Etapa atualizada!" : "Etapa adicionada!",
        message: isModoEdicao
          ? "A etapa foi editada com sucesso."
          : "A nova etapa foi inserida na tarefa.",
      });

      form.resetFields();
      handleSetOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error("Erro ao salvar etapa:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a etapa.";

      notification.error({
        title: "Erro ao salvar",
        message: errorMessage,
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
            <Dragger multiple={true} beforeUpload={() => false} maxCount={5}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Clique ou arraste arquivos para esta área para fazer upload
              </p>
              <p className="ant-upload-hint">
                Suporta até 5 arquivos simultâneos (PDF, PNG, JPG, DOCX) de no
                máximo 10MB cada.
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
