"use client";

import { Button, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FormLogin() {
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = (values: any) => {
    console.log("Success:", values);
    router.push("/");
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <section className="m-auto! min-w-[500px]! block! flex! flex-col! gap-4! items-center! justify-center! bg-fundo-secundario! p-10! rounded-lg! ">
      <h1 className="font-bold text-titulo2 text-primaria">Login</h1>
      <Form
        form={form}
        layout="vertical"
        className="space-y-8! w-full!"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Email inválido", type: "email" }]}
        >
          <Input type="email" size="large" />
        </Form.Item>
        <div className="space-y-2!">
          <Form.Item
            label="Senha"
            name="senha"
            rules={[{ required: true, message: "Senha inválida" }]}
          >
            <Input type="password" size="large" />
          </Form.Item>
          <Link href="/" className="text-texto-secundaria text-paragrafo">
            Esqueci minha senha
          </Link>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="w-full! mx-auto!"
        >
          Entrar
        </Button>

        <p className="text-texto! w-full! text-center! text-paragrafo">
          Não possui uma conta?{" "}
          <Link href="/novo_cadastro" className="text-primaria">
            Faça seu cadastro aqui!
          </Link>
        </p>
      </Form>
    </section>
  );
}
