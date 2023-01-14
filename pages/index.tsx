import type { NextPage } from 'next'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRouter } from 'next/router'

import Header from '@/components/ui/header'
import Head from '@/components/head'
import EditorScreen from 'src/screens/editor-wrapper'
import { auth } from '@/lib/firebase/auth'

const Home: NextPage = () => {
  const router = useRouter()

  const [user, loading] = useAuthState(auth)

  if (loading) return <div>Loading...</div>

  if (!user) {
    router.push('/sign-in')

    return null
  }

  return (
    <>
      <Head />

      <Header />

      <EditorScreen />
    </>
  )
}

export default Home
