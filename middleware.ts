import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (req.nextUrl.pathname.startsWith('/admin')) {
        return !!token?.isAdmin
      }
      return !!token
    },
  },
})

export const config = {
  matcher: ['/admin/:path*']
}
