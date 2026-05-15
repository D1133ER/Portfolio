import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url  = new URL(request.url);
  const size = Math.min(Math.max(parseInt(url.searchParams.get('size') ?? '192', 10), 16), 1024);

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d1f5c 0%, #1244a8 60%, #1a6fcd 100%)',
        borderRadius: Math.round(size * 0.18),
      }}>
        {/* Windows logo quadrants */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(size * 0.06) }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', width: Math.round(size * 0.42), height: Math.round(size * 0.42), gap: Math.round(size * 0.03) }}>
            <div style={{ display: 'flex', flex: 1, background: '#e74c3c', borderRadius: `${Math.round(size * 0.06)}px 0 0 0` }} />
            <div style={{ display: 'flex', flex: 1, background: '#2ecc71', borderRadius: `0 ${Math.round(size * 0.06)}px 0 0` }} />
            <div style={{ display: 'flex', flex: 1, background: '#3498db', borderRadius: `0 0 0 ${Math.round(size * 0.06)}px` }} />
            <div style={{ display: 'flex', flex: 1, background: '#f39c12', borderRadius: `0 0 ${Math.round(size * 0.06)}px 0` }} />
          </div>
          <div style={{
            color: '#ffffff',
            fontSize: Math.round(size * 0.19),
            fontWeight: 900,
            fontFamily: 'system-ui, Arial, sans-serif',
            letterSpacing: -0.5,
            lineHeight: 1,
          }}>
            NB
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
