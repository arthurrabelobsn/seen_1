import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Destino dos links enviados por e-mail (confirmação de conta e nova senha).
// Aceita os dois formatos do Supabase:
//  - ?code=...                 (PKCE: só funciona no mesmo navegador em que a conta foi criada)
//  - ?token_hash=...&type=...  (funciona em qualquer navegador; exige ajustar o template de e-mail)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const rawNext = searchParams.get("next") ?? "/calendario";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/calendario";

  const fail = (reason: string) => {
    const url = new URL("/login", origin);
    url.searchParams.set("erro", "link");
    url.searchParams.set("motivo", reason.slice(0, 200));
    return NextResponse.redirect(url);
  };

  // O próprio Supabase pode devolver o erro na URL (ex.: link já usado ou expirado)
  const supabaseError = searchParams.get("error_description") ?? searchParams.get("error");
  if (supabaseError) return fail(supabaseError);

  const supabase = await createClient();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail(error.message);
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return fail(
        error.message.toLowerCase().includes("verifier")
          ? "Abra o link no mesmo navegador em que você criou a conta."
          : error.message,
      );
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  return fail("O link não trouxe o código de confirmação.");
}
