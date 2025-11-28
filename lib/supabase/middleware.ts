import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, allow the request through (will show error on page)
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Try to get user first
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // If getUser fails with "Auth session missing" but cookie exists, 
  // the cookie might need to be refreshed or the session re-established
  let isAuthenticated = !!user;
  if (!user && userError?.message === 'Auth session missing!') {
    // Check if auth cookie exists
    const authCookieName = request.cookies.getAll().find(c => 
      c.name.includes('auth-token') || c.name.startsWith('sb-')
    )?.name;
    
    if (authCookieName) {
      const authCookie = request.cookies.get(authCookieName);
      if (authCookie?.value) {
        console.log('[Middleware] Cookie exists but getUser() failed, cookie length:', authCookie.value.length);
        
        // Try to parse the cookie value to see if it's valid JSON
        try {
          const cookieData = JSON.parse(authCookie.value);
          if (cookieData.access_token) {
            console.log('[Middleware] Cookie contains access_token, but session not readable');
            // The cookie has the token but Supabase can't read it
            // This might be a cookie format issue - try to let it through and let the page handle it
            // Or we could try to manually set the session, but that's complex
          }
        } catch (e) {
          console.log('[Middleware] Cookie is not valid JSON, might be URL encoded');
        }
        
        // Try getSession as it might work even if getUser doesn't
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('[Middleware] getSession() succeeded even though getUser() failed');
          isAuthenticated = true;
        }
      }
    }
  }

  // If still not authenticated, try getSession as final fallback
  if (!isAuthenticated) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    isAuthenticated = !!session?.user;
    
    // Debug logging (remove in production)
    if (request.nextUrl.pathname.startsWith('/admin')) {
      console.log('[Middleware] Admin route check:', {
        path: request.nextUrl.pathname,
        hasUser: !!user,
        hasSession: !!session,
        isAuthenticated,
        userError: userError?.message,
        sessionError: sessionError?.message,
        cookies: request.cookies.getAll().map(c => c.name),
        cookieValues: request.cookies.getAll().map(c => ({ 
          name: c.name, 
          hasValue: !!c.value, 
          valueLength: c.value?.length || 0,
          valuePreview: c.value?.substring(0, 50) || 'empty'
        })),
      });
    }
  }

  if (
    !isAuthenticated &&
    !request.nextUrl.pathname.startsWith('/login') &&
    request.nextUrl.pathname.startsWith('/admin')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    console.log('[Middleware] No user/session found, redirecting to login');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}

