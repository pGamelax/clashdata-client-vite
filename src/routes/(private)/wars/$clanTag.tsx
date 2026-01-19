import { apiFetch } from "@/lib/api";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ChartSpline, Sword, Swords, TrendingUp, Trophy } from "lucide-react";
import { columns } from "./-columns";
import { DataTable } from "./-data-table";
import { useEffect } from "react";

const clanStatsQueryOptions = (clanTag: string) =>
  queryOptions({
    queryKey: ["clan-stats", clanTag],
    queryFn: () =>
      apiFetch(
        `${import.meta.env.VITE_API_URL}/clans/clan-info?clanTag=${encodeURIComponent("#" + clanTag)}`,
      ),
  });

const clanWarsQueryOptions = (clanTag: string) =>
  queryOptions({
    queryKey: ["clan-wars", clanTag],
    queryFn: () =>
      apiFetch(
        `${import.meta.env.VITE_API_URL}/dashboard/data?clanTag=${encodeURIComponent("#" + clanTag)}`,
      ),
  });

export const Route = createFileRoute("/(private)/wars/$clanTag")({
  loader: async ({ context: { queryClient }, params }) => {
    try {
      await queryClient.ensureQueryData(clanStatsQueryOptions(params.clanTag));
      await queryClient.ensureQueryData(clanWarsQueryOptions(params.clanTag));
    } catch (error) {
      throw redirect({ to: "/sign-in" });
    }
  },

  component: RouteComponent,
});

function RouteComponent() {
  const { clanTag } = Route.useParams();

  const { data: clanStats } = useSuspenseQuery(clanStatsQueryOptions(clanTag));
  const { data: clanWars } = useSuspenseQuery(clanWarsQueryOptions(clanTag));

  const stats = [
    {
      label: "Vitórias",
      value: clanStats.warWins,
      icon: Trophy,
      color: "text-amber-500",
    },
    {
      label: "Derrotas",
      value: clanStats.warLosses,
      icon: Sword,
      color: "text-rose-500",
    },
    {
      label: "Total de Guerras",
      value: clanStats.warWins + (clanStats.warLosses || 0),
      icon: Swords,
      color: "text-indigo-500",
    },
    {
      label: "Taxa de Vitória",
      value:
        clanStats.warWins + clanStats.warLosses > 0
          ? `${((clanStats.warWins / (clanStats.warWins + clanStats.warLosses)) * 100).toFixed(1)}%`
          : "0%",
      icon: TrendingUp,
      color: "text-emerald-500",
    },
  ];

  useEffect(() => {
    document.title = "Wars | Clashdata";
  }, []);

  return (
    <div className="min-h-screen  bg-[#f8fafc] dark:bg-zinc-950 p-4 lg:p-8 text-slate-900 dark:text-slate-100">
      <div className=" container mx-auto space-y-8">
        <header className="flex flex-col gap-1 px-1">
          <div className="flex items-end gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight lg:text-4xl">
              {clanStats.name}
            </h1>
            <p className="text-sm text-muted-foreground bg-white dark:bg-zinc-800 rounded-2xl px-2 border border-border/40">
              {clanTag.replace("%23", "")}
            </p>
          </div>
          <p className="text-muted-foreground font-medium max-w-2xl">
            {clanStats.description}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="group relative flex flex-row justify-between md:flex-col bg-white dark:bg-zinc-900/50 rounded-3xl border border-border/50 shadow-sm p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col space-y-2 justify-between">
                  <div
                    className={`p-2 w-fit rounded-lg bg-white dark:bg-zinc-800 shadow-sm ${stat.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold tracking-tight mt-1">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="bg-primary/10 text-primary p-2 rounded-xl">
              <ChartSpline size={20} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Performance Detalhada
            </h2>
          </div>

          <div className="relative flex flex-col bg-white dark:bg-zinc-900/50 rounded-3xl border border-border/50 shadow-sm p-6">
            <DataTable columns={columns} data={clanWars.players} />
          </div>
        </div>
      </div>
    </div>
  );
}
