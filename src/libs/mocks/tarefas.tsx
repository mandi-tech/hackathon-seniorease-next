import { BookMarked, BriefcaseBusiness, Cross, House } from "lucide-react";

export const listaCategorias = [
  {
    value: "saude",
    label: "Saúde",
    icon: <Cross />,
  },
  {
    value: "trabalho",
    label: "Trabalho",
    icon: <BriefcaseBusiness />,
  },
  {
    value: "aprendizado",
    label: "Aprendizado",
    icon: <BookMarked />,
  },
  {
    value: "rotina",
    label: "Rotina",
    icon: <House />,
  },
];

export const listaStatus = [
  {
    value: "pendente",
    label: "Pendente",
    color: "var(--theme-primaria)",
  },
  {
    value: "em_andamento",
    label: "Em Andamento",
    color: "var(--theme-alerta)",
  },
  {
    value: "concluida",
    label: "Concluída",
    color: "var(--theme-sucesso)",
  },
  {
    value: "em_atraso",
    label: "Em Atraso",
    color: "var(--theme-perigo)",
  },
];
