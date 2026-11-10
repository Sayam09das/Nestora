import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicImages = join(root, 'public', 'images');

// 3840 x 2160 True 4K UHD Canvas
const W = 3840;
const H = 2160;

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap');
      * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .font-mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
    </style>

    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF9F5" />
      <stop offset="50%" stop-color="#F5F4EC" />
      <stop offset="100%" stop-color="#EFEFE6" />
    </linearGradient>

    <linearGradient id="sidebar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0C3B2E" />
      <stop offset="100%" stop-color="#082B22" />
    </linearGradient>

    <linearGradient id="brand-accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6D9773" />
      <stop offset="100%" stop-color="#BB8A52" />
    </linearGradient>

    <linearGradient id="active-nav-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#164C3C" />
      <stop offset="100%" stop-color="#0F3D30" />
    </linearGradient>

    <linearGradient id="card-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FCFCFA" />
    </linearGradient>

    <linearGradient id="sparkline-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#6D9773" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#6D9773" stop-opacity="0.0" />
    </linearGradient>

    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#0C3B2E" flood-opacity="0.04" />
      <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#0C3B2E" flood-opacity="0.03" />
    </filter>

    <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="${W}" height="${H}" fill="url(#bg-grad)" />

  <!-- Subtle Micro-Grid Overlay -->
  <g opacity="0.45">
    <path d="
      M 0 160 H ${W} M 0 320 H ${W} M 0 480 H ${W} M 0 640 H ${W} M 0 800 H ${W} M 0 960 H ${W} M 0 1120 H ${W} M 0 1280 H ${W} M 0 1440 H ${W} M 0 1600 H ${W} M 0 1760 H ${W} M 0 1920 H ${W} M 0 2080 H ${W}
      M 560 0 V ${H} M 760 0 V ${H} M 960 0 V ${H} M 1160 0 V ${H} M 1360 0 V ${H} M 1560 0 V ${H} M 1760 0 V ${H} M 1960 0 V ${H} M 2160 0 V ${H} M 2360 0 V ${H} M 2560 0 V ${H} M 2760 0 V ${H} M 2960 0 V ${H} M 3160 0 V ${H} M 3360 0 V ${H} M 3560 0 V ${H} M 3760 0 V ${H}
    " stroke="#0C3B2E" stroke-width="1" stroke-dasharray="2 18" opacity="0.3" />
  </g>

  <!-- Ambient Radiant Mesh Glows -->
  <circle cx="1600" cy="300" r="450" fill="#6D9773" opacity="0.08" filter="url(#soft-glow)" />
  <circle cx="2800" cy="800" r="550" fill="#BB8A52" opacity="0.07" filter="url(#soft-glow)" />

  <!-- ========================================================================= -->
  <!-- 1. LEFT SIDEBAR NAVIGATION (width: 540px, full height)                    -->
  <!-- ========================================================================= -->
  <g id="sidebar">
    <!-- Sidebar Container -->
    <rect x="0" y="0" width="540" height="${H}" fill="url(#sidebar-grad)" />
    <line x1="540" y1="0" x2="540" y2="${H}" stroke="#164C3C" stroke-width="2" />

    <!-- Brand Logo Lockup -->
    <g transform="translate(48, 54)">
      <!-- Squircle Mark -->
      <rect width="64" height="64" rx="16" fill="#164C3C" stroke="#6D9773" stroke-width="2" />
      <path d="M16 46 C24 51 40 51 48 46" stroke="#BB8A52" stroke-width="2.5" stroke-linecap="round" />
      <rect x="18" y="16" width="6" height="30" rx="3" fill="#6D9773" />
      <path d="M20 18 L44 42" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" />
      <rect x="40" y="16" width="6" height="30" rx="3" fill="#BB8A52" />
      <circle cx="30" cy="18" r="4" fill="#FFBA00" />

      <!-- Brand Text -->
      <text x="82" y="38" font-size="34" font-weight="800" fill="#FFFFFF" letter-spacing="-0.03em">
        Nest<tspan fill="#6D9773">ora</tspan>
      </text>
      <text x="84" y="58" font-size="12" font-weight="700" fill="#BB8A52" letter-spacing="0.22em" text-transform="uppercase">
        CAMPUS RESIDENTIAL OS
      </text>
    </g>

    <!-- Institution / Hostel Block Selector Dropdown -->
    <g transform="translate(40, 150)">
      <rect width="460" height="92" rx="18" fill="#123F32" stroke="#1D5C4A" stroke-width="1.5" />
      <circle cx="48" cy="46" r="22" fill="#1B5543" />
      <!-- Building Icon -->
      <path d="M38 56 V36 L48 30 L58 36 V56 H38 Z M44 44 H52 M44 50 H52" stroke="#6D9773" stroke-width="2" stroke-linecap="round" fill="none" />
      <text x="86" y="38" font-size="17" font-weight="700" fill="#FFFFFF">Sunrise Hall — Block B</text>
      <text x="86" y="60" font-size="13" font-weight="500" fill="#8BA391">Heritage University Campus</text>
      <!-- Dropdown Chevron -->
      <path d="M420 42 L426 48 L432 42" stroke="#8BA391" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </g>

    <!-- Section Heading: MANAGEMENT MODULES -->
    <text x="48" y="284" font-size="12" font-weight="700" fill="#5F7B6D" letter-spacing="0.18em" text-transform="uppercase">
      CORE WORKSPACES
    </text>

    <!-- Nav Item 1: Command Center (ACTIVE) -->
    <g transform="translate(32, 304)">
      <rect width="476" height="64" rx="14" fill="url(#active-nav-grad)" stroke="#1F6953" stroke-width="1.5" />
      <rect x="0" y="16" width="5" height="32" rx="2.5" fill="#6D9773" />
      <!-- Icon: Dashboard Grid -->
      <rect x="28" y="20" width="10" height="10" rx="2.5" fill="#6D9773" />
      <rect x="42" y="20" width="10" height="10" rx="2.5" fill="#6D9773" opacity="0.6" />
      <rect x="28" y="34" width="10" height="10" rx="2.5" fill="#6D9773" opacity="0.6" />
      <rect x="42" y="34" width="10" height="10" rx="2.5" fill="#6D9773" />
      <text x="68" y="39" font-size="16" font-weight="700" fill="#FFFFFF">Command Center</text>
      <!-- Badge: Live -->
      <rect x="390" y="21" width="56" height="22" rx="11" fill="#6D9773" />
      <text x="418" y="36" font-size="11" font-weight="800" fill="#0C3B2E" text-anchor="middle">LIVE</text>
    </g>

    <!-- Nav Item 2: Rooms & Bed Matrix -->
    <g transform="translate(32, 378)">
      <rect width="476" height="60" rx="14" fill="transparent" />
      <!-- Bed Icon -->
      <path d="M30 42 V26 M30 34 H50 M50 42 V22 M26 42 H54" stroke="#8BA391" stroke-width="2" stroke-linecap="round" fill="none" />
      <text x="68" y="37" font-size="16" font-weight="600" fill="#C5D3CA">Rooms &amp; Bed Allocations</text>
      <rect x="410" y="20" width="36" height="20" rx="10" fill="#164C3C" />
      <text x="428" y="34" font-size="11" font-weight="700" fill="#8BA391" text-anchor="middle">192</text>
    </g>

    <!-- Nav Item 3: Resident Dossiers & Admissions -->
    <g transform="translate(32, 448)">
      <rect width="476" height="60" rx="14" fill="transparent" />
      <!-- Users Icon -->
      <path d="M38 30 A5 5 0 1 0 38 20 A5 5 0 1 0 38 30 Z M28 42 C28 36 33 34 38 34 C43 34 48 36 48 42" stroke="#8BA391" stroke-width="2" stroke-linecap="round" fill="none" />
      <text x="68" y="37" font-size="16" font-weight="600" fill="#C5D3CA">Residents &amp; Admissions</text>
      <rect x="396" y="20" width="50" height="20" rx="10" fill="#164C3C" />
      <text x="421" y="34" font-size="11" font-weight="700" fill="#6D9773" text-anchor="middle">1,420</text>
    </g>

    <!-- Nav Item 4: Biometric Gate & Outing Passes -->
    <g transform="translate(32, 518)">
      <rect width="476" height="60" rx="14" fill="transparent" />
      <!-- Shield/Key Icon -->
      <path d="M38 22 L48 26 V33 C48 39 44 43 38 45 C32 43 28 39 28 33 V26 Z" stroke="#8BA391" stroke-width="2" stroke-linecap="round" fill="none" />
      <text x="68" y="37" font-size="16" font-weight="600" fill="#C5D3CA">Gate Passes &amp; Curfew</text>
      <rect x="406" y="20" width="40" height="20" rx="10" fill="#BB8A52" opacity="0.3" />
      <text x="426" y="34" font-size="11" font-weight="700" fill="#FFBA00" text-anchor="middle">12 !</text>
    </g>

    <!-- Nav Item 5: Night Attendance Radar -->
    <g transform="translate(32, 588)">
      <rect width="476" height="60" rx="14" fill="transparent" />
      <circle cx="38" cy="34" r="8" stroke="#8BA391" stroke-width="2" fill="none" />
      <path d="M38 30 V34 H42" stroke="#8BA391" stroke-width="2" stroke-linecap="round" />
      <text x="68" y="37" font-size="16" font-weight="600" fill="#C5D3CA">Night Curfew Attendance</text>
    </g>

    <!-- Nav Item 6: Dining & Mess Hall -->
    <g transform="translate(32, 658)">
      <rect width="476" height="60" rx="14" fill="transparent" />
      <!-- Fork & Spoon Icon -->
      <path d="M32 24 V34 M32 38 V44 M44 24 C44 28 41 34 38 34 V44" stroke="#8BA391" stroke-width="2" stroke-linecap="round" fill="none" />
      <text x="68" y="37" font-size="16" font-weight="600" fill="#C5D3CA">Mess Menu &amp; Diet Plan</text>
      <text x="420" y="37" font-size="13" font-weight="700" fill="#FFBA00">4.8★</text>
    </g>

    <!-- Nav Item 7: Grievances & Work Orders -->
    <g transform="translate(32, 728)">
      <rect width="476" height="60" rx="14" fill="transparent" />
      <!-- Wrench Icon -->
      <path d="M42 24 L46 28 L35 39 L31 35 Z M33 25 L35 27" stroke="#8BA391" stroke-width="2" stroke-linecap="round" fill="none" />
      <text x="68" y="37" font-size="16" font-weight="600" fill="#C5D3CA">Maintenance Tickets</text>
      <rect x="410" y="20" width="36" height="20" rx="10" fill="#E07A7A" opacity="0.3" />
      <text x="428" y="34" font-size="11" font-weight="700" fill="#FF9A9A" text-anchor="middle">3</text>
    </g>

    <!-- Nav Item 8: Fee Billing & Accounts -->
    <g transform="translate(32, 798)">
      <rect width="476" height="60" rx="14" fill="transparent" />
      <rect x="28" y="26" width="22" height="16" rx="3" stroke="#8BA391" stroke-width="2" fill="none" />
      <circle cx="39" cy="34" r="2.5" fill="#8BA391" />
      <text x="68" y="37" font-size="16" font-weight="600" fill="#C5D3CA">Fee Payments &amp; Dues</text>
    </g>

    <!-- Nav Item 9: Compliance & Audit Logs -->
    <g transform="translate(32, 868)">
      <rect width="476" height="60" rx="14" fill="transparent" />
      <path d="M30 24 H46 M30 32 H46 M30 40 H38" stroke="#8BA391" stroke-width="2" stroke-linecap="round" />
      <text x="68" y="37" font-size="16" font-weight="600" fill="#C5D3CA">Institutional Compliance</text>
    </g>

    <!-- Bottom Chief Warden Profile Card -->
    <g transform="translate(36, ${H - 140})">
      <rect width="468" height="96" rx="20" fill="#123F32" stroke="#1D5C4A" stroke-width="1.5" />
      <circle cx="54" cy="48" r="24" fill="#BB8A52" />
      <text x="54" y="55" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">KS</text>
      <text x="94" y="42" font-size="17" font-weight="700" fill="#FFFFFF">Dr. K. Sharma</text>
      <text x="94" y="64" font-size="13" font-weight="500" fill="#8BA391">Chief Resident Warden</text>
      <circle cx="430" cy="48" r="6" fill="#6D9773" />
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- 2. TOP APP BAR / HEADER (x: 540 to 3840, height: 130px)                   -->
  <!-- ========================================================================= -->
  <g id="header">
    <rect x="540" y="0" width="${W - 540}" height="130" fill="#FFFFFF" opacity="0.95" />
    <line x1="540" y1="130" x2="${W}" y2="130" stroke="#E7E7DC" stroke-width="1.5" />

    <!-- macOS Traffic Light Window Dots -->
    <g transform="translate(580, 54)">
      <circle cx="0" cy="0" r="9" fill="#FF5F56" />
      <circle cx="28" cy="0" r="9" fill="#FFBD2E" />
      <circle cx="56" cy="0" r="9" fill="#27C93F" />
    </g>

    <!-- Global Omnisearch Command Input (3840px scale) -->
    <g transform="translate(710, 32)">
      <rect width="880" height="66" rx="16" fill="#F5F4EC" stroke="#E1E8DF" stroke-width="1.5" />
      <!-- Search Icon -->
      <circle cx="34" cy="33" r="10" stroke="#718075" stroke-width="2.5" fill="none" />
      <line x1="42" y1="41" x2="52" y2="51" stroke="#718075" stroke-width="2.5" stroke-linecap="round" />
      <text x="70" y="40" font-size="17" font-weight="500" fill="#18352B">
        Jump to Resident, Room (e.g. &quot;B-202&quot;), Gate Pass #982, or Emergency Contact...
      </text>
      <rect x="800" y="18" width="56" height="30" rx="8" fill="#FFFFFF" stroke="#D5E3D6" stroke-width="1" />
      <text x="828" y="38" font-size="13" font-weight="700" fill="#718075" text-anchor="middle">⌘K</text>
    </g>

    <!-- Academic Term / System Sync Indicator -->
    <g transform="translate(1660, 42)">
      <rect width="360" height="46" rx="23" fill="#E8F0E8" stroke="#D5E3D6" stroke-width="1" />
      <circle cx="26" cy="23" r="5" fill="#6D9773" />
      <text x="44" y="29" font-size="14" font-weight="700" fill="#0C3B2E">
        Fall Semester 2026-27 · Week 8
      </text>
    </g>

    <!-- Top Right Action Cluster -->
    <g transform="translate(2680, 36)">
      <!-- Quick Button 1: Digital Gate Pass -->
      <g>
        <rect width="260" height="58" rx="14" fill="#FFFFFF" stroke="#D5E3D6" stroke-width="1.5" />
        <path d="M26 29 L38 29 M32 23 L32 35" stroke="#0C3B2E" stroke-width="2.5" stroke-linecap="round" />
        <text x="56" y="36" font-size="15" font-weight="700" fill="#0C3B2E">Issue Gate Pass</text>
      </g>

      <!-- Quick Button 2: Allocate Bed (Primary) -->
      <g transform="translate(280, 0)">
        <rect width="250" height="58" rx="14" fill="#0C3B2E" />
        <path d="M26 29 L38 29 M32 23 L32 35" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
        <text x="56" y="36" font-size="15" font-weight="700" fill="#FFFFFF">+ Allocate Bed</text>
      </g>

      <!-- Notifications Bell -->
      <g transform="translate(560, 4)">
        <rect width="50" height="50" rx="14" fill="#F5F4EC" stroke="#E1E8DF" stroke-width="1" />
        <path d="M25 15 C20 15 18 19 18 24 C18 29 16 31 14 32 H36 C34 31 32 29 32 24 C32 19 30 15 25 15 Z M22 33 C22 35 23.5 37 25 37 C26.5 37 28 35 28 33" stroke="#18352B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <circle cx="34" cy="16" r="5" fill="#E07A7A" />
      </g>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- 3. TOP KPI METRICS ROW (y: 170 to 390)                                    -->
  <!-- ========================================================================= -->
  <g id="kpi-row" transform="translate(580, 170)">
    <!-- KPI 1: Live Occupancy Rate -->
    <g transform="translate(0, 0)">
      <rect width="760" height="200" rx="24" fill="url(#card-grad)" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)" />
      <g transform="translate(44, 40)">
        <span class="badge">
          <rect width="130" height="32" rx="16" fill="#E8F0E8" />
          <circle cx="18" cy="16" r="5" fill="#6D9773" />
          <text x="32" y="21" font-size="12" font-weight="700" fill="#0C3B2E">OCCUPANCY</text>
        </span>
        <text x="0" y="86" font-size="52" font-weight="800" fill="#0C3B2E" letter-spacing="-0.03em">98.4%</text>
        <text x="0" y="124" font-size="16" font-weight="500" fill="#718075">
          1,180 / 1,200 Beds Occupied <tspan font-weight="700" fill="#6D9773">(20 Vacant)</tspan>
        </text>

        <!-- Mini Sparkline Wave -->
        <g transform="translate(440, 10)">
          <path d="M 0 60 C 40 60, 60 70, 90 40 C 120 10, 150 35, 190 15 C 210 5, 230 10, 240 0" stroke="#6D9773" stroke-width="4" stroke-linecap="round" fill="none" />
          <circle cx="240" cy="0" r="5" fill="#6D9773" />
          <text x="240" y="-12" font-size="13" font-weight="800" fill="#6D9773" text-anchor="end">↑ +1.8%</text>
        </g>
      </g>
    </g>

    <!-- KPI 2: Night Curfew Radar -->
    <g transform="translate(800, 0)">
      <rect width="760" height="200" rx="24" fill="url(#card-grad)" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)" />
      <g transform="translate(44, 40)">
        <rect width="160" height="32" rx="16" fill="#FFF3CF" />
        <circle cx="18" cy="16" r="5" fill="#BB8A52" />
        <text x="32" y="21" font-size="12" font-weight="700" fill="#8F5E00">CURFEW STATUS</text>
        <text x="0" y="86" font-size="52" font-weight="800" fill="#0C3B2E" letter-spacing="-0.03em">1,142</text>
        <text x="160" y="76" font-size="20" font-weight="600" fill="#718075">/ 1,180 present</text>
        <text x="0" y="124" font-size="16" font-weight="500" fill="#718075">
          38 on approved leave · <tspan font-weight="700" fill="#6D9773">0 Unaccounted</tspan>
        </text>

        <!-- Progress Gauge Bar -->
        <g transform="translate(440, 48)">
          <rect width="230" height="14" rx="7" fill="#E1E8DF" />
          <rect width="222" height="14" rx="7" fill="#0C3B2E" />
          <text x="230" y="-10" font-size="14" font-weight="800" fill="#0C3B2E" text-anchor="end">96.8% In-Dorm</text>
        </g>
      </g>
    </g>

    <!-- KPI 3: Daily Gate Passes Issued -->
    <g transform="translate(1600, 0)">
      <rect width="760" height="200" rx="24" fill="url(#card-grad)" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)" />
      <g transform="translate(44, 40)">
        <rect width="130" height="32" rx="16" fill="#E8F0E8" />
        <circle cx="18" cy="16" r="5" fill="#6D9773" />
        <text x="32" y="21" font-size="12" font-weight="700" fill="#0C3B2E">GATE PASSES</text>
        <text x="0" y="86" font-size="52" font-weight="800" fill="#0C3B2E" letter-spacing="-0.03em">186</text>
        <text x="110" y="76" font-size="20" font-weight="600" fill="#718075">active today</text>
        <text x="0" y="124" font-size="16" font-weight="500" fill="#718075">
          142 Day Outings · 32 Overnight · 12 Emergency
        </text>

        <!-- Biometric Badge -->
        <g transform="translate(480, 20)">
          <rect width="190" height="42" rx="12" fill="#F5F4EC" stroke="#D5E3D6" stroke-width="1" />
          <circle cx="24" cy="21" r="5" fill="#6D9773" />
          <text x="38" y="27" font-size="13" font-weight="700" fill="#0C3B2E">RFID + Fingerprint</text>
        </g>
      </g>
    </g>

    <!-- KPI 4: Grievance Resolution SLA -->
    <g transform="translate(2400, 0)">
      <rect width="760" height="200" rx="24" fill="url(#card-grad)" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)" />
      <g transform="translate(44, 40)">
        <rect width="120" height="32" rx="16" fill="#E8F0E8" />
        <circle cx="18" cy="16" r="5" fill="#6D9773" />
        <text x="32" y="21" font-size="12" font-weight="700" fill="#0C3B2E">SLA SPEED</text>
        <text x="0" y="86" font-size="52" font-weight="800" fill="#0C3B2E" letter-spacing="-0.03em">14m</text>
        <text x="120" y="76" font-size="20" font-weight="600" fill="#718075">avg turn-around</text>
        <text x="0" y="124" font-size="16" font-weight="500" fill="#718075">
          48/49 Resolved Today · <tspan font-weight="700" fill="#6D9773">98.0% SLA match</tspan>
        </text>

        <g transform="translate(500, 20)">
          <rect width="170" height="42" rx="12" fill="#E8F0E8" />
          <text x="85" y="27" font-size="14" font-weight="800" fill="#0C3B2E" text-anchor="middle">⚡ -78% faster</text>
        </g>
      </g>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- 4. CORE OPERATIONAL BENTO (y: 410 to 1420)                                 -->
  <!-- ========================================================================= -->

  <!-- LEFT SECTION (Width: 1940px): Interactive Room & Bed Matrix -->
  <g id="room-matrix" transform="translate(580, 410)">
    <rect width="1940" height="1020" rx="28" fill="#FFFFFF" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)" />

    <!-- Matrix Header -->
    <g transform="translate(50, 44)">
      <text x="0" y="24" font-size="24" font-weight="800" fill="#0C3B2E" letter-spacing="-0.02em">
        Floor 2 Room &amp; Bed Allocation Matrix
      </text>
      <text x="0" y="52" font-size="15" font-weight="500" fill="#718075">
        Block B East Wing · 64 Total Bed Capacity · Real-time occupancy &amp; resident dossiers
      </text>

      <!-- Floor Switcher Pills -->
      <g transform="translate(1420, 0)">
        <rect width="420" height="50" rx="14" fill="#F5F4EC" stroke="#E1E8DF" stroke-width="1" />
        <rect x="6" y="5" width="130" height="40" rx="10" fill="#FFFFFF" />
        <text x="71" y="30" font-size="14" font-weight="600" fill="#718075" text-anchor="middle">Floor 1 (48)</text>

        <rect x="144" y="5" width="136" height="40" rx="10" fill="#0C3B2E" />
        <text x="212" y="30" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">Floor 2 (64)</text>

        <text x="350" y="30" font-size="14" font-weight="600" fill="#718075" text-anchor="middle">Floor 3 (64)</text>
      </g>
    </g>

    <line x1="50" y1="126" x2="1890" y2="126" stroke="#E7E7DC" stroke-width="1" />

    <!-- 6 Rich Visual Room Cards Grid (3 cols x 2 rows) -->
    <!-- ROOM 201 -->
    <g transform="translate(50, 156)">
      <rect width="580" height="380" rx="20" fill="#FAFAF7" stroke="#E7E7DC" stroke-width="1.5" />
      <g transform="translate(32, 32)">
        <text x="0" y="22" font-size="24" font-weight="800" fill="#0C3B2E">Room 201</text>
        <rect x="380" y="0" width="136" height="32" rx="16" fill="#E8F0E8" />
        <text x="448" y="21" font-size="13" font-weight="800" fill="#0C3B2E" text-anchor="middle">2/2 OCCUPIED</text>
        <text x="0" y="54" font-size="14" font-weight="500" fill="#718075">Double Bed · Attached Balcony · AC</text>

        <!-- Resident 1 -->
        <g transform="translate(0, 90)">
          <rect width="516" height="96" rx="14" fill="#FFFFFF" stroke="#EAEAE2" stroke-width="1" />
          <circle cx="48" cy="48" r="22" fill="#0C3B2E" />
          <text x="48" y="55" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">AK</text>
          <text x="86" y="42" font-size="17" font-weight="700" fill="#0C3B2E">Aryan Kumar</text>
          <text x="86" y="66" font-size="13" font-weight="500" fill="#718075">Bed A · 2024-BCA-104 · Sem 3</text>
          <rect x="420" y="34" width="76" height="28" rx="14" fill="#E8F0E8" />
          <text x="458" y="52" font-size="11" font-weight="800" fill="#0C3B2E" text-anchor="middle">IN-DORM</text>
        </g>

        <!-- Resident 2 -->
        <g transform="translate(0, 204)">
          <rect width="516" height="96" rx="14" fill="#FFFFFF" stroke="#EAEAE2" stroke-width="1" />
          <circle cx="48" cy="48" r="22" fill="#BB8A52" />
          <text x="48" y="55" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">RS</text>
          <text x="86" y="42" font-size="17" font-weight="700" fill="#0C3B2E">Rohan Sharma</text>
          <text x="86" y="66" font-size="13" font-weight="500" fill="#718075">Bed B · 2024-BCA-182 · Sem 3</text>
          <rect x="420" y="34" width="76" height="28" rx="14" fill="#E8F0E8" />
          <text x="458" y="52" font-size="11" font-weight="800" fill="#0C3B2E" text-anchor="middle">IN-DORM</text>
        </g>
      </g>
    </g>

    <!-- ROOM 202 (FEATURED WITH OPEN BED) -->
    <g transform="translate(680, 156)">
      <rect width="580" height="380" rx="20" fill="#FAF9F5" stroke="#0C3B2E" stroke-width="2.5" />
      <g transform="translate(32, 32)">
        <text x="0" y="22" font-size="24" font-weight="800" fill="#0C3B2E">Room 202</text>
        <rect x="370" y="0" width="146" height="32" rx="16" fill="#FFF3CF" stroke="#FFBA00" stroke-width="1" />
        <text x="443" y="21" font-size="13" font-weight="800" fill="#8F5E00" text-anchor="middle">1 BED AVAILABLE</text>
        <text x="0" y="54" font-size="14" font-weight="500" fill="#718075">Triple Bed · Corner Park View</text>

        <!-- Resident 1 -->
        <g transform="translate(0, 90)">
          <rect width="516" height="96" rx="14" fill="#FFFFFF" stroke="#EAEAE2" stroke-width="1" />
          <circle cx="48" cy="48" r="22" fill="#1E40AF" />
          <text x="48" y="55" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">SM</text>
          <text x="86" y="42" font-size="17" font-weight="700" fill="#0C3B2E">Siddharth Menon</text>
          <text x="86" y="66" font-size="13" font-weight="500" fill="#718075">Bed A · 2024-BTECH-014</text>
          <rect x="420" y="34" width="76" height="28" rx="14" fill="#E8F0E8" />
          <text x="458" y="52" font-size="11" font-weight="800" fill="#0C3B2E" text-anchor="middle">IN-DORM</text>
        </g>

        <!-- Open Bed 2: Call to Action -->
        <g transform="translate(0, 204)">
          <rect width="516" height="96" rx="14" fill="#FFFFFF" stroke="#0C3B2E" stroke-width="1.5" stroke-dasharray="6 6" />
          <circle cx="48" cy="48" r="22" fill="#E8F0E8" />
          <text x="48" y="56" font-size="22" font-weight="800" fill="#0C3B2E" text-anchor="middle">+</text>
          <text x="86" y="42" font-size="17" font-weight="800" fill="#0C3B2E">Bed B (Vacant)</text>
          <text x="86" y="66" font-size="13" font-weight="600" fill="#BB8A52">AI Compatibility Match: 99.4% Ready</text>
          <rect x="350" y="30" width="146" height="36" rx="18" fill="#0C3B2E" />
          <text x="423" y="53" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">AUTO-ASSIGN</text>
        </g>
      </g>
    </g>

    <!-- ROOM 203 (DEAN SCHOLAR HOLD) -->
    <g transform="translate(1310, 156)">
      <rect width="580" height="380" rx="20" fill="#FAFAF7" stroke="#E7E7DC" stroke-width="1.5" />
      <g transform="translate(32, 32)">
        <text x="0" y="22" font-size="24" font-weight="800" fill="#0C3B2E">Room 203</text>
        <rect x="390" y="0" width="126" height="32" rx="16" fill="#DBEAFE" />
        <text x="453" y="21" font-size="13" font-weight="800" fill="#1E40AF" text-anchor="middle">RESERVED</text>
        <text x="0" y="54" font-size="14" font-weight="500" fill="#718075">Single Suite · High Honor Fellowship</text>

        <g transform="translate(0, 90)">
          <rect width="516" height="96" rx="14" fill="#FFFFFF" stroke="#EAEAE2" stroke-width="1" />
          <circle cx="48" cy="48" r="22" fill="#6B21A8" />
          <text x="48" y="55" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">AV</text>
          <text x="86" y="42" font-size="17" font-weight="700" fill="#0C3B2E">Aditya Verma</text>
          <text x="86" y="66" font-size="13" font-weight="500" fill="#718075">Incoming Research Scholar · Arriving Nov 12</text>
        </g>

        <g transform="translate(0, 204)">
          <rect width="516" height="96" rx="14" fill="#F5F4EC" stroke="#E1E8DF" stroke-width="1" />
          <text x="32" y="44" font-size="14" font-weight="700" fill="#0C3B2E">Administrative Hold: Approved by Dean</text>
          <text x="32" y="68" font-size="13" font-weight="500" fill="#718075">Document Ref: #ACAD-SCHOLAR-2026-B</text>
        </g>
      </g>
    </g>

    <!-- ROOM 204 -->
    <g transform="translate(50, 566)">
      <rect width="580" height="380" rx="20" fill="#FAFAF7" stroke="#E7E7DC" stroke-width="1.5" />
      <g transform="translate(32, 32)">
        <text x="0" y="22" font-size="24" font-weight="800" fill="#0C3B2E">Room 204</text>
        <rect x="360" y="0" width="156" height="32" rx="16" fill="#D1FAE5" />
        <text x="438" y="21" font-size="13" font-weight="800" fill="#065F46" text-anchor="middle">INSPECTION 100% ✓</text>
        <text x="0" y="54" font-size="14" font-weight="500" fill="#718075">Double Bed · Air Conditioned · Floor 2</text>

        <g transform="translate(0, 90)">
          <rect width="516" height="96" rx="14" fill="#FFFFFF" stroke="#EAEAE2" stroke-width="1" />
          <circle cx="48" cy="48" r="22" fill="#065F46" />
          <text x="48" y="55" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">KM</text>
          <text x="86" y="42" font-size="17" font-weight="700" fill="#0C3B2E">Kabir Mehta</text>
          <text x="86" y="66" font-size="13" font-weight="500" fill="#718075">Bed A · 2024-BCA-092 · Parent Pass Active</text>
        </g>

        <g transform="translate(0, 204)">
          <rect width="516" height="96" rx="14" fill="#FFFFFF" stroke="#EAEAE2" stroke-width="1" />
          <circle cx="48" cy="48" r="22" fill="#0F766E" />
          <text x="48" y="55" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">TS</text>
          <text x="86" y="42" font-size="17" font-weight="700" fill="#0C3B2E">Tushar Sen</text>
          <text x="86" y="66" font-size="13" font-weight="500" fill="#718075">Bed B · 2024-BCA-098 · Clean Audit Log</text>
        </g>
      </g>
    </g>

    <!-- ROOM 205 -->
    <g transform="translate(680, 566)">
      <rect width="580" height="380" rx="20" fill="#FAFAF7" stroke="#E7E7DC" stroke-width="1.5" />
      <g transform="translate(32, 32)">
        <text x="0" y="22" font-size="24" font-weight="800" fill="#0C3B2E">Room 205</text>
        <rect x="380" y="0" width="136" height="32" rx="16" fill="#E8F0E8" />
        <text x="448" y="21" font-size="13" font-weight="800" fill="#0C3B2E" text-anchor="middle">2/2 OCCUPIED</text>
        <text x="0" y="54" font-size="14" font-weight="500" fill="#718075">Double Bed · Attached Washroom</text>

        <g transform="translate(0, 90)">
          <rect width="516" height="96" rx="14" fill="#FFFFFF" stroke="#EAEAE2" stroke-width="1" />
          <circle cx="48" cy="48" r="22" fill="#374151" />
          <text x="48" y="55" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">VR</text>
          <text x="86" y="42" font-size="17" font-weight="700" fill="#0C3B2E">Vikram Rao</text>
          <text x="86" y="66" font-size="13" font-weight="500" fill="#718075">Bed A · 2024-BCA-112</text>
        </g>

        <g transform="translate(0, 204)">
          <rect width="516" height="96" rx="14" fill="#FFFFFF" stroke="#EAEAE2" stroke-width="1" />
          <circle cx="48" cy="48" r="22" fill="#B45309" />
          <text x="48" y="55" font-size="15" font-weight="800" fill="#FFFFFF" text-anchor="middle">NP</text>
          <text x="86" y="42" font-size="17" font-weight="700" fill="#0C3B2E">Nikhil Patel</text>
          <text x="86" y="66" font-size="13" font-weight="500" fill="#718075">Bed B · 2024-BCA-115</text>
        </g>
      </g>
    </g>

    <!-- ROOM 206 (MAINTENANCE IN PROGRESS) -->
    <g transform="translate(1310, 566)">
      <rect width="580" height="380" rx="20" fill="#FAFAF7" stroke="#E7E7DC" stroke-width="1.5" />
      <g transform="translate(32, 32)">
        <text x="0" y="22" font-size="24" font-weight="800" fill="#0C3B2E">Room 206</text>
        <rect x="360" y="0" width="156" height="32" rx="16" fill="#FEE2E2" />
        <text x="438" y="21" font-size="13" font-weight="800" fill="#991B1B" text-anchor="middle">MAINTENANCE</text>
        <text x="0" y="54" font-size="14" font-weight="500" fill="#718075">Double Bed · Air Conditioner Servicing</text>

        <g transform="translate(0, 90)">
          <rect width="516" height="210" rx="14" fill="#FFF8F8" stroke="#FECACA" stroke-width="1" />
          <text x="32" y="44" font-size="17" font-weight="700" fill="#991B1B">Work Order #184: AC Thermostat Sensor</text>
          <text x="32" y="74" font-size="14" font-weight="500" fill="#718075">Assigned to: Technician R. Pal (Campus HVAC Team)</text>
          <text x="32" y="104" font-size="14" font-weight="500" fill="#718075">Status: Parts replaced, final cooling test underway</text>
          
          <rect x="32" y="132" width="280" height="12" rx="6" fill="#FEE2E2" />
          <rect x="32" y="132" width="240" height="12" rx="6" fill="#0C3B2E" />
          <text x="32" y="174" font-size="13" font-weight="700" fill="#065F46">Estimated Completion: In 15 minutes</text>
        </g>
      </g>
    </g>
  </g>

  <!-- RIGHT SECTION (Width: 1220px): Live Biometric Gate & Real-Time Security Radar -->
  <g id="gate-stream" transform="translate(2560, 410)">
    <rect width="1220" height="1020" rx="28" fill="#FFFFFF" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)" />

    <!-- Stream Header -->
    <g transform="translate(48, 44)">
      <circle cx="10" cy="18" r="6" fill="#6D9773" />
      <circle cx="10" cy="18" r="12" stroke="#6D9773" stroke-width="2" fill="none" opacity="0.4" />
      <text x="36" y="24" font-size="24" font-weight="800" fill="#0C3B2E" letter-spacing="-0.02em">
        Real-Time Biometric Gate Telemetry
      </text>
      <text x="0" y="54" font-size="15" font-weight="500" fill="#718075">
        Live RFID &amp; Facial Recognition Scanner Stream · Gates 1, 2, and 3
      </text>
    </g>

    <line x1="48" y1="126" x2="1172" y2="126" stroke="#E7E7DC" stroke-width="1" />

    <!-- Stream Entries (4 High-Resolution Live Cards) -->
    <!-- Entry 1 -->
    <g transform="translate(48, 156)">
      <rect width="1124" height="128" rx="18" fill="#FAFAF7" stroke="#EAEAE2" stroke-width="1.5" />
      <g transform="translate(32, 28)">
        <circle cx="36" cy="36" r="28" fill="#0C3B2E" />
        <text x="36" y="44" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">RS</text>
        
        <text x="84" y="28" font-size="20" font-weight="700" fill="#0C3B2E">Rohan Sharma (Room B-201)</text>
        <text x="84" y="56" font-size="15" font-weight="500" fill="#718075">Main Campus Gate 1 · Biometric In-Scan · Headcount Synced</text>

        <rect x="910" y="20" width="150" height="36" rx="18" fill="#E8F0E8" />
        <text x="985" y="43" font-size="13" font-weight="800" fill="#0C3B2E" text-anchor="middle">10:14 PM · VERIFIED ✓</text>
      </g>
    </g>

    <!-- Entry 2 -->
    <g transform="translate(48, 304)">
      <rect width="1124" height="128" rx="18" fill="#FAFAF7" stroke="#EAEAE2" stroke-width="1.5" />
      <g transform="translate(32, 28)">
        <circle cx="36" cy="36" r="28" fill="#BB8A52" />
        <text x="36" y="44" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">AS</text>
        
        <text x="84" y="28" font-size="20" font-weight="700" fill="#0C3B2E">Ananya Sen (Room A-108)</text>
        <text x="84" y="56" font-size="15" font-weight="500" fill="#718075">North Turnstile Gate 2 · Curfew Pass Checked · SMS Sent to Guardian</text>

        <rect x="910" y="20" width="150" height="36" rx="18" fill="#E8F0E8" />
        <text x="985" y="43" font-size="13" font-weight="800" fill="#0C3B2E" text-anchor="middle">09:58 PM · VERIFIED ✓</text>
      </g>
    </g>

    <!-- Entry 3 -->
    <g transform="translate(48, 452)">
      <rect width="1124" height="128" rx="18" fill="#FAFAF7" stroke="#EAEAE2" stroke-width="1.5" />
      <g transform="translate(32, 28)">
        <circle cx="36" cy="36" r="28" fill="#1E40AF" />
        <text x="36" y="44" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">SV</text>
        
        <text x="84" y="28" font-size="20" font-weight="700" fill="#0C3B2E">Sara Verma (Room A-104)</text>
        <text x="84" y="56" font-size="15" font-weight="500" fill="#718075">Weekend Leave Departure · Out-Scan · Authorized by Warden K. Sharma</text>

        <rect x="910" y="20" width="150" height="36" rx="18" fill="#DBEAFE" />
        <text x="985" y="43" font-size="13" font-weight="800" fill="#1E40AF" text-anchor="middle">09:32 PM · ON LEAVE</text>
      </g>
    </g>

    <!-- Entry 4 -->
    <g transform="translate(48, 600)">
      <rect width="1124" height="128" rx="18" fill="#FAFAF7" stroke="#EAEAE2" stroke-width="1.5" />
      <g transform="translate(32, 28)">
        <circle cx="36" cy="36" r="28" fill="#0F766E" />
        <text x="36" y="44" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">KM</text>
        
        <text x="84" y="28" font-size="20" font-weight="700" fill="#0C3B2E">Kabir Mehta (Room C-302)</text>
        <text x="84" y="56" font-size="15" font-weight="500" fill="#718075">Medical Clinic Outing · Authorized by Campus Doctor &amp; Warden</text>

        <rect x="910" y="20" width="150" height="36" rx="18" fill="#FEF3C7" />
        <text x="985" y="43" font-size="13" font-weight="800" fill="#92400E" text-anchor="middle">08:45 PM · PASS OK</text>
      </g>
    </g>

    <!-- Bottom Telemetry Status Panel -->
    <g transform="translate(48, 770)">
      <rect width="1124" height="196" rx="20" fill="#F5F4EC" stroke="#D5E3D6" stroke-width="1.5" />
      <g transform="translate(40, 36)">
        <text x="0" y="24" font-size="20" font-weight="800" fill="#0C3B2E">
          Campus Perimeter &amp; Gate Security Hardware Status
        </text>
        <text x="0" y="56" font-size="15" font-weight="500" fill="#718075">
          Dual optical biometric scanners online · Latency 38ms · Local edge caching active
        </text>

        <g transform="translate(0, 84)">
          <rect width="320" height="42" rx="12" fill="#FFFFFF" stroke="#E1E8DF" stroke-width="1" />
          <circle cx="20" cy="21" r="5" fill="#6D9773" />
          <text x="36" y="27" font-size="14" font-weight="700" fill="#0C3B2E">Gate 1: North Entrance (Online)</text>

          <rect x="340" y="0" width="320" height="42" rx="12" fill="#FFFFFF" stroke="#E1E8DF" stroke-width="1" />
          <circle cx="360" cy="21" r="5" fill="#6D9773" />
          <text x="376" y="27" font-size="14" font-weight="700" fill="#0C3B2E">Gate 2: Sports Complex (Online)</text>

          <rect x="680" y="0" width="360" height="42" rx="12" fill="#FFFFFF" stroke="#E1E8DF" stroke-width="1" />
          <circle cx="700" cy="21" r="5" fill="#6D9773" />
          <text x="716" y="27" font-size="14" font-weight="700" fill="#0C3B2E">Automatic Parent Notification: Active</text>
        </g>
      </g>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- 5. LOWER INTELLIGENCE ROW (y: 1470 to 2070, height: 600px)               -->
  <!-- ========================================================================= -->

  <!-- Card 1: Multi-Hostel Occupancy Trends -->
  <g id="occupancy-analytics" transform="translate(580, 1470)">
    <rect width="1020" height="600" rx="28" fill="#FFFFFF" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)" />
    <g transform="translate(48, 44)">
      <text x="0" y="24" font-size="22" font-weight="800" fill="#0C3B2E">Hostel Network Capacity Distribution</text>
      <text x="0" y="52" font-size="15" font-weight="500" fill="#718075">Bed fill rates across all 3 university residence wings</text>

      <!-- Bars for Block A, B, C -->
      <g transform="translate(0, 100)">
        <!-- Block A -->
        <text x="0" y="28" font-size="17" font-weight="700" fill="#0C3B2E">Sunrise Hall Block A (Girls Residence)</text>
        <text x="920" y="28" font-size="17" font-weight="800" fill="#0C3B2E" text-anchor="end">98.2% · 392/400 Beds</text>
        <rect x="0" y="42" width="920" height="24" rx="12" fill="#E1E8DF" />
        <rect x="0" y="42" width="903" height="24" rx="12" fill="#0C3B2E" />

        <!-- Block B -->
        <g transform="translate(0, 100)">
          <text x="0" y="28" font-size="17" font-weight="700" fill="#0C3B2E">Sunrise Hall Block B (Boys Residence)</text>
          <text x="920" y="28" font-size="17" font-weight="800" fill="#0C3B2E" text-anchor="end">96.8% · 186/192 Beds</text>
          <rect x="0" y="42" width="920" height="24" rx="12" fill="#E1E8DF" />
          <rect x="0" y="42" width="890" height="24" rx="12" fill="#6D9773" />
        </g>

        <!-- Block C -->
        <g transform="translate(0, 200)">
          <text x="0" y="28" font-size="17" font-weight="700" fill="#0C3B2E">Tagore Hall Block C (Post-Graduate Suites)</text>
          <text x="920" y="28" font-size="17" font-weight="800" fill="#0C3B2E" text-anchor="end">99.1% · 594/600 Beds</text>
          <rect x="0" y="42" width="920" height="24" rx="12" fill="#E1E8DF" />
          <rect x="0" y="42" width="911" height="24" rx="12" fill="#BB8A52" />
        </g>

        <!-- Legend / Summary -->
        <g transform="translate(0, 310)">
          <rect width="920" height="56" rx="16" fill="#F5F4EC" />
          <text x="32" y="34" font-size="15" font-weight="600" fill="#18352B">
            Total Institutional Capacity: <tspan font-weight="800" fill="#0C3B2E">1,172 / 1,192 Allocated (98.3%)</tspan>
          </text>
        </g>
      </g>
    </g>
  </g>

  <!-- Card 2: Dining & Student Mess Hall Telemetry -->
  <g id="mess-analytics" transform="translate(1640, 1470)">
    <rect width="1040" height="600" rx="28" fill="#FFFFFF" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)" />
    <g transform="translate(48, 44)">
      <text x="0" y="24" font-size="22" font-weight="800" fill="#0C3B2E">Dining &amp; Student Mess Telemetry</text>
      <text x="0" y="52" font-size="15" font-weight="500" fill="#718075">Today&apos;s nutritional headcount, real-time ratings, and dining attendance</text>

      <!-- Meal Cards -->
      <g transform="translate(0, 94)">
        <!-- Breakfast -->
        <rect width="940" height="96" rx="16" fill="#FAFAF7" stroke="#EAEAE2" stroke-width="1" />
        <g transform="translate(28, 22)">
          <text x="0" y="22" font-size="18" font-weight="700" fill="#0C3B2E">Breakfast Served</text>
          <text x="0" y="48" font-size="14" font-weight="500" fill="#718075">Idli, Medu Vada, Coconut Chutney &amp; Filter Coffee</text>
          <text x="880" y="28" font-size="20" font-weight="800" fill="#0C3B2E" text-anchor="end">1,120 Heads</text>
          <text x="880" y="52" font-size="13" font-weight="700" fill="#FFBA00" text-anchor="end">4.8 ★</text>
        </g>

        <!-- Lunch -->
        <g transform="translate(0, 114)">
          <rect width="940" height="96" rx="16" fill="#FAFAF7" stroke="#EAEAE2" stroke-width="1" />
          <g transform="translate(28, 22)">
            <text x="0" y="22" font-size="18" font-weight="700" fill="#0C3B2E">Lunch Served</text>
            <text x="0" y="48" font-size="14" font-weight="500" fill="#718075">Paneer Makhani, Dal Tadka, Jeera Rice &amp; Phulkas</text>
            <text x="880" y="28" font-size="20" font-weight="800" fill="#0C3B2E" text-anchor="end">1,164 Heads</text>
            <text x="880" y="52" font-size="13" font-weight="700" fill="#FFBA00" text-anchor="end">4.9 ★</text>
          </g>
        </g>

        <!-- Dinner -->
        <g transform="translate(0, 228)">
          <rect width="940" height="96" rx="16" fill="#FAFAF7" stroke="#EAEAE2" stroke-width="1" />
          <g transform="translate(28, 22)">
            <text x="0" y="22" font-size="18" font-weight="700" fill="#0C3B2E">Dinner Live Schedule</text>
            <text x="0" y="48" font-size="14" font-weight="500" fill="#718075">Vegetable Dum Biryani, Mirchi Ka Salan, Gulab Jamun</text>
            <text x="880" y="28" font-size="20" font-weight="800" fill="#6D9773" text-anchor="end">Est. 1,180 Heads</text>
            <text x="880" y="52" font-size="13" font-weight="700" fill="#6D9773" text-anchor="end">7:30 - 10:00 PM</text>
          </g>
        </g>

        <!-- Hygiene Badge -->
        <g transform="translate(0, 344)">
          <rect width="940" height="56" rx="16" fill="#E8F0E8" />
          <text x="32" y="34" font-size="15" font-weight="700" fill="#0C3B2E">
            FSSAI Food Hygiene Audit Score: 99.4/100 · Kitchen Inspection Verified Today ✓
          </text>
        </g>
      </g>
    </g>
  </g>

  <!-- Card 3: Fee Billing & Accounts Reconciliation -->
  <g id="financial-analytics" transform="translate(2720, 1470)">
    <rect width="1060" height="600" rx="28" fill="#FFFFFF" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)" />
    <g transform="translate(48, 44)">
      <text x="0" y="24" font-size="22" font-weight="800" fill="#0C3B2E">Semester Fee Settlement Velocity</text>
      <text x="0" y="52" font-size="15" font-weight="500" fill="#718075">Automated hostel room rent &amp; mess fee reconciliation</text>

      <g transform="translate(0, 100)">
        <text x="0" y="44" font-size="56" font-weight="800" fill="#0C3B2E" letter-spacing="-0.03em">₹18.4M</text>
        <text x="280" y="36" font-size="20" font-weight="600" fill="#718075">/ ₹18.6M Target</text>
        <text x="0" y="80" font-size="16" font-weight="600" fill="#6D9773">
          99.2% Digital Realization Rate · 0 Reconciliation Discrepancies
        </text>

        <!-- Big Progress Bar -->
        <rect x="0" y="110" width="960" height="24" rx="12" fill="#E1E8DF" />
        <rect x="0" y="110" width="952" height="24" rx="12" fill="#0C3B2E" />

        <g transform="translate(0, 160)">
          <rect width="960" height="180" rx="18" fill="#F5F4EC" stroke="#D5E3D6" stroke-width="1" />
          <g transform="translate(32, 28)">
            <text x="0" y="24" font-size="18" font-weight="700" fill="#0C3B2E">Direct Integration with University ERP</text>
            <text x="0" y="54" font-size="14" font-weight="500" fill="#718075">
              Parents receive instant tax receipts &amp; UPI payment links on mobile
            </text>
            <text x="0" y="84" font-size="14" font-weight="500" fill="#718075">
              Automatic fine waiver for semester scholarship recipients: Active ✓
            </text>
            <text x="0" y="114" font-size="14" font-weight="700" fill="#6D9773">
              Audited by Institutional Finance Directorate · Accreditation Ready
            </text>
          </g>
        </g>
      </g>
    </g>
  </g>
</svg>
`;

// 1. Write the 4K SVG file
const svgPath = join(publicImages, 'hero-dashboard-4k.svg');
writeFileSync(svgPath, svgContent);
console.log(`wrote ${svgPath} (4K SVG)`);

// 2. Rasterize SVG to ultra-crisp 4K PNG (3840x2160)
const resvg = new Resvg(svgContent, {
  fitTo: { mode: 'width', value: 3840 },
  font: { loadSystemFonts: true },
});
const pngBuffer = resvg.render().asPng();
const pngPath = join(publicImages, 'hero-dashboard.png');
writeFileSync(pngPath, pngBuffer);
console.log(`wrote ${pngPath} (3840x2160 4K PNG, size: ${(pngBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

// 3. Convert to high-quality 4K JPEG (quality 95) for fast web delivery & retina displays
const jpgPath = join(publicImages, 'hero-dashboard.jpg');
try {
  execSync(`sips -s format jpeg -s formatOptions 95 "${pngPath}" --out "${jpgPath}"`, { stdio: 'inherit' });
  console.log(`wrote ${jpgPath} (3840x2160 4K JPEG via sips)`);
} catch {
  console.log('Falling back to python for JPEG export...');
  execSync(`python3 -c "from PIL import Image; Image.open('${pngPath}').convert('RGB').save('${jpgPath}', 'JPEG', quality=95)"`);
  console.log(`wrote ${jpgPath} (3840x2160 4K JPEG via PIL)`);
}
