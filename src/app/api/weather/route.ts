import { NextResponse } from 'next/server';

/**
 * Proxy for Open-Meteo weather API — keeps connect-src 'self' strict in CSP.
 * Coordinates: Pokhara, Nepal (28.2096°N, 83.9856°E)
 * Cached for 30 minutes at the CDN edge.
 */

export const revalidate = 1800; // 30 minutes

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear sky',          icon: '☀️'  },
  1:  { label: 'Mainly clear',       icon: '🌤️'  },
  2:  { label: 'Partly cloudy',      icon: '⛅'  },
  3:  { label: 'Overcast',           icon: '☁️'  },
  45: { label: 'Foggy',              icon: '🌫️'  },
  48: { label: 'Icy fog',            icon: '🌫️'  },
  51: { label: 'Light drizzle',      icon: '🌦️'  },
  53: { label: 'Drizzle',            icon: '🌦️'  },
  55: { label: 'Heavy drizzle',      icon: '🌧️'  },
  61: { label: 'Light rain',         icon: '🌧️'  },
  63: { label: 'Rain',               icon: '🌧️'  },
  65: { label: 'Heavy rain',         icon: '🌧️'  },
  71: { label: 'Light snow',         icon: '🌨️'  },
  73: { label: 'Snow',               icon: '❄️'  },
  75: { label: 'Heavy snow',         icon: '❄️'  },
  80: { label: 'Rain showers',       icon: '🌦️'  },
  81: { label: 'Heavy showers',      icon: '⛈️'  },
  95: { label: 'Thunderstorm',       icon: '⛈️'  },
  99: { label: 'Thunderstorm + hail',icon: '⛈️'  },
};

function classify(code: number) {
  // Find exact or nearest lower match
  const keys = Object.keys(WMO_CODES).map(Number).sort((a, b) => b - a);
  const match = keys.find((k) => k <= code);
  return WMO_CODES[match ?? 0] ?? { label: 'Unknown', icon: '🌡️' };
}

export async function GET() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=28.2096&longitude=83.9856' +
        '&current=temperature_2m,weather_code,wind_speed_10m' +
        '&timezone=Asia%2FKathmandu',
      { next: { revalidate: 1800 } },
    );

    if (!res.ok) throw new Error(`Open-Meteo: ${res.status}`);

    const data = await res.json() as {
      current: {
        temperature_2m:  number;
        weather_code:    number;
        wind_speed_10m:  number;
      };
    };

    const { temperature_2m, weather_code, wind_speed_10m } = data.current;
    const { label, icon } = classify(weather_code);

    return NextResponse.json({
      temp:    Math.round(temperature_2m),
      label,
      icon,
      wind:    Math.round(wind_speed_10m),
      city:   'Pokhara',
      country:'Nepal',
    });
  } catch (err) {
    console.warn('[Weather API] fetch failed:', err);
    return NextResponse.json(
      { temp: null, label: 'Unavailable', icon: '🌡️', wind: null, city: 'Pokhara', country: 'Nepal' },
      { status: 503 },
    );
  }
}
