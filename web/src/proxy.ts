import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    // ambiente ainda não configurado — deixa passar para não travar o setup
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isOnboarding = pathname.startsWith("/bem-vindo");
  // documentos e assets públicos: acessíveis antes de criar conta
  const isPublicDoc =
    pathname === "/privacidade" ||
    pathname === "/regras" ||
    pathname === "/opengraph-image" ||
    pathname.startsWith("/icon");

  // redirects precisam carregar os cookies que getUser() pode ter renovado,
  // senão o refresh de sessão se perde
  function redirectTo(path: string) {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  if (!user && !isOnboarding && !isPublicDoc) {
    return redirectTo("/bem-vindo");
  }

  if (user && pathname === "/bem-vindo") {
    return redirectTo("/");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
