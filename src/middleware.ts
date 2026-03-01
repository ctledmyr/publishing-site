import { defineMiddleware } from 'astro:middleware';
import { verifySessionCookie, SESSION_COOKIE_NAME } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Only intercept /admin routes
  if (!pathname.startsWith('/admin')) {
    return next();
  }

  // Allow the login and logout pages through without auth check
  const isPublicAdminRoute =
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    pathname === '/admin/logout' ||
    pathname.startsWith('/admin/logout/');

  if (isPublicAdminRoute) {
    return next();
  }

  // Check for session cookie
  const sessionCookie = context.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return context.redirect('/admin/login');
  }

  const secret = import.meta.env.SESSION_SECRET;
  const isValid = await verifySessionCookie(sessionCookie.value, secret);

  if (!isValid) {
    // Clear the invalid or expired cookie before redirecting
    context.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    return context.redirect('/admin/login');
  }

  return next();
});
