import NextHead from 'next/head'

export default function Head() {
  return (
    <NextHead>
      <title>korras.app</title>

      <meta
        name='description'
        content='Korras is a web app for tracking your habits.'
      />
      <link rel='icon' href='/favicon.ico' />
    </NextHead>
  )
}
