import Link from "next/link";
import { Avatar } from "antd";
export default function Navbar() {
  return (
    <nav className="flex justify-center py-6 border-b border-primaria">
      <div className="flex justify-between items-center w-[90%] xl:w-[80%]">
        <h1 className="text-2xl font-bold text-primaria">SeniorEase</h1>

        <div className="flex gap-8 items-center">
          <Link href="/acessibilidade">Configurações</Link>
          <Link href="/login">Logout</Link>
          <div className="flex gap-2 items-center text-paragrafo">
            <Avatar>U</Avatar>
            <p>Nome do idoso</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
