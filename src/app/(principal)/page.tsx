import { Suspense } from "react";
import Calendario from "@/src/components/features/home/Calendario";
import ListaTarefas from "@/src/components/features/home/ListaTarefas";

export default function Home() {
  return (
    <div>
      <section className="grid grid-cols-8 gap-8">
        <Suspense
          fallback={
            <div className="col-span-8 xl:col-span-6 min-h-[400px] flex flex-col items-center justify-center bg-fundo-secundario rounded-lg shadow-sm p-5">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-solid border-blue-500 border-t-transparent animate-spin"></div>
                <p className="text-texto-secundaria text-paragrafo font-medium">
                  Carregando calendário...
                </p>
              </div>
            </div>
          }
        >
          <Calendario className="col-span-8 xl:col-span-6" />
        </Suspense>

        <Suspense
          fallback={
            <div className="col-span-8 xl:col-span-2 min-h-[400px] flex flex-col items-center justify-center bg-fundo-secundario rounded-lg shadow-sm p-5">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-solid border-blue-500 border-t-transparent animate-spin"></div>
                <p className="text-texto-secundaria text-paragrafo font-medium">
                  Carregando agenda...
                </p>
              </div>
            </div>
          }
        >
          <ListaTarefas className="col-span-8 xl:col-span-2" />
        </Suspense>
      </section>
    </div>
  );
}

