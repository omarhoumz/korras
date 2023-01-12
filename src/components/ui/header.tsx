import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Header() {
  const router = useRouter()

  const isSignInPage = router.pathname === '/sign-in'

  return (
    <header className='flex h-12 items-center justify-between px-4 py-2'>
      <Link href='/'>korras.app</Link>

      <nav>{isSignInPage ? null : <Link href='/sign-in'>Sign in</Link>}</nav>
    </header>
  )
}
