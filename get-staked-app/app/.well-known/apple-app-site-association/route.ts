import { NextResponse } from 'next/server'

// Apple App Site Association for universal links (Phantom wallet deep links)
export async function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appIDs: ['com.getstaked.app'],
            components: [
              {
                '/': '/phantom/*',
                comment: 'Phantom wallet deep link callbacks',
              },
            ],
          },
        ],
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
