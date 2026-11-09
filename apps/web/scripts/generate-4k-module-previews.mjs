/**
 * Rasterize Nestora support-module UI mockups to 4K PNGs (10:7, Safari preview frame).
 * Run: node scripts/generate-4k-module-previews.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'images', 'module-previews');

const W = 3840;
const H = 2688;

function shell({ title, active }) {
  const navItems = [
    ['Attendance', active === 'attendance'],
    ['Complaints', active === 'complaints'],
    ['Visitors', active === 'visitors'],
    ['Staff', active === 'staff'],
    ['Reports', active === 'reports'],
  ];

  const navRows = navItems
    .map(([label, isActive], i) => {
      const y = 320 + i * 72;
      if (isActive) {
        return `
    <g transform="translate(28, ${y})">
      <rect width="364" height="58" rx="14" fill="#164C3C" stroke="#1F6953" stroke-width="1.5"/>
      <rect x="0" y="14" width="5" height="30" rx="2.5" fill="#6D9773"/>
      <text x="24" y="36" font-size="15" font-weight="700" fill="#FFFFFF">${label}</text>
    </g>`;
      }
      return `
    <g transform="translate(28, ${y})">
      <text x="24" y="36" font-size="15" font-weight="600" fill="#8BA391">${label}</text>
    </g>`;
    })
    .join('');

  return `
  <g id="shell">
    <rect width="${W}" height="${H}" fill="url(#bg-grad)"/>
    <rect width="420" height="${H}" fill="url(#sidebar-grad)"/>
  <line x1="420" y1="0" x2="420" y2="${H}" stroke="#164C3C" stroke-width="2"/>
    <g transform="translate(36, 44)">
      <rect width="56" height="56" rx="14" fill="#164C3C" stroke="#6D9773" stroke-width="2"/>
      <text x="78" y="36" font-size="28" font-weight="800" fill="#FFFFFF">Nest<tspan fill="#6D9773">ora</tspan></text>
    </g>
    <text x="36" y="148" font-size="11" font-weight="700" fill="#5F7B6D" letter-spacing="0.16em">MODULES</text>
    ${navRows}
    <rect x="420" y="0" width="${W - 420}" height="96" fill="#FFFFFF" opacity="0.98"/>
    <line x1="420" y1="96" x2="${W}" y2="96" stroke="#E7E7DC" stroke-width="1.5"/>
    <text x="468" y="58" font-size="26" font-weight="800" fill="#0C3B2E">${title}</text>
    <text x="468" y="82" font-size="14" font-weight="500" fill="#718075">Sunrise Hall Block B · Heritage University</text>
    <rect x="${W - 520}" y="28" width="460" height="52" rx="14" fill="#F5F4EC" stroke="#D5E3D6" stroke-width="1"/>
    <text x="${W - 480}" y="60" font-size="15" font-weight="500" fill="#18352B">Search students, rooms, tickets…</text>
  </g>`;
}

function defs() {
  return `
  <defs>
    <style>
      * { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    </style>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF9F5"/>
      <stop offset="100%" stop-color="#EFEFE6"/>
    </linearGradient>
    <linearGradient id="sidebar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0C3B2E"/>
      <stop offset="100%" stop-color="#082B22"/>
    </linearGradient>
    <linearGradient id="card-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FCFCFA"/>
    </linearGradient>
    <filter id="card-shadow" x="-4%" y="-4%" width="108%" height="112%">
      <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#0C3B2E" flood-opacity="0.06"/>
    </filter>
  </defs>`;
}

function wrap(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
${defs()}
${body}
</svg>`;
}

function attendanceSvg() {
  return wrap(`
${shell({ title: 'Attendance management', active: 'attendance' })}
<g transform="translate(468, 132)">
  <g transform="translate(0, 0)">
    <rect width="520" height="160" rx="22" fill="url(#card-grad)" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)"/>
    <text x="36" y="48" font-size="13" font-weight="700" fill="#6D9773">PRESENT TONIGHT</text>
    <text x="36" y="108" font-size="56" font-weight="800" fill="#0C3B2E">186</text>
    <text x="200" y="100" font-size="22" font-weight="600" fill="#718075">/ 192 residents</text>
    <text x="36" y="138" font-size="15" fill="#718075">96.9% in-dorm before 10:30 PM curfew</text>
  </g>
  <g transform="translate(560, 0)">
    <rect width="520" height="160" rx="22" fill="url(#card-grad)" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)"/>
    <text x="36" y="48" font-size="13" font-weight="700" fill="#164C3C">ON APPROVED LEAVE</text>
    <text x="36" y="108" font-size="56" font-weight="800" fill="#0C3B2E">4</text>
    <text x="36" y="138" font-size="15" fill="#718075">Weekend + medical passes synced with gate</text>
  </g>
  <g transform="translate(1120, 0)">
    <rect width="520" height="160" rx="22" fill="url(#card-grad)" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)"/>
    <text x="36" y="48" font-size="13" font-weight="700" fill="#E07A7A">NEEDS MARKING</text>
    <text x="36" y="108" font-size="56" font-weight="800" fill="#0C3B2E">2</text>
    <text x="36" y="138" font-size="15" fill="#718075">Auto-reminder sent to floor wardens</text>
  </g>
  <g transform="translate(1680, 0)">
    <rect width="480" height="160" rx="22" fill="#0C3B2E"/>
    <text x="36" y="52" font-size="14" font-weight="700" fill="#6D9773">ROLL CALL</text>
    <text x="36" y="100" font-size="22" font-weight="800" fill="#FFFFFF">Floor 2 · Wing East</text>
    <text x="36" y="132" font-size="14" fill="#C5D3CA">Nov 8, 2026 · Session open 22:04</text>
  </g>
</g>
<g transform="translate(468, 320)">
  <rect width="3272" height="2280" rx="26" fill="#FFFFFF" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)"/>
  <text x="48" y="64" font-size="22" font-weight="800" fill="#0C3B2E">Daily attendance ledger</text>
  <rect x="48" y="88" width="380" height="44" rx="12" fill="#E8F0E8"/>
  <text x="72" y="117" font-size="14" font-weight="700" fill="#0C3B2E">All floors</text>
  <rect x="448" y="88" width="120" height="44" rx="12" fill="#F5F4EC" stroke="#D5E3D6"/>
  <text x="508" y="117" font-size="14" font-weight="600" fill="#718075" text-anchor="middle">Floor 1</text>
  <rect x="584" y="88" width="120" height="44" rx="12" fill="#0C3B2E"/>
  <text x="644" y="117" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">Floor 2</text>
  <rect x="720" y="88" width="120" height="44" rx="12" fill="#F5F4EC" stroke="#D5E3D6"/>
  <text x="780" y="117" font-size="14" font-weight="600" fill="#718075" text-anchor="middle">Floor 3</text>
  <line x1="48" y1="152" x2="3224" y2="152" stroke="#E7E7DC"/>
  <text x="72" y="200" font-size="12" font-weight="700" fill="#718075">STUDENT</text>
  <text x="720" y="200" font-size="12" font-weight="700" fill="#718075">ROOM</text>
  <text x="980" y="200" font-size="12" font-weight="700" fill="#718075">STATUS</text>
  <text x="1400" y="200" font-size="12" font-weight="700" fill="#718075">LAST SCAN</text>
  <text x="2100" y="200" font-size="12" font-weight="700" fill="#718075">WARDEN NOTE</text>
  ${[
    ['Aryan Kumar', 'B-201 · Bed A', 'Present', '22:01 · Gate 1', '—'],
    ['Rohan Sharma', 'B-201 · Bed B', 'Present', '21:58 · Gate 2', '—'],
    ['Siddharth Menon', 'B-202 · Bed A', 'Present', '21:44 · Gate 1', '—'],
    ['Kabir Mehta', 'B-204 · Bed A', 'On leave', '—', 'Medical pass #M-882'],
    ['Nikhil Patel', 'B-205 · Bed B', 'Present', '22:03 · Gate 1', '—'],
    ['Vikram Rao', 'B-205 · Bed A', 'Unmarked', '—', 'Follow-up at 22:15'],
    ['Tushar Sen', 'B-204 · Bed B', 'Present', '21:52 · Gate 2', '—'],
    ['Aditya Verma', 'B-203', 'Reserved', '—', 'Arrives Nov 12'],
  ]
    .map((row, i) => {
      const y = 248 + i * 112;
      const status = row[2];
      const statusFill =
        status === 'Present'
          ? { bg: '#E8F0E8', fg: '#0C3B2E' }
          : status === 'On leave'
            ? { bg: '#E8F0E8', fg: '#164C3C' }
            : status === 'Unmarked'
              ? { bg: '#FCE8E8', fg: '#991B1B' }
              : { bg: '#F5F4EC', fg: '#718075' };
      return `
  <g transform="translate(48, ${y})">
    <rect width="3176" height="96" rx="16" fill="#FAFAF7" stroke="#EAEAE2"/>
    <circle cx="56" cy="48" r="22" fill="#0C3B2E"/>
    <text x="56" y="55" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">${row[0]
      .split(' ')
      .map((w) => w[0])
      .join('')}</text>
    <text x="96" y="42" font-size="17" font-weight="700" fill="#0C3B2E">${row[0]}</text>
    <text x="96" y="66" font-size="13" fill="#718075">2024-BCA · Sem 3</text>
    <text x="672" y="54" font-size="16" font-weight="600" fill="#0C3B2E">${row[1]}</text>
    <rect x="932" y="30" width="120" height="36" rx="18" fill="${statusFill.bg}"/>
    <text x="992" y="54" font-size="13" font-weight="800" fill="${statusFill.fg}" text-anchor="middle">${status}</text>
    <text x="1376" y="54" font-size="15" fill="#718075">${row[3]}</text>
    <text x="2076" y="54" font-size="15" fill="#718075">${row[4]}</text>
  </g>`;
    })
    .join('')}
</g>`);
}

function complaintsSvg() {
  return wrap(`
${shell({ title: 'Complaints and maintenance', active: 'complaints' })}
<g transform="translate(468, 140)">
  ${[
    ['Open', '12', '#F5F4EC', '#718075'],
    ['In progress', '7', '#E8F0E8', '#0C3B2E'],
    ['Resolved today', '18', '#164C3C', '#FFFFFF'],
  ]
    .map((col, i) => {
      const x = i * 1120;
      const cards = [
        ['#WO-1842', 'AC not cooling · Room B-206', 'HVAC · High', 'R. Pal'],
        ['#WO-1839', 'Leaking tap · Common bath F2', 'Plumbing · Medium', 'S. Das'],
        ['#WO-1831', 'Broken socket · B-208', 'Electrical · Urgent', 'Unassigned'],
      ];
      if (i === 1) cards[0] = ['#WO-1840', 'Mess hot water line', 'Plumbing · High', 'Campus ops'];
      if (i === 2) cards[0] = ['#WO-1828', 'Window latch · B-201', 'Carpentry · Low', 'Closed 14m'];
      return `
  <g transform="translate(${x}, 0)">
    <text x="0" y="36" font-size="20" font-weight="800" fill="#0C3B2E">${col[0]}</text>
    <rect x="180" y="12" width="48" height="32" rx="16" fill="${col[2]}"/>
    <text x="204" y="34" font-size="14" font-weight="800" fill="${col[3]}" text-anchor="middle">${col[1]}</text>
    ${cards
      .map(
        (c, j) => `
    <g transform="translate(0, ${64 + j * 280})">
      <rect width="1040" height="248" rx="22" fill="url(#card-grad)" stroke="#E7E7DC" stroke-width="1.5" filter="url(#card-shadow)"/>
      <text x="36" y="52" font-size="14" font-weight="700" fill="#6D9773">${c[0]}</text>
      <text x="36" y="96" font-size="22" font-weight="800" fill="#0C3B2E">${c[1]}</text>
      <text x="36" y="132" font-size="15" fill="#718075">${c[2]}</text>
      <text x="36" y="196" font-size="14" font-weight="600" fill="#0C3B2E">Assigned: ${c[3]}</text>
      <rect x="800" y="168" width="200" height="44" rx="12" fill="#0C3B2E"/>
      <text x="900" y="197" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">View ticket</text>
    </g>`
      )
      .join('')}
  </g>`;
    })
    .join('')}
</g>
<g transform="translate(468, 1180)">
  <rect width="3272" height="1420" rx="26" fill="#FFFFFF" stroke="#E7E7DC" filter="url(#card-shadow)"/>
  <text x="48" y="64" font-size="22" font-weight="800" fill="#0C3B2E">Resolution timeline</text>
  <text x="48" y="96" font-size="15" fill="#718075">Average close time today: 2h 14m · SLA match 97%</text>
  <line x1="48" y1="128" x2="3224" y2="128" stroke="#E7E7DC"/>
  ${[0, 1, 2, 3].map((i) => {
    const y = 180 + i * 280;
    return `
  <g transform="translate(72, ${y})">
    <circle cx="0" cy="0" r="10" fill="#6D9773"/>
    <line x1="0" y1="20" x2="0" y2="220" stroke="#D5E3D6" stroke-width="3"/>
    <text x="32" y="8" font-size="17" font-weight="700" fill="#0C3B2E">Ticket #WO-1842 · Status updated</text>
    <text x="32" y="36" font-size="14" fill="#718075">Technician marked in progress · Parts installed on AC unit B-206</text>
    <text x="32" y="64" font-size="13" font-weight="600" fill="#6D9773">Today 21:40 · Warden desk</text>
  </g>`;
  }).join('')}
</g>`);
}

function visitorsSvg() {
  return wrap(`
${shell({ title: 'Visitor management', active: 'visitors' })}
<g transform="translate(468, 132)">
  <rect width="2000" height="2460" rx="26" fill="#FFFFFF" stroke="#E7E7DC" filter="url(#card-shadow)"/>
  <text x="48" y="64" font-size="22" font-weight="800" fill="#0C3B2E">Active visits today</text>
  <line x1="48" y1="96" x2="1952" y2="96" stroke="#E7E7DC"/>
  ${[
    ['Mrs. Priya Kumar', 'Host: Aryan Kumar · B-201', 'Checked in 17:20', 'Gate 1'],
    ['Mr. Raj Sharma', 'Host: Rohan Sharma · B-201', 'Checked in 18:05', 'Gate 2'],
    ['Dr. Mehta', 'Host: Kabir Mehta · Medical', 'Checked in 19:10', 'Reception'],
    ['Uncle Verma', 'Host: Aditya Verma', 'Expected 20:00', 'Pre-registered'],
  ].map((v, i) => {
    const y = 140 + i * 200;
    return `
  <g transform="translate(48, ${y})">
    <rect width="1904" height="164" rx="18" fill="#FAFAF7" stroke="#EAEAE2"/>
    <text x="32" y="48" font-size="20" font-weight="700" fill="#0C3B2E">${v[0]}</text>
    <text x="32" y="80" font-size="15" fill="#718075">${v[1]}</text>
    <text x="32" y="112" font-size="14" font-weight="600" fill="#6D9773">${v[2]}</text>
    <rect x="1640" y="58" width="220" height="48" rx="14" fill="#E8F0E8"/>
    <text x="1750" y="89" font-size="14" font-weight="800" fill="#0C3B2E" text-anchor="middle">${v[3]}</text>
  </g>`;
  }).join('')}
</g>
<g transform="translate(2508, 132)">
  <rect width="1232" height="2460" rx="26" fill="url(#card-grad)" stroke="#E7E7DC" filter="url(#card-shadow)"/>
  <text x="48" y="64" font-size="22" font-weight="800" fill="#0C3B2E">Register visitor</text>
  <text x="48" y="100" font-size="15" fill="#718075">ID verified at security desk · SMS to host student</text>
  ${[
    'Visitor full name',
    'Relation to student',
    'Student / room lookup',
    'Vehicle number (optional)',
  ].map((label, i) => {
    const y = 160 + i * 140;
    return `
  <g transform="translate(48, ${y})">
    <text x="0" y="0" font-size="13" font-weight="700" fill="#718075">${label.toUpperCase()}</text>
    <rect y="16" width="1136" height="64" rx="14" fill="#FFFFFF" stroke="#D5E3D6" stroke-width="1.5"/>
  </g>`;
  }).join('')}
  <rect x="48" y="760" width="1136" height="64" rx="16" fill="#0C3B2E"/>
  <text x="616" y="800" font-size="16" font-weight="800" fill="#FFFFFF" text-anchor="middle">Check in visitor</text>
  <text x="48" y="900" font-size="18" font-weight="800" fill="#0C3B2E">Visit policy</text>
  <text x="48" y="940" font-size="15" fill="#718075">Weekdays 16:00–20:00 · Max 2 visitors per student</text>
  <text x="48" y="976" font-size="15" fill="#718075">Government ID scan stored encrypted · Auto check-out at 20:15</text>
</g>`);
}

function staffSvg() {
  return wrap(`
${shell({ title: 'Staff management', active: 'staff' })}
<g transform="translate(468, 132)">
  ${[
    ['Dr. K. Sharma', 'Chief Resident Warden', 'On duty · Night shift', 'KS'],
    ['Meera Nair', 'Deputy Warden · Block B', 'Floor rounds 22:00', 'MN'],
    ['R. Pal', 'HVAC Technician', 'Ticket #WO-1842', 'RP'],
    ['Security Desk', 'Gate team lead', 'Gates 1–3 online', 'SD'],
    ['S. Das', 'Plumbing', '2 open assignments', 'SD'],
    ['Housekeeping', 'Floor 2 supervisor', 'Inspection 98%', 'HK'],
  ].map((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = col * 1100;
    const y = row * 420;
    return `
  <g transform="translate(${x}, ${y})">
    <rect width="1040" height="380" rx="24" fill="url(#card-grad)" stroke="#E7E7DC" filter="url(#card-shadow)"/>
    <circle cx="72" cy="72" r="36" fill="#164C3C"/>
    <text x="72" y="80" font-size="18" font-weight="800" fill="#FFFFFF" text-anchor="middle">${s[3]}</text>
    <text x="132" y="60" font-size="22" font-weight="800" fill="#0C3B2E">${s[0]}</text>
    <text x="132" y="92" font-size="15" fill="#718075">${s[1]}</text>
    <rect x="48" y="140" width="200" height="36" rx="18" fill="#E8F0E8"/>
    <text x="148" y="164" font-size="13" font-weight="700" fill="#0C3B2E" text-anchor="middle">Active</text>
    <text x="48" y="220" font-size="16" font-weight="600" fill="#0C3B2E">${s[2]}</text>
    <rect x="48" y="280" width="220" height="48" rx="14" fill="#F5F4EC" stroke="#D5E3D6"/>
    <text x="158" y="310" font-size="14" font-weight="700" fill="#164C3C" text-anchor="middle">View profile</text>
  </g>`;
  }).join('')}
</g>
<g transform="translate(468, 1420)">
  <rect width="3272" height="1180" rx="26" fill="#FFFFFF" stroke="#E7E7DC" filter="url(#card-shadow)"/>
  <text x="48" y="64" font-size="22" font-weight="800" fill="#0C3B2E">Duty roster · This week</text>
  <line x1="48" y1="96" x2="3224" y2="96" stroke="#E7E7DC"/>
  ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
    const x = 80 + i * 440;
    return `
  <g transform="translate(${x}, 140)">
    <text x="0" y="0" font-size="14" font-weight="700" fill="#718075">${d}</text>
    <rect y="20" width="400" height="880" rx="16" fill="#FAFAF7" stroke="#EAEAE2"/>
    <text x="24" y="72" font-size="15" font-weight="700" fill="#0C3B2E">Night warden</text>
    <text x="24" y="100" font-size="14" fill="#718075">K. Sharma</text>
    <text x="24" y="180" font-size="15" font-weight="700" fill="#0C3B2E">Security</text>
    <text x="24" y="208" font-size="14" fill="#718075">Team A · Gates 1–2</text>
  </g>`;
  }).join('')}
</g>`);
}

function reportsSvg() {
  return wrap(`
${shell({ title: 'Reports and analytics', active: 'reports' })}
<g transform="translate(468, 132)">
  <rect width="640" height="2468" rx="26" fill="#FFFFFF" stroke="#E7E7DC" filter="url(#card-shadow)"/>
  <text x="48" y="64" font-size="20" font-weight="800" fill="#0C3B2E">Report library</text>
  ${[
    'Occupancy summary',
    'Fee collection',
    'Attendance trends',
    'Complaint SLA',
    'Visitor volume',
    'Staff coverage',
  ].map((r, i) => {
    const active = i === 0;
    return `
  <g transform="translate(32, ${120 + i * 72})">
    <rect width="576" height="56" rx="14" fill="${active ? '#E8F0E8' : 'transparent'}"/>
    <text x="24" y="36" font-size="16" font-weight="${active ? '800' : '600'}" fill="${active ? '#0C3B2E' : '#718075'}">${r}</text>
  </g>`;
  }).join('')}
</g>
<g transform="translate(1148, 132)">
  <rect width="2592" height="2468" rx="26" fill="url(#card-grad)" stroke="#E7E7DC" filter="url(#card-shadow)"/>
  <text x="48" y="64" font-size="24" font-weight="800" fill="#0C3B2E">Hostel occupancy · Fall 2026</text>
  <text x="48" y="100" font-size="15" fill="#718075">Block A–C · Exported PDF ready for accreditation review</text>
  <rect x="2000" y="40" width="200" height="52" rx="14" fill="#0C3B2E"/>
  <text x="2100" y="73" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">Export</text>
  <rect x="2220" y="40" width="200" height="52" rx="14" fill="#F5F4EC" stroke="#D5E3D6"/>
  <text x="2320" y="73" font-size="15" font-weight="700" fill="#0C3B2E" text-anchor="middle">Schedule</text>
  ${[
    { label: 'Block A (Girls)', pct: 98, w: 940 },
    { label: 'Block B (Boys)', pct: 97, w: 930 },
    { label: 'Block C (PG)', pct: 99, w: 950 },
    { label: 'Annex (Guests)', pct: 72, w: 690 },
  ].map((b, i) => {
    const y = 200 + i * 200;
    return `
  <g transform="translate(48, ${y})">
    <text x="0" y="0" font-size="18" font-weight="700" fill="#0C3B2E">${b.label}</text>
    <text x="2200" y="0" font-size="18" font-weight="800" fill="#0C3B2E" text-anchor="end">${b.pct}%</text>
    <rect y="24" width="2200" height="28" rx="14" fill="#E1E8DF"/>
    <rect y="24" width="${b.w}" height="28" rx="14" fill="#6D9773"/>
  </g>`;
  }).join('')}
  <g transform="translate(48, 1000)">
    <text x="0" y="0" font-size="20" font-weight="800" fill="#0C3B2E">Weekly occupancy trend</text>
    <polyline points="0,320 280,280 560,300 840,220 1120,200 1400,180 1680,160 1960,140 2200,120" fill="none" stroke="#0C3B2E" stroke-width="6" stroke-linecap="round"/>
    <polygon points="0,320 280,280 560,300 840,220 1120,200 1400,180 1680,160 1960,140 2200,120 2200,400 0,400" fill="#6D9773" opacity="0.15"/>
  </g>
  <g transform="translate(48, 1680)">
    <rect width="1050" height="320" rx="20" fill="#FFFFFF" stroke="#E7E7DC"/>
    <text x="32" y="56" font-size="16" font-weight="800" fill="#0C3B2E">Fee realization</text>
    <text x="32" y="140" font-size="48" font-weight="800" fill="#0C3B2E">99.2%</text>
    <text x="32" y="200" font-size="15" fill="#718075">₹18.4M collected this semester</text>
  </g>
  <g transform="translate(1140, 1680)">
    <rect width="1050" height="320" rx="20" fill="#FFFFFF" stroke="#E7E7DC"/>
    <text x="32" y="56" font-size="16" font-weight="800" fill="#0C3B2E">Open tickets</text>
    <text x="32" y="140" font-size="48" font-weight="800" fill="#0C3B2E">19</text>
    <text x="32" y="200" font-size="15" fill="#718075">12 open · 7 in progress</text>
  </g>
</g>`);
}

const modules = [
  { id: 'attendance', svg: attendanceSvg },
  { id: 'complaints', svg: complaintsSvg },
  { id: 'visitors', svg: visitorsSvg },
  { id: 'staff', svg: staffSvg },
  { id: 'reports', svg: reportsSvg },
];

mkdirSync(outDir, { recursive: true });

for (const mod of modules) {
  const svg = mod.svg();
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();
  const out = join(outDir, `${mod.id}-preview.png`);
  writeFileSync(out, png);
  console.log(`wrote ${out} (${W}x${H}, ${(png.length / 1024).toFixed(0)} KB)`);
}
