import { Cairo, Inter } from '@next/font/google'
import type { AppProps } from 'next/app'

import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })
const cairo = Cairo({ subsets: ['arabic'] })

export default function MyApp({ Component, pageProps }: AppProps) {
  const fontList = `${cairo.style.fontFamily.split(', ')[0]}, ${
    inter.style.fontFamily
  }, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`

  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${fontList};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
