import Calendario from "@/src/components/features/home/Calendario";
import ListaTarefas from "@/src/components/features/home/ListaTarefas";
export default function Home() {
  return (
    <div>
      <section className="grid grid-cols-8 gap-8">
        <Calendario className="col-span-8 xl:col-span-6"/>
        <ListaTarefas className="col-span-8 xl:col-span-2"/>
      </section>
    </div>
  );
}
