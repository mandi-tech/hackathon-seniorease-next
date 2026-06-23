"use client";

import { BookOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";

export interface iListaTarefasProps {
  className?: string;
}

export default function ListaTarefas({ className }: iListaTarefasProps) {
  return (
    <section className={className}>
      <h1 className="text-primaria text-titulo1 font-semibold mb-6">
        Agenda do dia
      </h1>
      <div className="min-h-[80vh] flex flex-col gap-8 justify-between">
        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="bg-fundo-secundario border-l-4 border-primaria p-3 rounded-lg shadow-sm flex gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primaria">
              <BookOutlined className="text-fundo-secundario! text-titulo3" />
            </div>
            <div>
              <h2 className="text-secundaria text-titulo3 font-semibold">
                Tarefa
              </h2>
              <p className="text-texto-secundaria text-paragrafo">
                Descrição da tarefa
              </p>
              <div className="flex items-center gap-1 text-texto-secundaria text-paragrafo">
                <ClockCircleOutlined />
                <p>08:00</p>
              </div>
            </div>
          </div>
          <div className="bg-fundo-secundario border-l-4 border-primaria p-3 rounded-lg shadow-sm flex gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primaria">
              <BookOutlined className="text-fundo-secundario! text-titulo3" />
            </div>
            <div>
              <h2 className="text-secundaria text-titulo3 font-semibold">
                Tarefa
              </h2>
              <p className="text-texto-secundaria text-paragrafo">
                Descrição da tarefa
              </p>
              <div className="flex items-center gap-1 text-texto-secundaria text-paragrafo">
                <ClockCircleOutlined />
                <p>09:00</p>
              </div>
            </div>
          </div>
          <div className="bg-fundo-secundario border-l-4 border-primaria p-3 rounded-lg shadow-sm flex gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primaria">
              <BookOutlined className="text-fundo-secundario! text-titulo3" />
            </div>
            <div>
              <h2 className="text-secundaria text-titulo3 font-semibold">
                Tarefa
              </h2>
              <p className="text-texto-secundaria text-paragrafo">
                Descrição da tarefa
              </p>
              <div className="flex items-center gap-1 text-texto-secundaria text-paragrafo">
                <ClockCircleOutlined />
                <p>10:00</p>
              </div>
            </div>
          </div>
        </div>
        <Button type="primary" size="large" className="w-full text-titulo3!">
          Nova Tarefa
        </Button>
      </div>
    </section>
  );
}
