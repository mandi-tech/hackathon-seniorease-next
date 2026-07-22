"use client";

import { Button, Form, Input } from "antd";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { useState } from "react";
import { App } from "antd";

interface LoginFormValues {
  email: string;
  senha: string;
}

interface FormFieldError {
  errors: string[];
}

interface FormFinishFailedInfo {
  errorFields: FormFieldError[];
}

export default function FormLogin() {
  const [form] = Form.useForm();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    const { email, senha } = values;

    try {
      const result = await signIn(email, senha);
      if (result.success) {
        notification.success({
          title: "Login realizado com sucesso!",
          message: "Seja bem-vindo(a) de volta!",
        });
      } else {
        notification.error({
          title: "Erro no login",
          message: result.error || "E-mail ou senha incorretos.",
        });
      }
    } catch (err) {
      console.error("Erro no login:", err);
      notification.error({
        title: "Erro no login",
        message: "Ocorreu um erro ao fazer o login. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: FormFinishFailedInfo) => {
    notification.error({
      title: "Erro no login",
      message: errorInfo.errorFields.map((f) => f.errors.join(", ")).join("; "),
    });
  };

  return (
    <section className="w-full! max-w-[400px]! p-8! bg-fundo-secundario! rounded-lg! shadow-md!">
      <h1 className="text-titulo1! font-bold! text-center! mb-8! text-primaria">
        SeniorEase
      </h1>
      <Form
        form={form}
        layout="vertical"
        className="space-y-8! "
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Por favor, digite seu e-mail!" },
            { type: "email", message: "Insira um e-mail válido!" },
          ]}
        >
          <Input type="email" size="large" placeholder="nome@exemplo.com" />
        </Form.Item>

        <div className="space-y-2!">
          <Form.Item
            label="Senha"
            name="senha"
            rules={[
              { required: true, message: "Por favor, digite sua senha!" },
            ]}
          >
            <Input.Password size="large" placeholder="Digite sua senha" />
          </Form.Item>
          <Link
            href="/"
            className="text-texto-secundaria text-paragrafo hover:text-primaria"
          >
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
            Faça seu cadastro aqui
          </Link>
        </p>
      </Form>
    </section>
  );
}
