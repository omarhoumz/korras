import NextHead from 'next/head'

export default function Head({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  const metaTitle = title ? `${title} | korras.app` : 'korras.app'
  const metaDescription = description || 'Korras is a web app for your days.'

  return (
    <NextHead>
      <title>{metaTitle}</title>

      <link rel='icon' type='image/png' href='/korras-favicon.png' />

      <meta name='description' content={metaDescription} />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
    </NextHead>
  )
}
