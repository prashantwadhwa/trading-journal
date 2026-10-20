import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import ImportCSV from "@/components/ImportCSV/ImportCSV";
import AddTradeModal from "@/components/AddTradeModal/AddTradeModal";
import { LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/context/AuthContext";

function DashNav({}) {
  const navigate = useNavigate();
  const { data: session, isPending } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    navigate("/");
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([getTrades(), getStats(), getEquityCurve()]);
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
      toast.error("Failed to refresh dashboard. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/55 fixed w-full backdrop-blur-md z-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <Link to={"/"}>
            <div className="text-lg font-semibold tracking-tight">
              Trading Journal
            </div>
          </Link>

          <div className="text-xs text-zinc-500">Your trading performance</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <ImportCSV onCsvAdded={refreshDashboard} />

            <AddTradeModal onTradeAdded={refreshDashboard} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-10 w-10 overflow-hidden rounded-full outline-none ring-offset-zinc-950 transition hover:ring-2 hover:ring-emerald-500 focus:ring-2 focus:ring-emerald-500">
              <img
                className="h-10 w-10 object-cover"
                src={`https://api.dicebear.com/10.x/marbles/svg?seed=${session.user.id}`}
                alt="User avatar"
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 border-zinc-800 bg-zinc-900 text-zinc-100"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="truncate text-sm font-medium text-zinc-100">
                      {session.user.name || "Trader"}
                    </span>

                    <span className="truncate text-xs font-normal text-zinc-500">
                      {session.user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-zinc-800" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer px-3 py-2 text-red-400! focus:bg-red-500/10 focus:text-red-400!"
              >
                <LogOut className="mr-2 h-4 w-4 stroke-red-400!" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default DashNav;
