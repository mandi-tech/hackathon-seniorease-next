"use client";

import { App, Button, Divider, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { useState } from "react";

interface CadastroValues {
  nome: string;
  email: string;
  senha: string;
}

interface FormErrorFields {
  errorFields: { errors: string[] }[];
}

export default function FormNovoCadastro() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();

  const onFinish = async (values: CadastroValues) => {
    setLoading(true);
    const { nome, email, senha } = values;

    try {
      const result = await signUp(email, senha, nome);
      if (result.success) {
        notification.success({
          title: "Cadastro realizado com sucesso!",
          description: "Faça seu login.",
        });
        router.push("/login");
      } else {
        notification.error({
          title: "Erro no cadastro",
          description:
            result.error || "Ocorreu um erro ao realizar o cadastro.",
        });
      }
    } catch (err) {
      console.error("Erro no cadastro:", err);
      notification.error({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao criar a conta. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: FormErrorFields) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <section className="m-auto! min-w-[500px]! block! flex! flex-col! gap-4! items-center! justify-center! bg-fundo-secundario! p-10! rounded-lg!">
      <h1 className="font-bold text-titulo2 text-primaria">Novo Cadastro</h1>
      <Form
        form={form}
        layout="vertical"
        className="space-y-8! w-full!"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Nome Completo"
          name="nome"
          rules={[{ required: true, message: "Por favor, digite seu nome!" }]}
        >
          <Input size="large" placeholder="Ex: Maria Silva" />
        </Form.Item>

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

        <Divider className="bg-texto/10" />

        <Form.Item
          label="Senha"
          name="senha"
          rules={[
            { required: true, message: "Por favor, digite sua senha!" },
            { min: 6, message: "A senha deve ter no mínimo 6 caracteres!" },
          ]}
        >
          <Input.Password
            size="large"
            placeholder="Crie uma senha forte (mín. 6 caracteres)"
          />
        </Form.Item>
        <Form.Item
          label="Confirmação de Senha"
          name="confirmacaoSenha"
          dependencies={["senha"]}
          rules={[
            { required: true, message: "Confirmação de senha obrigatória!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("senha") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("As senhas não coincidem!"));
              },
            }),
          ]}
        >
          <Input.Password size="large" placeholder="Confirme sua senha" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="w-full! mx-auto!"
          loading={loading}
        >
          Cadastrar
        </Button>
      </Form>
    </section>
  );
}
