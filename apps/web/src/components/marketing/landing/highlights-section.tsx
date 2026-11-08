'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

import { highlightMetrics, highlightsCopy } from '@/components/marketing/landing/highlights-content';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const revealEase = [0.22, 1, 0.36, 1] as const;

function formatStatValue(
  n: number,
  metric: (typeof highlightMetrics)[number],
): string {
  const core = metric.formatThousands
    ? Math.round(n).toLocaleString('en-IN')
  : String(Math.round(n));
  return `${metric.prefix ?? ''}${core}${metric.suffix ?? ''}`;
}

export function HighlightsSection() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        sectionRef.current?.querySelectorAll('[data-stat-value]').forEach((el) => {
          const node = el as HTMLElement;
          const metricId = node.dataset.statId;
          const metric = highlightMetrics.find((m) => m.id === metricId);
          if (metric) {
            node.textContent = formatStatValue(metric.value, metric);
          }
        });
        return;
      }

      const statNodes = gsap.utils.toArray<HTMLElement>('[data-stat-value]', sectionRef.current);

      statNodes.forEach((node, index) => {
        const metricId = node.dataset.statId;
        const metric = highlightMetrics.find((m) => m.id === metricId);
        if (!metric) {
          return;
        }

        const counter = { val: 0 };
        gsap.to(counter, {
          val: metric.value,
          duration: 1.35,
          delay: index * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            once: true,
          },
          onUpdate: () => {
            node.textContent = formatStatValue(counter.val, metric);
          },
          onComplete: () => {
            node.textContent = formatStatValue(metric.value, metric);
          },
        });
      });

      gsap.from('[data-highlight-item]', {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="highlights"
      className="scroll-mt-24 border-y border-border bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))]"
      aria-labelledby="highlights-heading"
    >
      <div className="mx-auto max-w-[var(--container-marketing)] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: revealEase }}
        >
          <p className="text-label font-semibold uppercase tracking-[0.14em] text-[var(--nestora-tan)]">
            {highlightsCopy.eyebrow}
          </p>
          <h2
            id="highlights-heading"
            className="mt-3 text-balance text-h2 font-semibold tracking-tight text-[var(--nestora-forest)] sm:text-[2rem]"
          >
            {highlightsCopy.title}
          </h2>
          <p className="mt-4 text-pretty text-body leading-relaxed text-muted-foreground">
            {highlightsCopy.description}
          </p>
        </motion.div>

        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-0">
          {highlightMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <li
                key={metric.id}
                data-highlight-item
                className={cn(
                  'flex min-w-0 flex-col items-center text-center lg:items-start lg:px-8 lg:text-left',
                  index > 0 && 'lg:border-l lg:border-border',
                  index > 0 && 'sm:max-lg:border-t sm:max-lg:border-border sm:max-lg:pt-10',
                  index % 2 === 1 && 'sm:max-lg:pl-6',
                  index % 2 === 0 && index > 0 && 'sm:max-lg:pr-6',
                )}
              >
                <Icon className="size-5 text-primary" aria-hidden strokeWidth={2} />
                <p
                  data-stat-value
                  data-stat-id={metric.id}
                  className="mt-4 text-stat font-semibold tabular-nums tracking-tight text-[var(--nestora-forest)]"
                  aria-label={`${formatStatValue(metric.value, metric)} ${metric.label}`}
                >
                  {formatStatValue(0, metric)}
                </p>
                <p className="mt-2 text-label font-semibold text-foreground">{metric.label}</p>
                <p className="mt-1 max-w-[14rem] text-caption leading-relaxed text-muted-foreground">
                  {metric.description}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-center text-caption text-muted-foreground">{highlightsCopy.disclaimer}</p>
      </div>
    </section>
  );
}
