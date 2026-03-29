import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  let role = 'user';
  let subStatus = 'inactive';

  if (user) {
    const [profileRes, subRes] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase.from('subscriptions').select('status').eq('user_id', user.id).single()
    ]);
    role = profileRes.data?.role || 'user';
    subStatus = subRes.data?.status || 'inactive';
  }

  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/scores') ||
      pathname.startsWith('/draws') || pathname.startsWith('/charity') ||
      pathname.startsWith('/winnings') || pathname.startsWith('/settings') ||
      pathname.startsWith('/onboarding');
  const isPricingRoute = pathname === '/pricing' || pathname === '/pricing/success';
  const isBillingRoute = pathname === '/dashboard/billing';
  const isSettingsRoute = pathname.startsWith('/settings');

  // 1. Not logged in
  if (!user) {
    if (isAdminRoute || isDashboardRoute || isBillingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      if (!isAdminRoute) url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 2. Admin Logic
  if (role === 'admin') {
    // Admins cannot access auth routing or public pricing (since they have internal access)
    if (isPricingRoute || isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
    
    // If admin is accessing the dashboard, completely bypass subscription blocks
    if (isDashboardRoute) {
      return supabaseResponse;
    }

    // Admins naturally access /admin
    if (isAdminRoute) {
      return supabaseResponse;
    }
  }

  // 3. User Logic (role === 'user')
  if (role === 'user') {
    // Users cannot access admin panels
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = subStatus === 'active' ? '/dashboard' : '/dashboard/billing';
      return NextResponse.redirect(url);
    }

    // Users cannot access auth routes or public pricing (they have internal billing)
    if (isAuthRoute || isPricingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = subStatus === 'active' ? '/dashboard' : '/dashboard/billing';
      return NextResponse.redirect(url);
    }

    // Dashboard routing strictly based on subscription
    if (isDashboardRoute) {
      if (subStatus !== 'active') {
        // Inactive users can ONLY access billing and settings
        if (!isBillingRoute && !isSettingsRoute) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard/billing';
          return NextResponse.redirect(url);
        }
      } else {
        // Active users shouldn't be on /dashboard/billing
        if (isBillingRoute) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
