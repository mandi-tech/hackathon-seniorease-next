"use client";

import Link from "next/link";
import { Avatar } from "antd";
import { useAuth } from "@/src/contexts/AuthContext";
import { getInitials } from "@/src/libs/utils/formatters";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";

export default function Navbar() {
  const { profile, user, signOut } = useAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <nav className="flex justify-center py-6 border-b border-primaria">
      <div className="flex justify-between items-center w-[90%] xl:w-[80%]">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primaria cursor-pointer">
            SeniorEase
          </h1>
        </Link>

        <div className="flex gap-8 items-center">
          <Link href="/acessibilidade" className=" text-paragrafo">
            <SettingOutlined /> Configurações
          </Link>
          <a
            href="#"
            onClick={handleLogout}
            className="text-vermelho! text-paragrafo"
          >
            <LogoutOutlined /> Sair
          </a>
          <div className="flex gap-2 items-center text-paragrafo">
            <Avatar
              style={{
                backgroundColor: "var(--theme-primaria)",
                color: "#fff",
              }}
            >
              {getInitials(profile?.name || user?.email)}
            </Avatar>
            <p className="font-medium">
              {profile?.name || user?.email || "Idoso"}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
