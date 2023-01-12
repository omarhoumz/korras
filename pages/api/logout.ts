import type { NextApiRequest, NextApiResponse } from 'next'
import cookie from 'cookie'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    }),
  )

  return res.status(200).json({ status: true })
}
