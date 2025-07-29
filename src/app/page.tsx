"use client";
import {
  Card,
  CardContent,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

/* backend schema for data */
type PnlPoint = {
  equity: number;
  cash: number;
  inventory: number;
};

type TickerPoint = {
  mid: number;
  bid: number;
  ask: number;
  ts: number;
};

type Order = {
  oid: string;
  side: string;
  px: number;
  qty: number;
};

type DailyPnl = {
  day: string;
  realised: number;
  unrealised: number;
  equity: number;
};

export default function Home() {
  const [points, setPoints] = useState<PnlPoint[]>([]);
  const [btcPrice, setBtcPrice] = useState<TickerPoint>({
    mid: 0,
    bid: 0,
    ask: 0,
    ts: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [dailyPnl, setDailyPnl] = useState<DailyPnl>({
    day: "",
    realised: 0,
    unrealised: 0,
    equity: 0,
  });
  useEffect(() => {
    const fetchDailyPnl = async () => {
      try {
        const res = await fetch("https://white-field-1977.fly.dev/pnl");
        const json = await res.json(); // { day, realised, unrealised, equity }

        setDailyPnl({
          day: json.day,
          realised: Number(json.realised),
          unrealised: Number(json.unrealised),
          equity: Number(json.equity),
        });
      } catch (err) {
        console.error("Failed to fetch daily PnL:", err);
      }
    };

    fetchDailyPnl(); // immediate first call
    const id = setInterval(fetchDailyPnl, 10_000); // every 10 s
    return () => clearInterval(id); // cleanup on unmount
  }, []);
  useEffect(() => {
    const src = new EventSource(
      "https://white-field-1977.fly.dev/stream/orders"
    );

    src.onmessage = (e) => {
      const raw = JSON.parse(e.data);
      const data: Order[] = raw.map(
        (o: { oid: string; side: string; px: string; qty: string }) => ({
          oid: o.oid,
          side: o.side,
          px: Number(o.px),
          qty: Number(o.qty),
        })
      );

      setOrders(data);
    };

    src.onerror = (e) => {
      console.error("EventSource failed:", e);
    };

    return () => src.close();
  }, []);

  useEffect(() => {
    const src = new EventSource("https://white-field-1977.fly.dev/stream/pnl");

    src.onmessage = (e) => {
      const raw = JSON.parse(e.data);

      // Convert each field to a number so `.toFixed()` works
      const data: PnlPoint = {
        equity: Number(raw.equity),
        cash: Number(raw.cash),
        inventory: Number(raw.inventory),
      };

      setPoints(() => [data]);
    };

    src.onerror = (e) => {
      console.error("EventSource failed:", e);
    };

    return () => src.close();
  }, []);

  useEffect(() => {
    const src = new EventSource(
      "https://white-field-1977.fly.dev/stream/ticker"
    );

    src.onmessage = (e) => {
      const raw = JSON.parse(e.data);

      // Convert each field to a number so `.toFixed()` works
      const data: TickerPoint = {
        mid: Number(raw.mid),
        bid: Number(raw.bid),
        ask: Number(raw.ask),
        ts: Number(raw.ts),
      };

      setBtcPrice(data);
    };

    src.onerror = (e) => {
      console.error("EventSource failed:", e);
    };

    return () => src.close();
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-4 sm:p-20">
      <main className="flex flex-col gap-2 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Nils&apos; BTC Trading Bot</h1>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>BTC Price</CardTitle>
            <CardDescription>
              <span key={btcPrice.mid} className="animate-[flash_0.3s]">
                {btcPrice.mid.toFixed(5)}
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Current holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {points.map((p, i) => (
              <div key={i} className="flex flex-row gap-2 w-full">
                <Card className="w-[140px]">
                  <CardHeader>
                    <CardTitle>Equity</CardTitle>
                    <CardDescription>
                      <span key={p.equity} className="animate-[flash_0.3s]">
                        {p.equity.toFixed(2)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="w-[140px]">
                  <CardHeader>
                    <CardTitle>Cash</CardTitle>
                    <CardDescription>
                      <span key={p.cash} className="animate-[flash_0.3s]">
                        {p.cash.toFixed(2)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="w-[140px]">
                  <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>
                      <span key={p.inventory} className="animate-[flash_0.3s]">
                        {p.inventory.toFixed(2)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Current Active Orders</CardTitle>
            <CardDescription>
              {orders.map((o) => (
                <div key={o.oid}>
                  Type: {o.side} Price:
                  <span key={o.px} className="animate-[flash_0.3s]">
                    {o.px.toFixed(5)}
                  </span>
                  <br />
                  Qty: {o.qty.toFixed(5)}
                  <br />
                </div>
              ))}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Daily PnL</CardTitle>
            <CardDescription>
              <span key={dailyPnl.equity} className="animate-[flash_0.3s]">
                {dailyPnl.equity.toFixed(2)}
              </span>
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.linkedin.com/in/nils-selte/?locale=en_US"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to my LinkedIn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/nilsvselte"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/github-mark.svg"
            alt="github icon"
            width={16}
            height={16}
          />
          Go to my github
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/nilsvselte/mm_bot_public"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/github-mark.svg"
            alt="github icon"
            width={16}
            height={16}
          />
          Go to the backend
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/nilsvselte/mm-bot-frontend"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/github-mark.svg"
            alt="github icon"
            width={16}
            height={16}
          />
          Go to the frontend
        </a>
      </footer>
    </div>
  );
}
