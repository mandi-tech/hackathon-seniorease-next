"use client";

import { Button, Divider, Form, Input } from "antd";
import { useRouter } from "next/navigation";

export default function FormNovoCadastro() {
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = (values: any) => {
    console.log("Success:", values);
    router.push("/login");
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <section className="m-auto! min-w-[500px]! block! flex! flex-col! gap-4! items-center! justify-center! bg-fundo-secundario! p-10! rounded-lg! ">
      <h1 className="font-bold text-titulo2 text-primaria">Novo Cadastro</h1>
      <Form
        form={form}
        layout="vertical"
        className="space-y-8! w-full!"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Nome"
          name="nome"
          rules={[{ required: true, message: "Nome inválido" }]}
        >
          <Input type="text" size="large" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Email inválido", type: "email" }]}
        >
          <Input type="email" size="large" />
        </Form.Item>

        <Divider className="bg-texto/10" />

        <Form.Item
          label="Senha"
          name="senha"
          rules={[{ required: true, message: "Senha inválida" }]}
        >
          <Input type="password" size="large" />
        </Form.Item>
        <Form.Item
          label="Confirmação de Senha"
          name="confirmacaoSenha"
          rules={[{ required: true, message: "Confirmação de senha inválida" }]}
        >
          <Input type="password" size="large" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="w-full! mx-auto!"
        >
          Cadastrar
        </Button>
      </Form>
    </section>
  );
}
