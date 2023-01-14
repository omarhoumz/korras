import type { UserCredential } from 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'

import Head from '@/components/head'
import Header from '@/components/ui/header'
import { auth } from '@/lib/firebase/auth'

const provider = new GoogleAuthProvider()

export default function SignInPage() {
  return (
    <>
      <Head title='Sign in' />

      <Header />

      <main className='flex flex-col items-center gap-4 py-12'>
        <h1 className='text-2xl font-semibold'>Sign in</h1>

        <SignIn />
      </main>
    </>
  )
}

const SignIn = () => {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  async function signInWithGooglePopup() {
    const result = (await signInWithPopup(auth, provider).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code
      const errorMessage = error.message
      // The email of the user's account used.
      const email = error.customData.email
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error)
      console.log(
        `code:${errorCode} :: message:${errorMessage} :: email:${email} :: ${credential}`,
      )
    })) as UserCredential

    const credential = GoogleAuthProvider.credentialFromResult(result)
    if (!credential) {
      return
    }

    const token = credential.accessToken

    await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
  }

  if (loading) {
    return <p>Loading ...</p>
  }

  if (user) {
    router.push('/')

    return <p>Already signed in</p>
  }

  return (
    <>
      <button
        className='rounded bg-blue-600 px-4 py-2 text-white'
        onClick={signInWithGooglePopup}
      >
        Sign in with google
      </button>
    </>
  )
}
