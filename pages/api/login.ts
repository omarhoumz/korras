import type { NextApiRequest, NextApiResponse } from 'next'

import cookie from 'cookie'

const fiveMinutes = 5 * 60

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { token } = req.body

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: fiveMinutes,
      path: '/',
    }),
  )

  return res.status(200).json({ status: true })
}
