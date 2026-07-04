"use client";

import { useEffect, useState } from "react";
import { App, Button, Form, Switch } from "antd";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  AlignVerticalSpaceAround,
  CaseSensitive,
  Contrast,
  LayoutTemplate,
  ShieldAlert,
  SquareMousePointer,
} from "lucide-react";

interface BooleanInputProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
}

const TipoInterfaceInput = ({ value, onChange }: BooleanInputProps) => (
  <div className="grid! grid-cols-1! lg:grid-cols-2! w-full! gap-5! items-center">
    <Button
      size="large"
      variant={value === false ? undefined : "outlined"}
      type={value === false ? "primary" : "default"}
      onClick={() => onChange?.(false)}
      className="text-xl! h-20! font-semibold!"
    >
      Modo Padrão
    </Button>
    <Button
      size="large"
      variant={value === true ? undefined : "outlined"}
      type={value === true ? "primary" : "default"}
      onClick={() => onChange?.(true)}
      className="text-xl! h-20! font-semibold!"
    >
      Modo Simples
    </Button>
  </div>
);

interface TamanhoFonteInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

const TamanhoFonteInput = ({ value, onChange }: TamanhoFonteInputProps) => (
  <div className="grid! grid-cols-1! lg:grid-cols-3! gap-5! items-center">
    <Button
      size="large"
      variant={value === "padrao" ? undefined : "outlined"}
      type={value === "padrao" ? "primary" : "default"}
      onClick={() => onChange?.("padrao")}
      className="text-lg! h-20! px-2!"
      icon={<CaseSensitive size={30} />}
    >
      Padrão
    </Button>
    <Button
      size="large"
      variant={value === "grande" ? undefined : "outlined"}
      type={value === "grande" ? "primary" : "default"}
      onClick={() => onChange?.("grande")}
      className="text-xl! h-20! px-2!"
      icon={<CaseSensitive size={30} />}
    >
      Grande
    </Button>
    <Button
      size="large"
      variant={value === "muito-grande" ? undefined : "outlined"}
      type={value === "muito-grande" ? "primary" : "default"}
      onClick={() => onChange?.("muito-grande")}
      className="text-2xl! h-20! px-2! text-wrap!"
      icon={<CaseSensitive size={34} />}
    >
      Muito Grande
    </Button>
  </div>
);

const EspacamentoInput = ({ value, onChange }: BooleanInputProps) => (
  <div className="grid! grid-cols-1! lg:grid-cols-2! gap-5! items-center">
    <Button
      size="large"
      variant={value === false ? undefined : "outlined"}
      type={value === false ? "primary" : "default"}
      onClick={() => onChange?.(false)}
      className="text-xl! h-20! font-semibold!"
    >
      Confortável
    </Button>
    <Button
      size="large"
      variant={value === true ? undefined : "outlined"}
      type={value === true ? "primary" : "default"}
      onClick={() => onChange?.(true)}
      className="text-xl! h-20! font-semibold!"
    >
      Amplo
    </Button>
  </div>
);

export default function FormConfig() {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { preferences, updatePreferences } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Carrega as configurações do banco no formulário
  useEffect(() => {
    if (preferences) {
      form.setFieldsValue({
        tipo_interface: preferences.ui_mode ?? false,
        tamanhoFonte: preferences.font_size ?? "padrao",
        contraste: preferences.contrast_level ?? false,
        espacamento: preferences.high_element_spacing ?? false,
        interacao: preferences.visual_feedback ?? true,
        seguranca: preferences.extra_confirm ?? false,
      });
    }
  }, [preferences, form]);

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const result = await updatePreferences({
        ui_mode: values.tipo_interface,
        font_size: values.tamanhoFonte,
        contrast_level: values.contraste,
        high_element_spacing: values.espacamento,
        visual_feedback: values.interacao,
        extra_confirm: values.seguranca,
        has_configured: true, // Registra que o usuário configurou suas preferências
      });

      if (result.success) {
        message.success("Configurações de acessibilidade salvas com sucesso!");
        router.push("/");
      } else {
        message.error("Erro ao salvar configurações: " + result.error);
      }
    } catch (err) {
      console.error(err);
      message.error("Ocorreu um erro ao salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto! block! w-full! xl:w-[80%] lg:w-[90%]">
      <Form
        layout="vertical"
        className="grid! lg:grid-cols-2! gap-x-10! lg:gap-x-30! gap-y-5"
        form={form}
        onFinish={onFinish}
      >
        <div>
          <h3 className="flex items-center gap-2 font-semibold! text-titulo2! mb-2">
            <LayoutTemplate /> Modo de Interface
          </h3>
          <Form.Item name="tipo_interface">
            <TipoInterfaceInput />
          </Form.Item>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-semibold! text-titulo2! mb-2">
            <CaseSensitive /> Tamanho da fonte
          </h3>
          <Form.Item name="tamanhoFonte">
            <TamanhoFonteInput />
          </Form.Item>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-semibold! text-titulo2! mb-2">
            <Contrast />
            Contraste
          </h3>
          <div className="flex items-center justify-between gap-10 bg-fundo-secundario p-5! rounded-md w-[fit-content] text-xl! w-full">
            Contraste alto
            <Form.Item name="contraste" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-semibold! text-titulo2! mb-2">
            <AlignVerticalSpaceAround />
            Espaçamento
          </h3>
          <Form.Item name="espacamento">
            <EspacamentoInput />
          </Form.Item>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-semibold! text-titulo2! mb-2">
            <SquareMousePointer />
            Interação
          </h3>
          <div className="flex items-center justify-between gap-10 bg-fundo-secundario p-5! rounded-md w-[fit-content] text-xl! w-full">
            Feedback visual reforçado
            <Form.Item
              name="interacao"
              valuePropName="checked"
              noStyle
            >
              <Switch />
            </Form.Item>
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-semibold! text-titulo2! mb-2">
            <ShieldAlert />
            Segurança
          </h3>
          <div className="flex items-center justify-between gap-10 bg-fundo-secundario p-5! rounded-md w-[fit-content] text-xl! w-full!">
            Confirmar antes de apagar
            <Form.Item name="seguranca" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>
        </div>

        <Form.Item className="col-span-2 mt-8">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={saving}
            className="w-[80%]! md:w-[60%]! lg:w-[50%]! mx-auto! block! text-xl! font-semibold!"
          >
            Salvar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

