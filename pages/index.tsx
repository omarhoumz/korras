import type { NextPage } from 'next'

import Header from '@/components/ui/header'
import Head from '@/components/head'
import EditorScreen from 'src/screens/editor-wrapper'

const Home: NextPage = () => {
  return (
    <>
      <Head />

      <Header />

      <EditorScreen />
    </>
  )
}

export default Home
