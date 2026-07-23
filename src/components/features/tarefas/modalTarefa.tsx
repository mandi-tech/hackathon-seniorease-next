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
  App,
  TimePicker,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { InboxOutlined } from "@ant-design/icons";
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
  className?: string;
}

interface FormTaskValues {
  title: string;
  description: string;
  due_date: Dayjs;
  hora: Dayjs;
  category_id: string;
  task_files?: UploadFile[];
}

interface iCategoriaOption {
  value: string;
  label: string;
}

const { Dragger } = Upload;

export default function ModalTarefa({
  tipo,
  onSuccess,
  dadosEdicao,
  controlOpen,
  setControlOpen,
  className,
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
          hora: dataMetadados.isValid() ? dataMetadados : undefined,
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
      const horaBase = values.hora.format("HH:mm");
      const stringDataHoraCompleta = `${dataBase}T${horaBase}:00`;
      const due_date_formatado = dayjs(stringDataHoraCompleta).toISOString();

      let targetTaskId = dadosEdicao?.id;

      if (isModoEdicao && targetTaskId) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            title: values.title,
            description: values.description,
            due_date: due_date_formatado,
            category_id: values.category_id,
          })
          .eq("id", targetTaskId);

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
            console.error("Erro ao deletar do DB:", dbDeleteError);

          const { error: storageDeleteError } = await supabase.storage
            .from("task-attachments")
            .remove(pathsParaDeletar);

          if (storageDeleteError)
            console.error("Erro ao deletar do Storage:", storageDeleteError);
        }
      } else {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .insert([
            {
              title: values.title,
              description: values.description,
              due_date: due_date_formatado,
              category_id: values.category_id,
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (taskError) throw taskError;
        targetTaskId = taskData.id;
      }

      if (values.task_files && values.task_files.length > 0 && targetTaskId) {
        const novosArquivos = values.task_files.filter(
          (file) => file.originFileObj,
        );

        for (const file of novosArquivos) {
          if (!file.originFileObj) continue;

          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${targetTaskId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("task-attachments")
            .upload(filePath, file.originFileObj);

          if (uploadError) throw uploadError;

          const { error: dbFileError } = await supabase
            .from("task_files")
            .insert([
              {
                task_id: targetTaskId,
                file_name: file.name,
                file_path: filePath,
                file_type: file.type || "unknown",
              },
            ]);

          if (dbFileError) throw dbFileError;
        }
      }

      notification.success({
        title: isModoEdicao ? "Tarefa atualizada!" : "Tarefa criada!",
        message: isModoEdicao
          ? "A tarefa foi editada com sucesso."
          : "A nova tarefa foi salva com sucesso.",
      });

      form.resetFields();
      handleSetOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error("Erro ao salvar tarefa:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a tarefa.";

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
          onClick={() => handleSetOpen(true)}
          className={`text-titulo3! text-fundo! ${className}`}
          size="large"
          icon={isModoEdicao ? <Pencil /> : <Plus />}
        >
          {preferences?.ui_mode
            ? ""
            : isModoEdicao
              ? "Editar Tarefa"
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
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
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
              <TimePicker
                format="HH:mm"
                minuteStep={15}
                className="w-full!"
                placeholder="Selecione o horário"
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
