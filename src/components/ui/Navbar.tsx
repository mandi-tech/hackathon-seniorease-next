"use client";

import Link from "next/link";
import { Avatar } from "antd";
import { useAuth } from "@/src/contexts/AuthContext";
import { getInitials } from "@/src/libs/utils/formatters";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { User } from "lucide-react";

export default function Navbar() {
  const { profile, user, signOut, preferences } = useAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <nav className="flex justify-center py-6 border-b border-primaria">
      <div className="flex justify-between items-center w-[95%]! lg:w-[80%]!">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primaria cursor-pointer">
            SeniorEase
          </h1>
        </Link>

        <div className="flex gap-8 items-center">
          <Link
            href="/perfil"
            className="flex items-center gap-2! text-primaria! text-paragrafo!"
          >
            <User className="text-titulo3!" />{" "}
            {preferences?.ui_mode ? "" : "Perfil"}
          </Link>
          <Link
            href="/login"
            onClick={handleLogout}
            className="text-perigo! text-paragrafo!"
          >
            <LogoutOutlined className="text-titulo3!" />{" "}
            {preferences?.ui_mode ? "" : "Sair"}
          </Link>
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
