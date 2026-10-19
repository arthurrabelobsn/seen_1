"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { OPEN_CHAT } from "../chat-widget";

export function Feedback() {
  const [vote, setVote] = useState<"sim" | "nao" | null>(null);
  return (
    <div className="mt-12 flex flex-col items-start gap-3 rounded-2xl border border-line p-5 sm:flex-row sm:items-center sm:justify-between">
      {vote ? (
        <p className="text-sm font-medium">
          {vote === "sim" ? (
            "Obrigado! Que bom que ajudou."
          ) : (
            <>
              Obrigado por avisar.{" "}
              <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CHAT))} className="font-semibold text-brand hover:underline">
                Pergunte ao assistente
              </button>{" "}
              ou fale com a equipe abaixo.
            </>
          )}
        </p>
      ) : (
        <>
          <p className="text-sm font-semibold">Este artigo ajudou?</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setVote("sim")} className="btn-ghost rounded-full">
              <ThumbsUp className="size-4" /> Sim
            </button>
            <button type="button" onClick={() => setVote("nao")} className="btn-ghost rounded-full">
              <ThumbsDown className="size-4" /> Não
            </button>
          </div>
        </>
      )}
    </div>
  );
}
