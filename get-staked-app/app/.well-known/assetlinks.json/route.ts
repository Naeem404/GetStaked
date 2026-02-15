import { NextResponse } from 'next/server'

// Android Asset Links for deep links (Phantom wallet)
export async function GET() {
  return NextResponse.json(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.getstaked.app',
          sha256_cert_fingerprints: [],
        },
      },
    ],
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
