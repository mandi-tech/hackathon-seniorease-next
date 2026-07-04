export interface iTarefaCrm {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  status: "concluida" | "pendente" | "em_andamento" | "em_atraso";
  categoria: string;
}

export interface iTarefa extends iTarefaCrm {
  descricao: string;
  upload: string;
  subtarefas: iSubtarefas[];
}

export interface iSubtarefas {
  id: string;
  titulo: string;
  status: "concluida" | "pendente" | "em_andamento" | "em_atraso";
  upload: string;
  hora: string;
  descricao: string;
}

export const tarefasFicticias: iTarefaCrm[] = [
  {
    id: "1",
    titulo: "Consulta Cardiologista",
    data: "23-06-2026", // Hoje
    hora: "09:00",
    status: "pendente",
    categoria: "saude",
  },
  {
    id: "2",
    titulo: "Aula de Japonês",
    data: "23-06-2026", // Hoje
    hora: "14:00",
    status: "em_andamento",
    categoria: "aprendizado",
  },
  {
    id: "3",
    titulo: "Reunião de Mentoria",
    data: "24-06-2026", // Amanhã
    hora: "10:00",
    status: "pendente",
    categoria: "trabalho",
  },
  {
    id: "4",
    titulo: "Pagar conta de luz",
    data: "15-06-2026", // Passado
    hora: "08:00",
    status: "concluida",
    categoria: "rotina",
  },
  {
    id: "5",
    titulo: "Caminhada matinal",
    data: "22-06-2026",
    hora: "07:00",
    status: "em_atraso",
    categoria: "saude",
  },
];
export const tarefasCompletasFicticias: iTarefa[] = [
  {
    id: "1",
    titulo: "Consulta Cardiologista",
    data: "23-06-2026",
    hora: "09:00",
    status: "pendente",
    categoria: "saude",
    descricao:
      "Consulta de rotina anual com o Dr. Carlos para avaliação dos exames de sangue e eletrocardiograma.",
    upload: "guia_consulta.pdf",
    subtarefas: [
      {
        id: "sub-1-1",
        titulo: "Separar exames de sangue antigos",
        status: "concluida",
        upload: "",
        hora: "08:15",
        descricao: "",
      },
      {
        id: "sub-1-2",
        titulo: "Colocar a carteirinha do plano na bolsa",
        status: "pendente",
        upload: "",
        hora: "08:30",
        descricao: "",
      },
      {
        id: "sub-1-3",
        titulo: "Listar remédios de uso contínuo para mostrar ao médico",
        status: "pendente",
        upload: "",
        hora: "08:45",
        descricao: "",
      },
    ],
  },
  {
    id: "2",
    titulo: "Aula de Japonês",
    data: "23-06-2026",
    hora: "14:00",
    status: "em_andamento",
    categoria: "aprendizado",
    descricao:
      "Estudar gramática e praticar escrita. Foco na revisão dos alfabetos e escrita correta de termos do cotidiano.",
    upload: "exercicio_licao_4.pdf",
    subtarefas: [
      {
        id: "sub-2-1",
        titulo: "Revisar kanjis da lição passada",
        status: "concluida",
        upload: "",
        hora: "13:15",
        descricao: "",
      },
      {
        id: "sub-2-2",
        titulo: "Treinar pronúncia com o áudio do CD",
        status: "pendente",
        upload: "",
        hora: "13:40",
        descricao: "",
      },
    ],
  },
  {
    id: "3",
    titulo: "Reunião de Mentoria",
    data: "24-06-2026",
    hora: "10:00",
    status: "pendente",
    categoria: "trabalho",
    descricao:
      "Sessão de mentoria para alinhamento profissional e revisão dos objetivos de desenvolvimento.",
    upload: "",
    subtarefas: [
      {
        id: "sub-3-1",
        titulo: "Anotar principais dúvidas da semana",
        status: "pendente",
        upload: "",
        hora: "09:30",
        descricao: "",
      },
      {
        id: "sub-3-2",
        titulo: "Organizar espaço de trabalho silencioso",
        status: "pendente",
        upload: "",
        hora: "09:50",
        descricao: "",
      },
    ],
  },
  {
    id: "4",
    titulo: "Pagar conta de luz",
    data: "15-06-2026",
    hora: "08:00",
    status: "concluida",
    categoria: "rotina",
    descricao:
      "Efetuar o pagamento via aplicativo do banco para evitar cobranças de juros no próximo mês.",
    upload: "comprovante_energia.pdf",
    subtarefas: [
      {
        id: "sub-4-1",
        titulo: "Copiar código de barras do boleto digital",
        status: "concluida",
        upload: "",
        hora: "07:50",
        descricao: "",
      },
      {
        id: "sub-4-2",
        titulo: "Conferir valor debitado no extrato",
        status: "concluida",
        upload: "",
        hora: "08:05",
        descricao: "",
      },
    ],
  },
  {
    id: "5",
    titulo: "Caminhada matinal",
    data: "22-06-2026",
    hora: "07:00",
    status: "em_atraso",
    categoria: "saude",
    descricao:
      "Caminhada de 30 minutos no parque para manter a saúde cardiovascular em dia.",
    upload: "",
    subtarefas: [
      {
        id: "sub-5-1",
        titulo: "Encher garrafa de água",
        status: "concluida",
        upload: "",
        hora: "06:45",
        descricao: "",
      },
      {
        id: "sub-5-2",
        titulo: "Fazer alongamento leve nas pernas",
        status: "pendente",
        upload: "",
        hora: "06:50",
        descricao: "",
      },
    ],
  },
];
