"use client";

import { Button, Form, Radio, Switch } from "antd";

export default function FormConfig() {
  return (
    <div className="mx-auto! block! w-[70%]">
      <Form layout="vertical" className="grid grid-cols-2 gap-4">
        <Form.Item name="tipoInterface">
          <h3 className="font-semibold! text-titulo2!">Modo de Interface</h3>
          <Radio.Group
            options={[
              { value: "padrao", label: "Modo Padrão" },
              { value: "simples", label: "Modo Simples" },
            ]}
          />
        </Form.Item>
        <Form.Item name="tamanhoFonte">
          <h3 className="font-semibold! text-titulo2!">Tamanho da fonte</h3>
          <Radio.Group
            options={[
              { value: "pequeno", label: "Pequeno" },
              { value: "medio", label: "Médio" },
              { value: "grande", label: "Grande" },
            ]}
          />
        </Form.Item>
        <Form.Item name="contraste">
          <h3 className="font-semibold! text-titulo2!">Contraste alto</h3>
          <Switch />
        </Form.Item>
        <Form.Item name="espacamento">
          <h3 className="font-semibold! text-titulo2!">Espaçamento</h3>
          <Radio.Group
            options={[
              { value: "confortavel", label: "Confortável" },
              { value: "amplo", label: "Amplo" },
            ]}
          />
        </Form.Item>
        <Form.Item name="interacao" rules={[{ required: true }]}>
          <h3 className="font-semibold! text-titulo2!">
            Interação - Feedback visual reforçado
          </h3>
          <Switch />
        </Form.Item>
        <Form.Item name="seguranca">
          <h3 className="font-semibold! text-titulo2!">
            Segurança - Confirmação de ações
          </h3>
          <Switch />
        </Form.Item>
        <Form.Item className="col-span-2 mt-8">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            className="w-90! mx-auto! block!"
          >
            Salvar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
