export interface iFileAttachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  task_id?: string | null;
  step_id?: string | null;
  created_at?: string;
}

export interface iTaskStep {
  id: string;
  task_id: string;
  step_order: number;
  instruction: string;
  is_completed: boolean;
  updated_at: string;
  task_files?: iFileAttachment[];
}

export interface iCategory {
  id: string;
  name: string;
  created_at?: string;
}

export interface iTask {
  id: string;
  title: string;
  description: string;
  due_date: string;
  is_completed: boolean;
  category_id: string;
  categories?: {
    name: string;
  } | null;
  task_steps?: iTaskStep[];
  task_files?: iFileAttachment[];
  user_id?: string;
  created_at?: string;
}

export interface iMainTask extends iTask {
  task_steps: iTaskStep[];
  task_files: iFileAttachment[];
}
