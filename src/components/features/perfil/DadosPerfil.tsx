import { Avatar, Button } from "antd";
import { Pen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DadosPerfil() {
  const router = useRouter();
  return (
    <section className="w-full space-y-8">
      <h1 className="text-primaria text-titulo1 font-semibold mb-4">Perfil</h1>
      <section className="flex items-center gap-4">
        <Avatar size={70} />
        <div>
          <h2 className=" text-titulo2 font-semibold">Nome</h2>
          <p className="text-primaria text-titulo3">email</p>
        </div>
      </section>
      <section className="p-4 sm:p-6 bg-fundo-secundario rounded-xl">
        <div className="flex item-center justify-between">
          <h2 className="text-titulo2 font-semibold">
            Minhas Preferências de Acessibilidade
          </h2>
          <Button
            type="text"
            icon={<Pen />}
            className="text-primaria text-titulo3"
            onClick={() => router.push("/acessibilidade")}
          />
        </div>
      </section>
    </section>
  );
}
