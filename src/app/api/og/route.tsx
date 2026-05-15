import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const revalidate = 86400;

async function loadAvatar(): Promise<string | null> {
  try {
    const buf = await readFile(path.join(process.cwd(), 'public', 'avatar.jpg'));
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

const TAGS = ['JavaScript', 'Angular', 'Node.js', 'Python', 'Next.js'];

export async function GET() {
  const avatarSrc = await loadAvatar();

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, Arial, sans-serif', background: '#0d1f5c' }}>

        {/* Coloured accent strip */}
        <div style={{ display: 'flex', height: 10, width: '100%' }}>
          <div style={{ display: 'flex', flex: 1, background: '#e74c3c' }} />
          <div style={{ display: 'flex', flex: 1, background: '#2ecc71' }} />
          <div style={{ display: 'flex', flex: 1, background: '#3498db' }} />
          <div style={{ display: 'flex', flex: 1, background: '#f39c12' }} />
        </div>

        {/* Main body */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 80px', gap: 60, background: 'linear-gradient(135deg, #0d1f5c 0%, #1244a8 55%, #1a6fcd 100%)' }}>

          {/* Left — text */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

            {/* "Portfolio" label row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 14 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', width: 36, height: 36 }}>
                <div style={{ display: 'flex', width: 16, height: 16, background: '#e74c3c', borderRadius: '4px 0 0 0' }} />
                <div style={{ display: 'flex', width: 16, height: 16, background: '#2ecc71', borderRadius: '0 4px 0 0' }} />
                <div style={{ display: 'flex', width: 16, height: 16, background: '#3498db', borderRadius: '0 0 0 4px' }} />
                <div style={{ display: 'flex', width: 16, height: 16, background: '#f39c12', borderRadius: '0 0 4px 0' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 20, letterSpacing: 3 }}>PORTFOLIO</span>
            </div>

            {/* Name */}
            <div style={{ display: 'flex', color: '#ffffff', fontSize: 62, fontWeight: 800, lineHeight: 1.05, marginBottom: 14, letterSpacing: -1 }}>
              Nischal Bhandari
            </div>

            {/* Title */}
            <div style={{ display: 'flex', color: 'rgba(255,255,255,0.82)', fontSize: 26, marginBottom: 36, letterSpacing: 0.3 }}>
              Full Stack Developer &amp; IT Professional
            </div>

            {/* Tech tags */}
            <div style={{ display: 'flex', gap: 10 }}>
              {TAGS.map((tag) => (
                <div key={tag} style={{ display: 'flex', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 5, padding: '5px 14px', color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 500 }}>
                  {tag}
                </div>
              ))}
            </div>

          </div>

          {/* Right — avatar or initials */}
          {avatarSrc ? (
            <div style={{ display: 'flex', width: 192, height: 232, flexShrink: 0, border: '3px solid rgba(255,255,255,0.35)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <img src={avatarSrc} alt="Nischal Bhandari" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 192, height: 232, flexShrink: 0, border: '3px solid rgba(255,255,255,0.35)', borderRadius: 6, background: 'linear-gradient(135deg, #2c6fca, #1244a8)', color: '#fff', fontSize: 52, fontWeight: 900 }}>
              NB
            </div>
          )}

        </div>

        {/* Footer bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 80px', background: 'rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', width: 8, height: 8, borderRadius: '50%', background: '#2ecc71' }} />
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 17 }}>Open to Opportunities · Pokhara, Nepal</span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17 }}>nischalbhandari.com.np</span>
        </div>

      </div>
    ),
    { width: 1200, height: 630 }
  );
}
