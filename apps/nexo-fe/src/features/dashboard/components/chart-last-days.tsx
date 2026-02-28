import { LineChart } from "@mui/x-charts/LineChart";
import Image from "next/image";

const sample = [1, 10, 30, 50, 70, 90, 100];

export const ChartLastDays = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="flex flex-col p-6 rounded-lg bg-primary/5">
        <h3 className="text-lg font-bold">Visualizações dos últimos 30 dias</h3>
        <LineChart
          xAxis={[{ data: sample }]}
          yAxis={[
            { id: "linearAxis", scaleType: "linear", position: "left" },
            { id: "logAxis", scaleType: "log", position: "right" },
          ]}
          series={[
            { yAxisId: "linearAxis", data: sample, label: "linear" },
            { yAxisId: "logAxis", data: sample, label: "log" },
          ]}
          height={400}
        />
      </div>
      <div className="flex flex-col p-6 rounded-lg bg-primary/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Leads Recentes</h3>
          <a href="#" className="text-sm text-primary font-bold">
            Ver Todos
          </a>
        </div>
        <div>
          <ul className="space-y-4">
            <li className="flex items-center border rounded-lg p-2 gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Image
                  src="/images/avatar.jpg"
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-xs font-medium">João Silva</p>
                <p className="text-xs text-muted-foreground">
                  joao.silva@example.com
                </p>
                <p>
                  <span className="text-xs text-muted-foreground text-green-600">
                    Gostaria de fazer um visista ao imóvel na próxima.
                  </span>
                </p>
              </div>
            </li>
            <li className="flex items-center border rounded-lg p-2 gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Image
                  src="/images/avatar.jpg"
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-xs font-medium">João Silva</p>
                <p className="text-xs text-muted-foreground">
                  joao.silva@example.com
                </p>
                <p>
                  <span className="text-xs text-muted-foreground text-green-600">
                    Gostaria de fazer um visista ao imóvel na próxima.
                  </span>
                </p>
              </div>
            </li>
            <li className="flex items-center border rounded-lg p-2 gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Image
                  src="/images/avatar.jpg"
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-xs font-medium">João Silva</p>
                <p className="text-xs text-muted-foreground">
                  joao.silva@example.com
                </p>
                <p>
                  <span className="text-xs text-muted-foreground text-green-600">
                    Gostaria de fazer um visista ao imóvel na próxima.
                  </span>
                </p>
              </div>
            </li>
            <li className="flex items-center border rounded-lg p-2 gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Image
                  src="/images/avatar.jpg"
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-xs font-medium">João Silva</p>
                <p className="text-xs text-muted-foreground">
                  joao.silva@example.com
                </p>
                <p>
                  <span className="text-xs text-muted-foreground text-green-600">
                    Gostaria de fazer um visista ao imóvel na próxima.
                  </span>
                </p>
              </div>
            </li>
            <li className="flex items-center border rounded-lg p-2 gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Image
                  src="/images/avatar.jpg"
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-xs font-medium">João Silva</p>
                <p className="text-xs text-muted-foreground">
                  joao.silva@example.com
                </p>
                <p>
                  <span className="text-xs text-muted-foreground text-green-600">
                    Gostaria de fazer um visista ao imóvel na próxima.
                  </span>
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
