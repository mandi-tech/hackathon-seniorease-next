"use client";

import { Button, Calendar } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import "dayjs/locale/pt-br";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

dayjs.locale("pt-br");

export interface iCalendarioProps {
  className?: string;
}

export default function Calendario({ className }: iCalendarioProps) {
  const [value, setValue] = useState(() => dayjs());

  const handlePrevMonth = () => {
    setValue(value.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setValue(value.add(1, "month"));
  };

  const formatMonthYear = (date: dayjs.Dayjs) => {
    const month = date.format("MMMM");
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return `${capitalizedMonth} ${date.format("YYYY")}`;
  };

  return (
    <section className={className}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-primaria text-titulo1 font-semibold">Calendário de Atividades</h1>
        
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <Button 
            onClick={handlePrevMonth}
            className="flex items-center justify-center w-10 h-10 border border-primaria rounded-lg text-primaria hover:bg-primaria/5 transition-colors cursor-pointer"
            aria-label="Mês anterior"
            icon={<LeftOutlined />}
          />
          
          <span className="text-primaria text-titulo2 font-bold min-w-[150px] text-center">
            {formatMonthYear(value)}
          </span>
          
          <Button 
            onClick={handleNextMonth}
            className="flex items-center justify-center w-10 h-10 border border-primaria rounded-lg text-primaria hover:bg-primaria/5 transition-colors cursor-pointer"
            aria-label="Próximo mês"
            icon={<RightOutlined />}
          />
        </div>
      </div>

        <div className="bg-fundo-secundario p-5 rounded-lg shadow-sm">
            <Calendar 
                headerRender={() => null}
                value={value}
                onChange={(newValue) => setValue(newValue)}
                style={{
                    fontSize: "var(--text-paragrafo)",
                }}
            />
        </div>

    </section>
  );
}