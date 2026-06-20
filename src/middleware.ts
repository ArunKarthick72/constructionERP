export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/suppliers/:path*',
    '/materials/:path*',
    '/projects/:path*',
    '/financials/:path*',
    '/purchases/:path*',
    '/material-usage/:path*',
    '/employees/:path*',
    '/salaries/:path*',
    '/warehouse/:path*',
    '/small-works/:path*',
    '/reports/:path*',
  ],
}
