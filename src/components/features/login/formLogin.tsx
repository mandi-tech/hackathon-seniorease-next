"use client";

import { Button, Form, Input, message } from "antd";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { useState } from "react";

export default function FormLogin() {
  const [form] = Form.useForm();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    const { email, senha } = values;
    
    try {
      const result = await signIn(email, senha);
      if (result.success) {
        message.success("Login realizado com sucesso!");
        // O redirect é feito pelo signIn() no AuthContext (para /acessibilidade ou /)
      } else {
        message.error(result.error || "E-mail ou senha incorretos.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      message.error("Ocorreu um erro ao fazer o login. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
          rules={[
            { required: true, message: "Por favor, digite seu e-mail!" },
            { type: "email", message: "Insira um e-mail válido!" }
          ]}
        >
          <Input type="email" size="large" placeholder="nome@exemplo.com" />
        </Form.Item>
        <div className="space-y-2!">
          <Form.Item
            label="Senha"
            name="senha"
            rules={[{ required: true, message: "Por favor, digite sua senha!" }]}
          >
            <Input.Password size="large" placeholder="Digite sua senha" />
          </Form.Item>
          <Link href="/" className="text-texto-secundaria text-paragrafo hover:text-primaria">
            Esqueci minha senha
          </Link>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="w-full! mx-auto!"
          loading={loading}
        >
          Entrar
        </Button>

        <p className="text-texto! w-full! text-center! text-paragrafo">
          Não possui uma conta?{" "}
          <Link href="/novo_cadastro" className="text-primaria hover:underline">
            Faça seu cadastro aqui!
          </Link>
        </p>
      </Form>
    </section>
  );
}

