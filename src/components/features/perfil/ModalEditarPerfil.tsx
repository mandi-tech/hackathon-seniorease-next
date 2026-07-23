"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, App } from "antd";
import { User, Mail, Lock, Pen, Save, X } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";

export interface ModalEditarPerfilProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

interface FormValues {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export default function ModalEditarPerfil({
  open: externalOpen,
  onClose,
  onSuccess,
  trigger,
}: ModalEditarPerfilProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormValues>();
  const { notification } = App.useApp();
  const { profile, user, updateProfile } = useAuth();

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const currentName = profile?.name || user?.user_metadata?.name || "";
  const currentEmail = profile?.email || user?.email || "";

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        name: currentName,
        email: currentEmail,
        password: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, currentName, currentEmail, form]);

  const handleOpen = () => {
    if (!isControlled) setInternalOpen(true);
  };

  const handleClose = () => {
    if (!isControlled) setInternalOpen(false);
    onClose?.();
    form.resetFields();
  };

  const handleFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const result = await updateProfile({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password ? values.password.trim() : undefined,
      });

      if (result.success) {
        notification.success({
          title: "Perfil Atualizado",
          description: "Seus dados foram atualizados com sucesso!",
        });
        handleClose();
        onSuccess?.();
      } else {
        notification.error({
          title: "Erro ao Atualizar",
          description: result.error || "Não foi possível atualizar seus dados.",
        });
      }
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      notification.error({
        title: "Erro Inesperado",
        description: "Ocorreu um erro ao salvar as alterações.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={handleOpen}>{trigger}</span>
      ) : (
        <Button
          type="primary"
          icon={<Pen size={16} />}
          onClick={handleOpen}
          className="font-medium"
        >
          Editar Dados
        </Button>
      )}

      <Modal
        title={
          <div className="flex items-center gap-2 text-titulo2 text-secundaria font-bold border-b pb-3 border-fundo">
            <User className="text-primaria" size={24} />
            <span>Editar Dados do Perfil</span>
          </div>
        }
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        destroyOnClose
        centered
        className="max-w-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="mt-4 space-y-4"
        >
          {/* Nome */}
          <Form.Item
            label={
              <span className="text-paragrafo font-semibold text-secundaria flex items-center gap-1.5">
                <User size={16} /> Nome Completo
              </span>
            }
            name="name"
            rules={[
              { required: true, message: "Por favor, informe seu nome." },
              { min: 3, message: "O nome deve ter no mínimo 3 caracteres." },
            ]}
          >
            <Input
              size="large"
              placeholder="Digite seu nome completo"
              aria-label="Nome completo"
              className="text-paragrafo"
            />
          </Form.Item>

          {/* E-mail */}
          <Form.Item
            label={
              <span className="text-paragrafo font-semibold text-secundaria flex items-center gap-1.5">
                <Mail size={16} /> E-mail
              </span>
            }
            name="email"
            rules={[
              { required: true, message: "Por favor, informe seu e-mail." },
              { type: "email", message: "Informe um e-mail válido." },
            ]}
          >
            <Input
              size="large"
              placeholder="seuemail@exemplo.com"
              aria-label="E-mail"
              className="text-paragrafo"
            />
          </Form.Item>

          {/* Nova Senha */}
          <Form.Item
            label={
              <span className="flex items-center gap-2 font-medium text-texto">
                <Lock size={16} className="text-primaria" />
                Nova Senha (Opcional)
              </span>
            }
            name="password"
            rules={[
              {
                validator(_, value) {
                  if (!value || value.trim() === "") {
                    return Promise.resolve();
                  }

                  if (value.length < 8) {
                    return Promise.reject(
                      new Error("A senha deve ter no mínimo 8 caracteres."),
                    );
                  }
                  if (!/[A-Z]/.test(value)) {
                    return Promise.reject(
                      new Error(
                        "A senha deve conter pelo menos uma letra maiúscula.",
                      ),
                    );
                  }
                  if (!/[a-z]/.test(value)) {
                    return Promise.reject(
                      new Error(
                        "A senha deve conter pelo menos uma letra minúscula.",
                      ),
                    );
                  }
                  if (!/\d/.test(value)) {
                    return Promise.reject(
                      new Error("A senha deve conter pelo menos um número."),
                    );
                  }
                  if (!/[@$!%*?&]/.test(value)) {
                    return Promise.reject(
                      new Error(
                        "A senha deve conter pelo menos um caractere especial (@$!%*?&).",
                      ),
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Deixe em branco para manter a atual"
              aria-label="Nova senha"
              className="text-paragrafo"
            />
          </Form.Item>

          {/* Confirmar Nova Senha */}
          <Form.Item
            label={
              <span className="text-paragrafo font-semibold text-secundaria flex items-center gap-1.5">
                <Lock size={16} /> Confirmar Nova Senha
              </span>
            }
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const password = getFieldValue("password");
                  if (!password || !value || password === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("As senhas informadas não coincidem."),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Confirme sua nova senha"
              aria-label="Confirmar nova senha"
              className="text-paragrafo"
            />
          </Form.Item>

          {/* Botões do Formulário */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-fundo">
            <Button
              size="large"
              onClick={handleClose}
              icon={<X size={16} />}
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              icon={<Save size={16} />}
              className="font-bold px-6!"
            >
              Salvar Alterações
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
