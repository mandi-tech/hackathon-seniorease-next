"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  message,
  App,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { UploadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { createClient } from "@/src/libs/supabase/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { iFileAttachment, iMainTask } from "@/src/libs/types/iTarefa";
import { Pencil, Plus } from "lucide-react";

export interface iModalTarefaProps {
  tipo: "tarefa" | "subtarefa";
  onSuccess?: () => void;
  dadosEdicao?: iMainTask;
  controlOpen?: boolean;
  setControlOpen?: (open: boolean) => void;
}

interface FormTaskValues {
  title: string;
  description: string;
  due_date: Dayjs;
  hora: string;
  category_id: string;
  task_files?: UploadFile[];
}

interface iCategoriaOption {
  value: string;
  label: string;
}

export default function ModalTarefa({
  tipo,
  onSuccess,
  dadosEdicao,
  controlOpen,
  setControlOpen,
}: iModalTarefaProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<iCategoriaOption[]>([]);
  const [form] = Form.useForm<FormTaskValues>();
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
    async function carregarCategorias() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) throw error;

        if (data) {
          const optionsFormatadas = data.map((cat) => ({
            value: cat.id,
            label: cat.name,
          }));
          setCategorias(optionsFormatadas);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    }
    carregarCategorias();
  }, [supabase]);

  useEffect(() => {
    if (open) {
      if (isModoEdicao && dadosEdicao) {
        const dataMetadados = dayjs(dadosEdicao.due_date);

        const arquivosFormatados: UploadFile[] =
          dadosEdicao.task_files?.map((file: iFileAttachment) => ({
            uid: file.id,
            name: file.file_name,
            status: "done",
            url: supabase.storage
              .from("task-attachments")
              .getPublicUrl(file.file_path).data.publicUrl,
          })) || [];

        form.setFieldsValue({
          title: dadosEdicao.title,
          description: dadosEdicao.description,
          due_date: dataMetadados.isValid() ? dataMetadados : undefined,
          hora: dataMetadados.isValid()
            ? dataMetadados.format("HH:mm")
            : undefined,
          category_id: dadosEdicao.category_id,
          task_files: arquivosFormatados,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, dadosEdicao, isModoEdicao, form, supabase]);

  const handleSalvarTarefa = async (values: FormTaskValues) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error("Usuário não autenticado no sistema.");
      }

      const dataBase = values.due_date.format("YYYY-MM-DD");
      const horaBase = values.hora;
      const stringDataHoraCompleta = `${dataBase}T${horaBase}:00`;
      const due_date_formatado = dayjs(stringDataHoraCompleta).toISOString();

      let targetTaskId = dadosEdicao?.id;

      const payload = {
        user_id: user.id,
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        due_date: due_date_formatado,
      };

      if (isModoEdicao) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update(payload)
          .eq("id", targetTaskId);

        if (updateError) throw updateError;
      } else {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .insert([{ ...payload, is_completed: false }])
          .select()
          .single();

        if (taskError) throw taskError;
        targetTaskId = taskData?.id;
      }

      const fileList = values.task_files || [];
      if (fileList.length > 0 && targetTaskId) {
        for (const file of fileList) {
          const originFile = file.originFileObj;
          if (!originFile) continue;

          const fileExt = originFile.name.split(".").pop();
          const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${user.id}/${targetTaskId}/${uniqueFileName}`;

          const { error: uploadError } = await supabase.storage
            .from("task-attachments")
            .upload(filePath, originFile);

          if (uploadError) throw uploadError;

          const { error: fileTableError } = await supabase
            .from("task_files")
            .insert([
              {
                task_id: targetTaskId,
                step_id: null,
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
          ? "Tarefa atualizada com sucesso!"
          : "Tarefa adicionada com sucesso!",
      });
      form.resetFields();
      handleSetOpen(false);

      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error("Erro ao salvar tarefa:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Tente novamente.";
      message.error(`Erro ao salvar tarefa: ${errorMessage}`);
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
          {isModoEdicao
            ? !preferences?.ui_mode && "Editar Tarefa"
            : "Adicionar Tarefa"}
        </Button>
      )}

      <Modal
        title={isModoEdicao ? `Editar ${tipo}` : `Adicionar ${tipo}`}
        open={open}
        confirmLoading={loading}
        onOk={() => form.submit()}
        onCancel={() => {
          form.resetFields();
          handleSetOpen(false);
        }}
        cancelText="Cancelar"
        okText={isModoEdicao ? "Salvar Alterações" : "Salvar"}
      >
        <Form
          form={form}
          variant="outlined"
          layout="vertical"
          onFinish={handleSalvarTarefa}
          className="mt-4"
        >
          <Form.Item
            label="Título"
            name="title"
            rules={[{ required: true, message: "Por favor, insira o título" }]}
          >
            <Input
              maxLength={100}
              placeholder="Digite o título da atividade"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Descrição"
            name="description"
            rules={[
              { required: true, message: "Por favor, insira a descrição" },
            ]}
          >
            <Input.TextArea
              maxLength={1000}
              rows={4}
              placeholder="Descreva os detalhes..."
              size="large"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-2">
            <Form.Item
              label="Data"
              name="due_date"
              rules={[{ required: true, message: "Por favor, insira a data" }]}
            >
              <DatePicker
                className="w-full!"
                format="DD/MM/YYYY"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Hora"
              name="hora"
              rules={[
                { required: true, message: "Por favor, selecione o horário" },
              ]}
            >
              <Select
                placeholder="Selecione"
                options={[
                  { value: "09:00", label: "09:00" },
                  { value: "10:00", label: "10:00" },
                  { value: "11:00", label: "11:00" },
                  { value: "12:00", label: "12:00" },
                  { value: "13:00", label: "13:00" },
                  { value: "14:00", label: "14:00" },
                  { value: "15:00", label: "15:00" },
                  { value: "16:00", label: "16:00" },
                  { value: "17:00", label: "17:00" },
                  { value: "18:00", label: "18:00" },
                  { value: "19:00", label: "19:00" },
                  { value: "20:00", label: "20:00" },
                ]}
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Categoria"
            name="category_id"
            rules={[
              { required: true, message: "Por favor, selecione a categoria" },
            ]}
          >
            <Select
              placeholder="Escolha uma categoria"
              options={categorias}
              loading={categorias.length === 0}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Documentos Anexados"
            name="task_files"
            valuePropName="fileList"
            getValueFromEvent={(
              e: UploadFile[] | { fileList: UploadFile[] },
            ) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />} size="large">
                Clique para fazer Upload
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
