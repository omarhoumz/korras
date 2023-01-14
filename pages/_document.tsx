import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head />
      <body className='dark:bg-slate-800 dark:text-slate-100'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
