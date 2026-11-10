'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Cloud, CloudFog, CloudRain, CloudSun, Loader2, MapPin, Sun, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { fetchApiReadiness } from '@/lib/api/dashboard';
import { cn } from '@/lib/utils';

const CAMPUS_FALLBACK = {
  latitude: 22.5726,
  longitude: 88.3639,
  label: 'Kolkata, West Bengal',
} as const;

type WeatherSnapshot = {
  temperatureC: number;
  label: string;
  code: number;
};

type LocalContext = {
  placeName: string;
  weather: WeatherSnapshot;
  source: 'device' | 'campus';
};

function weatherFromCode(code: number): { label: string; Icon: typeof Sun } {
  if (code === 0) {
    return { label: 'Clear sky', Icon: Sun };
  }
  if (code <= 3) {
    return { label: 'Partly cloudy', Icon: CloudSun };
  }
  if (code === 45 || code === 48) {
    return { label: 'Foggy', Icon: CloudFog };
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { label: 'Rain', Icon: CloudRain };
  }
  if (code >= 95) {
    return { label: 'Thunderstorm', Icon: Zap };
  }
  return { label: 'Cloudy', Icon: Cloud };
}

async function fetchReversePlaceName(latitude: number, longitude: number): Promise<string> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('language', 'en');
  url.searchParams.set('count', '1');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error('reverse geocode failed');
  }
  const data = (await res.json()) as {
    results?: Array<{ name?: string; admin1?: string }>;
  };
  const hit = data.results?.[0];
  if (!hit?.name) {
    return CAMPUS_FALLBACK.label;
  }
  const region = hit.admin1 ? `, ${hit.admin1}` : '';
  return `${hit.name}${region}`;
}

async function fetchCurrentWeather(latitude: number, longitude: number): Promise<WeatherSnapshot> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error('weather fetch failed');
  }
  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
  };
  const code = data.current?.weather_code ?? 0;
  const temperatureC = Math.round(data.current?.temperature_2m ?? 0);
  const { label } = weatherFromCode(code);
  return { temperatureC, label, code };
}

async function resolveLocalContext(): Promise<LocalContext> {
  const tryCoords = async (
    latitude: number,
    longitude: number,
    source: 'device' | 'campus',
    placeFallback: string,
  ) => {
    const [placeName, weather] = await Promise.all([
      fetchReversePlaceName(latitude, longitude).catch(() => placeFallback),
      fetchCurrentWeather(latitude, longitude),
    ]);
    return { placeName, weather, source };
  };

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 300_000,
        });
      });
      return tryCoords(
        position.coords.latitude,
        position.coords.longitude,
        'device',
        CAMPUS_FALLBACK.label,
      );
    } catch {
      /* campus fallback */
    }
  }

  return tryCoords(
    CAMPUS_FALLBACK.latitude,
    CAMPUS_FALLBACK.longitude,
    'campus',
    CAMPUS_FALLBACK.label,
  );
}

type AdminDashboardContextCardProps = {
  showSystemStatus?: boolean;
};

export function AdminDashboardContextCard({ showSystemStatus = true }: AdminDashboardContextCardProps) {
  const reduceMotion = useReducedMotion();
  const [now, setNow] = useState(() => new Date());
  const [context, setContext] = useState<LocalContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'ready' | 'degraded' | 'unknown'>('unknown');

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([resolveLocalContext(), fetchApiReadiness()])
      .then(([value, readiness]) => {
        if (!cancelled) {
          setContext(value);
          setApiStatus(readiness);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const timeLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now),
    [now],
  );

  const dateHeadline = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(now),
    [now],
  );

  const dateSubline = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(now),
    [now],
  );

  const isoDate = now.toISOString().slice(0, 10);
  const weatherMeta = context ? weatherFromCode(context.weather.code) : null;
  const WeatherIcon = weatherMeta?.Icon ?? CloudSun;

  return (
    <motion.div
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-[var(--nestora-sage-muted)] bg-card shadow-sm',
        'lg:max-w-[19rem]',
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="border-b border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-cream)_40%,var(--card))] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <time className="block text-sm font-semibold text-foreground" dateTime={isoDate}>
              {dateHeadline}
            </time>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{dateSubline}</p>
          </div>
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,white)] text-[var(--nestora-forest)]"
            title={context?.weather.label ?? 'Weather'}
          >
            {loading ? (
              <Loader2 className="size-[1.125rem] animate-spin opacity-70" aria-hidden />
            ) : (
              <WeatherIcon className="size-[1.125rem]" aria-hidden />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        <p
          className="min-w-[9.5rem] text-[1.35rem] font-semibold leading-none tabular-nums tracking-tight text-[var(--nestora-forest)] sm:text-2xl"
          aria-live="polite"
          aria-label={`Current time ${timeLabel}`}
        >
          {timeLabel}
        </p>

        <h4 className="sr-only">Current weather</h4>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading weather…</p>
        ) : context ? (
          <p className="text-sm text-foreground">
            <span className="font-semibold tabular-nums">{context.weather.temperatureC}°C</span>
            <span className="text-muted-foreground"> · {context.weather.label}</span>
          </p>
        ) : null}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 text-[var(--nestora-sage)]" aria-hidden />
          <span className="truncate" title={context?.source === 'campus' ? 'Using campus default location' : undefined}>
            {loading ? 'Locating…' : (context?.placeName ?? CAMPUS_FALLBACK.label)}
          </span>
        </p>
      </div>

      {showSystemStatus ? (
        <div
          className="flex items-center justify-center gap-2 border-t border-[var(--nestora-sage-muted)]/70 bg-[color-mix(in_oklch,var(--nestora-sage-light)_25%,var(--card))] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--nestora-forest)]"
          role="status"
        >
          <span className="relative flex size-2 shrink-0" aria-hidden>
            {!reduceMotion ? (
              <motion.span
                className="absolute inset-0 rounded-full bg-[var(--nestora-gold)]"
                animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.15, 1] }}
                transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              />
            ) : (
              <span className="absolute inset-0 rounded-full bg-[var(--nestora-gold)]" />
            )}
          </span>
          {apiStatus === 'ready'
            ? 'System operational'
            : apiStatus === 'degraded'
              ? 'API degraded'
              : 'Checking API…'}
        </div>
      ) : null}
    </motion.div>
  );
}
