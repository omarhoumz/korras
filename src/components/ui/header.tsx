import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'

import { auth } from '@/lib/firebase/auth'

export default function Header() {
  const router = useRouter()
  const [user] = useAuthState(auth)

  const isSignInPage = router.pathname === '/sign-in'

  async function handleSignOut() {
    await auth.signOut().catch((error) => {
      // Handle Errors here.
      const errorCode = error.code
      const errorMessage = error.message
      console.log(`code:${errorCode} :: message:${errorMessage}`)
    })

    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return (
    <header className='flex h-12 items-center justify-between px-4 py-2'>
      <Link href='/'>korras.app</Link>

      <nav>
        {isSignInPage ? null : user ? (
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className='h-7 w-7 rounded-full border'
                alt={user.displayName ?? ''}
                src={user.photoURL ?? ''}
              />
              <span className='text-sm text-slate-700'>{user.displayName}</span>
            </div>

            <button onClick={handleSignOut} className='hover:text-blue-700'>
              Sign out
            </button>
          </div>
        ) : (
          <div className='flex items-baseline gap-4'>
            <span
              className='text-xs text-slate-600'
              title='Changes are saved to your browser, sign in to save on the cloud'
            >
              (Sign in to save changes)
            </span>
            <Link href='/sign-in'>Sign in</Link>
          </div>
        )}
      </nav>
    </header>
  )
}
