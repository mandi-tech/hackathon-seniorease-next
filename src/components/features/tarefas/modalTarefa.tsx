"use client";

import { listaCategorias } from "@/src/libs/mocks/tarefas";
import { UploadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Modal, Select, Upload } from "antd";
import { useState } from "react";

export default function ModalTarefa() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          setOpen(true);
        }}
        className="text-titulo3! "
        size="large"
      >
        + Adicionar tarefa
      </Button>

      <Modal
        title="Adicionar Tarefa"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        cancelText="Cancelar"
        okText="Salvar"
      >
        <Form
          variant="outlined"
          layout="vertical"
          onFinish={(values) => {
            console.log(values);
          }}
        >
          <Form.Item
            label="Título"
            name="titulo"
            rules={[
              {
                required: true,
                message: "Por favor, insira o título da tarefa",
              },
            ]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label="Descrição"
            name="descricao"
            rules={[
              {
                required: true,
                message: "Por favor, insira a descrição da tarefa",
              },
            ]}
          >
            <Input.TextArea maxLength={1000} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-2">
            <Form.Item
              label="Data"
              name="data"
              rules={[
                {
                  required: true,
                  message: "Por favor, insira a data da tarefa",
                },
              ]}
            >
              <DatePicker className="w-full!" />
            </Form.Item>
            <Form.Item
              label="Hora"
              name="hora"
              rules={[
                {
                  required: true,
                  message: "Por favor, insira a data da tarefa",
                },
              ]}
            >
              <Select
                options={[
                  { value: "9:00", label: "9:00" },
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
              />
            </Form.Item>
          </div>
          <Form.Item
            label="Categoria"
            name="categoria"
            rules={[
              {
                required: true,
                message: "Por favor, insira a categoria da tarefa",
              },
            ]}
          >
            <Select options={listaCategorias} />
          </Form.Item>
          <Form.Item label="Documentos Anexados" name="documento">
            <Upload>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
