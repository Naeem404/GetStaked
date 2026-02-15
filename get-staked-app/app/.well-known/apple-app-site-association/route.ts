import { NextResponse } from 'next/server'

// Apple App Site Association for universal links (Phantom wallet deep links)
// NOTE: Replace YOUR_TEAM_ID with your actual Apple Developer Team ID
// Find it at: https://developer.apple.com/account → Membership → Team ID
export async function GET() {
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appIDs: [
              '6F7690FE15.com.getstaked.app',
            ],
            components: [
              {
                '/': '/phantom-auth-callback*',
                comment: 'Phantom wallet auth callback',
              },
              {
                '/': '/callback*',
                comment: 'General deep link callbacks',
              },
              {
                '/': '/*',
                comment: 'Catch-all for universal links',
              },
            ],
          },
        ],
      },
      webcredentials: {
        apps: [
          '6F7690FE15.com.getstaked.app',
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
