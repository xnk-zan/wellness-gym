// Zero-dependency static build: renders every page from data.mjs.
// Usage: node build.mjs
// Pages: / , /membership/ , /kelas/ , /personal-trainer/ , /fasilitas/ , /lokasi/ , /faq/
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { site, waLink } from "./data.mjs";
import { references, articles, events, contentDate } from "./content.mjs";

const here = (p) => new URL("./" + p, import.meta.url);
const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ext = `target="_blank" rel="noopener"`;
const b = site.brand;
const days = [...new Set(site.schedule.map((s) => s.day))];
const P = site.photos;
const heroP = P[site.hero.photo];
const priceNum = (s) => Number(String(s).replace(/[^0-9]/g, ""));
const idr = (n) => "Rp" + n.toLocaleString("id-ID");

// ---------- Per-page context (set by the build loop before each page renders) ----------
let REL = "";      // prefix from the current page back to the site root
let HOME = true;   // true while rendering the home page
const u = (p) => REL + p;
const membershipHref = () => (HOME ? "#membership" : u("membership/"));

// ---------- Small renderers ----------
const logo = (cls, w = 40, alt = "Wellness Gym") => `<picture><source srcset="${u("logo-320.webp")}" type="image/webp"><img class="${cls}" src="${u("logo-320.png")}" alt="${alt}" width="${w}" height="${w}"></picture>`;
const arrow = `<svg class="ico-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg>`;
const btn = (href, label, variant, extra = "") =>
  `<a class="btn btn--${variant}" href="${esc(href)}"${extra ? " " + extra : ""}><span class="btn__label">${esc(label)}</span>${arrow}</a>`;
const waBtn = (msg, label = "Chat WhatsApp", variant = "gold") => btn(waLink(msg), label, variant, ext + " data-cursor=\"Chat\"");

// Looping motion graphics for facilities that have no real photo yet.
const icons = {
  wifi: `<svg viewBox="0 0 120 120" class="mg mg--wifi"><circle cx="60" cy="86" r="5"/><path d="M44 70a23 23 0 0 1 32 0"/><path d="M32 57a40 40 0 0 1 56 0"/><path d="M20 44a57 57 0 0 1 80 0"/></svg>`,
  coach: `<svg viewBox="0 0 120 120" class="mg mg--coach"><circle cx="60" cy="66" r="34"/><path d="M60 26v-8M52 18h16"/><path class="mg-hand" d="M60 66V44"/><circle cx="60" cy="66" r="3"/></svg>`,
  pt: `<svg viewBox="0 0 120 120" class="mg mg--pt"><g class="mg-lift"><path d="M30 60h60"/><rect x="18" y="44" width="10" height="32" rx="2"/><rect x="92" y="44" width="10" height="32" rx="2"/><rect x="8" y="50" width="8" height="20" rx="2"/><rect x="104" y="50" width="8" height="20" rx="2"/></g><path d="M20 100h80" class="mg-floor"/></svg>`,
  shower: `<svg viewBox="0 0 120 120" class="mg mg--shower"><path d="M30 14v20h34"/><path d="M50 34h40a0 0 0 0 1 0 0 20 20 0 0 1-20 20H70a20 20 0 0 1-20-20Z"/><g class="mg-drops"><path d="M58 66v8"/><path d="M70 70v8"/><path d="M82 66v8"/><path d="M64 84v8"/><path d="M76 88v8"/></g></svg>`,
  breath: `<svg viewBox="0 0 120 120" class="mg mg--breath"><circle cx="60" cy="60" r="14"/><circle cx="60" cy="60" r="30"/><circle cx="60" cy="60" r="46"/></svg>`,
  orbit: `<svg viewBox="0 0 120 120" class="mg mg--orbit"><circle cx="60" cy="60" r="44"/><circle cx="60" cy="60" r="6" class="mg-core"/><g class="mg-sat"><circle cx="60" cy="16" r="6"/><circle cx="98" cy="82" r="6"/><circle cx="22" cy="82" r="6"/></g></svg>`,
  locker: `<svg viewBox="0 0 120 120" class="mg mg--locker"><rect x="30" y="14" width="60" height="92" rx="4"/><g class="mg-door"><rect x="30" y="14" width="60" height="92" rx="4"/><path d="M44 30h32M44 38h32M44 46h32"/><circle cx="78" cy="66" r="4"/></g></svg>`
};

const photo = (key, cls, sizes = "(max-width: 767px) 100vw, 50vw", eager = false, pos) => {
  const p = { ...P[key], ...(pos && { pos }) };
  return `<img class="${cls}" src="${esc(u(p.src))}" srcset="${esc(u(p.small))} 640w, ${esc(u(p.src))} ${p.w}w" sizes="${sizes}" alt="${esc(p.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="${p.w}" height="${p.h}"${p.pos ? ` style="object-position:${p.pos}"` : ""}>`;
};
const facilityMedia = (f) => f.photo ? photo(f.photo, "fac__img", undefined, false, f.pos)
  : `<div class="fac__mg" aria-hidden="true">${icons[f.icon]}</div>`;

// Headline split into two deliberate lines; "Kuat," gets the accent.
const [l1, l2] = ["Sehat, Kuat, dan", "Lebih Percaya Diri."];
if (`${l1} ${l2}` !== site.hero.headline) throw new Error("Hero headline drifted from data");
const accent = (s) => esc(s).replace("Kuat,", `<em>Kuat,</em>`);
const marqueeWords = [b.tagline.split(" · "), site.classes.flatMap((c) => c.name.split(" / "))].map((row) =>
  [...row, ...row].map((w) => `<span>${esc(w)}</span><i aria-hidden="true"></i>`).join(""));

// ---------- Derived facts (every figure comes from data.mjs) ----------
const m = site.membership;
const ptTiers = site.personalTrainer.tiers;
const offers = [
  ...m.single.flatMap((x) => [[`Membership ${x.type} 1 bulan`, x.oneMonth], [`Membership ${x.type} 3 bulan`, x.threeMonth]]),
  ...m.couple.map((c) => [`Membership ${c.type} per bulan`, c.price]),
  ["Visit Gym per kunjungan", site.visitGym.price],
  ...site.classes.map((c) => [`Kelas ${c.name} per kedatangan`, c.price]),
  ...ptTiers.flatMap((t) => t.rows.flatMap((r) => t.cols.map((c, i) => [`Personal Trainer ${t.name} ${r.segment} ${c}`, r.prices[i], site.ptBookingUrl])))
].map(([name, price, url]) => ({ "@type": "Offer", name, price: priceNum(price), priceCurrency: "IDR", ...(url && { url }), itemOffered: { "@type": "Service", name } }));
const prices = offers.map((o) => o.price);
const minPT = Math.min(...ptTiers.flatMap((t) => t.rows.flatMap((r) => r.prices.map(priceNum))));
const minClass = Math.min(...site.classes.map((c) => priceNum(c.price)));
const classNames = [...new Set(site.classes.flatMap((c) => c.name.split(" / ")))];
const dayText = days.map((d) => `${d} ${site.schedule.filter((x) => x.day === d).map((x) => `${x.time} ${x.cls}`).join(", ")}`).join("; ");
const hoursText = b.hours.map((h) => `${h.days} ${h.time}`).join(", ");
const instrFac = site.facilities.find((f) => /instruktur/i.test(f.name)).name;
const t0 = ptTiers[0];

// ---------- FAQ pool; each entry says which pages show it ----------
const faqs = [
  { tags: ["membership", "faq"], q: "Berapa harga membership Wellness Gym Purwokerto?",
    a: `Membership General ${m.single[0].oneMonth} untuk 1 bulan dan ${m.single[0].threeMonth} untuk 3 bulan. Membership Student ${m.single[1].oneMonth} untuk 1 bulan dan ${m.single[1].threeMonth} untuk 3 bulan. Paket couple: ${m.couple.map((c) => `${c.type} ${c.price}`).join(" dan ")}.` },
  { tags: ["membership", "personal-trainer", "faq"], q: "Apakah ada harga khusus mahasiswa?",
    a: `Ada. Membership Student ${m.single[1].oneMonth} untuk 1 bulan dan ${m.single[1].threeMonth} untuk 3 bulan, paket ${m.couple[0].type} ${m.couple[0].price}, dan Personal Trainer segmen ${t0.rows[0].segment} mulai ${t0.rows[0].prices[0]} (${t0.name} ${t0.cols[0].toLowerCase()}).` },
  { tags: ["membership", "faq"], q: "Berapa harga visit gym harian?",
    a: `Visit gym ${site.visitGym.price}. ${site.visitGym.copy} Untuk ketentuan visit, tanyakan lewat WhatsApp ${b.whatsappDisplay}.` },
  { tags: ["kelas", "faq"], q: "Kelas apa saja yang ada dan berapa harganya?",
    a: site.classes.map((c) => `${c.name} ${c.price}`).join("; ") + "." },
  { tags: ["kelas", "faq"], q: "Bagaimana jadwal kelas mingguan?",
    a: `${dayText}. ${site.scheduleNote}` },
  { tags: ["personal-trainer", "faq"], q: "Apakah ada Personal Trainer di Wellness Gym?",
    a: `Ada. Paket ${ptTiers.map((t) => `${t.name} (${t.subtitle.toLowerCase()})`).join(", ")}, harga mulai ${idr(minPT)}. Tersedia untuk segmen ${t0.rows.map((r) => r.segment.toLowerCase()).join(" dan ")}.` },
  { tags: ["personal-trainer", "faq"], q: "Bagaimana cara booking Personal Trainer?",
    a: `Booking lewat ${site.ptBookingUrl.replace("https://", "")}. Untuk konsultasi paket yang sesuai, hubungi WhatsApp ${b.whatsappDisplay}.` },
  { tags: ["personal-trainer", "faq"], q: "Apa beda paket Entry, Core, dan Premium?",
    a: ptTiers.map((t) => `${t.name} (${t.subtitle.toLowerCase()}): ${t.includes.join(", ").toLowerCase()}`).join(". ") + "." },
  { tags: ["fasilitas", "faq"], q: "Fasilitas apa saja yang tersedia?",
    a: site.facilities.map((f) => f.name).join(", ") + "." },
  { tags: ["fasilitas", "faq"], q: "Apakah ada instruktur gym?",
    a: `Ada. ${site.whyUs.points[3].desc} ${instrFac} termasuk dalam fasilitas.` },
  { tags: ["lokasi", "faq"], q: "Jam buka Wellness Gym kapan?",
    a: b.hours.map((h) => `${h.days} pukul ${h.time}`).join(", ") + "." },
  { tags: ["lokasi", "faq"], q: "Di mana lokasi Wellness Gym?",
    a: `${b.address}. Gym ini berada di Purwokerto Utara, Kabupaten Banyumas.` },
  { tags: ["faq"], q: "Bagaimana ulasan Wellness Gym?",
    a: `Rating ${site.socialProof.rating}.` }
];
const faqsFor = (key) => faqs.filter((f) => f.tags.includes(key));

// ---------- Section renderers ----------
// o.h: show the visible heading; o.more: link to the dedicated page (home only)
const more = (href, label = "Selengkapnya") => `<a class="more" href="${u(href)}">${esc(label)}</a>`;
function sectionHead(id, title, aside, o) {
  if (!o.h) return `<h2 class="sr-only" id="${id}-title">${title}</h2>`;
  return `<header class="sec__head">
    <h2 class="sec__title" data-split id="${id}-title">${title}</h2>
    <div class="sec__aside">${o.more ? more(o.more) : ""}${aside}</div>
  </header>`;
}

const membershipSec = (o) => `<section class="sec" id="membership" aria-labelledby="membership-title">
  ${sectionHead("membership", "Membership", waBtn(m.waMessage, "Tanya Membership", "line"), o)}
  <div class="bento">
    ${m.single.map((x) => `<article class="tile tile--single" data-spot>
      <h3 class="tile__title">${esc(x.type)}</h3>
      <dl class="prices">
        <div><dt>1 Bulan</dt><dd class="num" data-count="${priceNum(x.oneMonth)}">${esc(x.oneMonth)}</dd></div>
        <div><dt>3 Bulan</dt><dd class="num" data-count="${priceNum(x.threeMonth)}">${esc(x.threeMonth)}</dd></div>
      </dl>
    </article>`).join("\n    ")}
    <article class="tile tile--couple" data-spot>
      <h3 class="tile__title">Couple</h3>
      <dl class="prices prices--row">
        ${m.couple.map((c) => `<div><dt>${esc(c.type)}</dt><dd class="num">${esc(c.price)}</dd></div>`).join("\n        ")}
      </dl>
    </article>
    <article class="tile tile--visit" id="visit" data-spot>
      <h3 class="tile__title">Visit Gym</h3>
      <p class="num tile__big">${esc(site.visitGym.price)}</p>
      <p class="tile__copy">${esc(site.visitGym.copy)}</p>
      ${waBtn(site.visitGym.waMessage, "Coba Visit Gym", "dark")}
    </article>
  </div>
</section>`;

const facilitiesSec = (o) => `<section class="sec" id="facilities" aria-labelledby="facilities-title">
  ${sectionHead("facilities", "Fasilitas", "", o)}
  <ul class="fac">
    ${site.facilities.map((f, i) => `<li class="fac__item fac__item--${i < 2 ? "big" : "small"}" data-spot>
      <div class="fac__media">${facilityMedia(f)}</div>
      <h3>${esc(f.name)}</h3>
    </li>`).join("\n    ")}
  </ul>
</section>`;

const ribbonSec = () => `<div class="ribbon" aria-label="Galeri foto Wellness Gym">
  <ul class="ribbon__track">
    ${site.ribbon.map((k) => `<li class="ribbon__item ribbon__item--${P[k].h > P[k].w ? "tall" : "wide"}">${photo(k, "ribbon__img", "(max-width: 767px) 70vw, 32vw")}</li>`).join("\n    ")}
  </ul>
</div>`;

const classesSec = (o) => `<section class="sec" id="classes" aria-labelledby="classes-title">
  ${sectionHead("classes", "Kelas", waBtn(site.scheduleWaMessage, "Tanya Jadwal", "line"), o)}
  <figure class="classes__banner">${photo(site.classesPhoto, "classes__img", "(max-width: 767px) 100vw, 88rem")}</figure>
  <ul class="classes">
    ${site.classes.map((c) => `<li class="class-row">
      <h3>${esc(c.name)}</h3>
      <p class="num">${esc(c.price)}</p>
    </li>`).join("\n    ")}
  </ul>
</section>`;

const scheduleSec = (o) => `<section class="sec" id="schedule" aria-labelledby="schedule-title">
  ${sectionHead("schedule", "Jadwal mingguan", waBtn(site.scheduleWaMessage, "Tanya Jadwal Terbaru", "line"), o)}
  <div class="week" tabindex="0" role="group" aria-label="Jadwal kelas per hari">
    ${days.map((d) => `<section class="week__day" aria-labelledby="d-${d}">
      <h3 id="d-${d}">${esc(d)}</h3>
      <ul>${site.schedule.filter((s) => s.day === d).map((s) => `<li><time class="num">${esc(s.time)}</time><span>${esc(s.cls)}</span></li>`).join("")}</ul>
    </section>`).join("\n    ")}
  </div>
  <p class="note">${esc(site.scheduleNote)}</p>
</section>`;

const spin = () => `<a class="spin" href="${site.ptBookingUrl}" ${ext} data-cursor="Booking">
      <svg viewBox="0 0 200 200" class="spin__ring" aria-hidden="true"><defs><path id="ring" d="M100 100m-76 0a76 76 0 1 1 152 0a76 76 0 1 1-152 0"/></defs><text><textPath href="#ring">Booking Personal Trainer · xnkbooking.my.id · </textPath></text></svg>
      <span class="spin__core">${arrow}</span>
      <span class="sr-only">Booking Personal Trainer di xnkbooking.my.id</span>
    </a>`;

const ptSec = (o) => `<section class="sec pt" id="personal-trainer" aria-labelledby="pt-title">
  ${sectionHead("pt", "Personal Trainer", spin(), o)}
  <div class="stack">
    ${ptTiers.map((t, i) => `<article class="tier" style="--i:${i}">
      <div class="tier__info">
        <h3 class="tier__name">${esc(t.name)}</h3>
        <p class="tier__sub">${esc(t.subtitle)}</p>
        <ul class="tier__inc">${t.includes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      </div>
      <table class="tier__table">
        <caption class="sr-only">Harga ${esc(t.name)} — ${esc(t.subtitle)}</caption>
        <thead><tr><th scope="col">Paket</th>${t.rows.map((r) => `<th scope="col">${esc(r.segment)}</th>`).join("")}</tr></thead>
        <tbody>${t.cols.map((c, ci) => `<tr><th scope="row">${esc(c)}</th>${t.rows.map((r) => `<td class="num">${esc(r.prices[ci])}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </article>`).join("\n    ")}
  </div>
  <div class="pt__cta">
    ${btn(site.ptBookingUrl, "Booking Personal Trainer", "gold", ext + ' data-cursor="Booking"')}
    ${waBtn(site.personalTrainer.waMessage, "Konsultasi via WhatsApp", "line")}
  </div>
</section>`;

const reviewsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${b.name} ${b.address}`);
const stars = `<svg class="stars" viewBox="0 0 100 18" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => `<path transform="translate(${i * 20} 0)" d="M9 1l2.4 5.2 5.6.7-4.1 3.9 1 5.6L9 13.7 4.1 16.4l1-5.6L1 6.9l5.6-.7z"/>`).join("")}</svg>`;
const reviewsSec = () => `<section class="sec reviews" id="reviews" aria-labelledby="reviews-title">
  <h2 class="sr-only" id="reviews-title">Ulasan Google</h2>
  <div class="rev__head">
    <div class="rev__score">${stars}<p class="rev__rating"><span class="num" data-count="${b.rating}" data-decimals="1">${b.rating}</span>/5 dari ${b.reviewCount} Google Reviews</p></div>
    <a class="more" href="${esc(reviewsUrl)}" ${ext}>Lihat semua ulasan</a>
  </div>
  <ul class="wall">
    ${site.socialProof.testimonials.map((t, i) => `<li class="wall__item wall__item--${i}">
      <blockquote><p>&ldquo;${esc(t.text)}&rdquo;</p></blockquote>
      <p class="wall__by">${esc(t.name)} <span>Google Review</span></p>
    </li>`).join("\n    ")}
  </ul>
</section>`;

// ---------- Home teasers: short, scannable, each links to its own page ----------
const H = site.home;
if (H.pt.price !== t0.rows[0].prices[0] || H.pt.per !== t0.cols[0].toLowerCase()) throw new Error("Home PT teaser price drifted from PT data");
const ptTeaser = () => `<section class="sec pt-teaser" id="personal-trainer" aria-labelledby="pt-title">
  ${sectionHead("pt", "Personal Trainer", more("personal-trainer/", "Lihat Paket PT"), { h: true })}
  <div class="ptt">
    <p class="ptt__lead">${esc(H.pt.lead)}</p>
    <div class="ptt__body">
      <p class="ptt__price">Mulai <span class="num">${esc(H.pt.price)}</span> / ${esc(H.pt.per)}</p>
      <p class="ptt__points">${H.pt.points.map(esc).join(" · ")}</p>
      <div class="ptt__cta">
        ${btn(u("personal-trainer/"), "Lihat Paket PT", "gold")}
        ${btn(site.ptBookingUrl, "Booking PT", "line", ext + ' data-cursor="Booking"')}
      </div>
    </div>
  </div>
</section>`;

const facilitiesTeaser = () => `<section class="sec" id="facilities" aria-labelledby="facilities-title">
  ${sectionHead("facilities", "Fasilitas", more("fasilitas/", "Lihat Semua Fasilitas"), { h: true })}
  <p class="teaser__lead">${esc(H.facilities.lead)}</p>
  <ul class="ft">
    ${H.facilities.tiles.map((t, i) => `<li class="ft__item ft__item--${"abcd"[i]}" data-spot>
      ${photo(t.photo, "ft__img", i === 0 ? "(max-width: 767px) 100vw, 50vw" : "(max-width: 767px) 50vw, 25vw", false, t.pos)}
      <span class="ft__label">${esc(t.label)}</span>
    </li>`).join("\n    ")}
  </ul>
  <p class="teaser__caption">${esc(H.facilities.caption)}</p>
</section>`;

const classesTeaser = () => `<section class="sec" id="classes" aria-labelledby="classes-title">
  ${sectionHead("classes", "Kelas", more("kelas/", "Lihat Kelas"), { h: true })}
  <p class="teaser__lead">${esc(H.classes.lead)}</p>
  <figure class="classes__banner">${photo(site.classesPhoto, "classes__img", "(max-width: 767px) 100vw, 88rem")}</figure>
  <div class="teaser__foot">
    <p class="note">${esc(H.classes.note)}</p>
    ${waBtn(site.scheduleWaMessage, "Tanya Jadwal", "line")}
  </div>
</section>`;

const locationSec = (o) => `<section class="sec loc" id="location" aria-labelledby="location-title">
  <div class="loc__info">
    ${o.h ? `<h2 class="sec__title" data-split id="location-title">Lokasi &amp; jam buka</h2>${o.more ? more(o.more) : ""}` : `<h2 class="sr-only" id="location-title">Alamat dan jam buka</h2>`}
    <button class="copy" type="button" data-copy="${esc(b.address)}">
      <span class="copy__text">${esc(b.address)}</span>
      <span class="copy__hint">Ketuk untuk salin alamat</span>
    </button>
    <p class="toast" role="status" aria-live="polite"></p>
    <dl class="hours">
      ${b.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd class="num">${esc(h.time)}</dd></div>`).join("\n      ")}
    </dl>
    <div class="loc__ctas">
      ${btn(b.mapsDirectionsUrl, "Dapatkan Arah", "gold", ext)}
      ${waBtn(site.waGeneralMessage, "Chat WhatsApp", "line")}
    </div>
  </div>
  <div class="loc__map">
    <iframe src="${esc(b.mapsEmbedUrl)}" title="Peta lokasi Wellness Gym" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </div>
</section>`;

const finalSec = () => `<section class="final" id="mulai" aria-labelledby="final-title">
  <h2 class="final__title" id="final-title"><span class="final__a">Sudah siap</span> <span class="final__mask" style="--img:url('${u(heroP.src)}')">mulai latihan?</span></h2>
  <p class="final__copy">${esc(site.finalCta.copy)}</p>
  <div class="hero__ctas">
    ${waBtn(site.waGeneralMessage)}
    ${btn(membershipHref(), "Lihat Membership", "line")}
  </div>
  <p class="final__contact">WhatsApp <a class="num" href="${esc(waLink(site.waGeneralMessage))}" ${ext}>${esc(site.finalCta.contact)}</a> · <a href="${u("faq/")}">Pertanyaan umum</a></p>
</section>`;

const faqSec = (key, title, openFirst) => {
  const list = faqsFor(key);
  return `<section class="sec faq" id="faq-list" aria-labelledby="faq-title">
  ${openFirst ? `<h2 class="sr-only" id="faq-title">${esc(title)}</h2>` : `<header class="sec__head"><h2 class="sec__title" data-split id="faq-title">${esc(title)}</h2></header>`}
  <div class="faq__list">
    ${list.map((f, i) => `<details class="faq__item"${openFirst && i === 0 ? " open" : ""}><summary><h3>${esc(f.q)}</h3><span class="faq__icon" aria-hidden="true"></span></summary><p>${esc(f.a)}</p></details>`).join("\n    ")}
  </div>
</section>`;
};

// ---------- Page definitions ----------
const pages = [
  { key: "home", path: "", nav: null, title: site.seo.title, desc: site.seo.description },
  {
    key: "membership", path: "membership/", nav: "Membership", crumb: "Membership",
    title: "Membership Wellness Gym Purwokerto | General, Student, Couple",
    desc: `Harga membership Wellness Gym Purwokerto: General ${m.single[0].oneMonth} per bulan, Student ${m.single[1].oneMonth}, paket couple, dan visit gym ${site.visitGym.price}.`,
    h1: "Membership gym di Purwokerto",
    intro: `Pilih membership General atau Student untuk 1 atau 3 bulan, atau paket couple. Belum yakin? Coba dulu lewat visit gym ${site.visitGym.price}.`,
    short: `General, Student, Couple, dan visit gym ${site.visitGym.price}`,
    related: ["kelas", "personal-trainer", "lokasi"],
    ctas: () => waBtn(m.waMessage, "Tanya Membership") + waBtn(site.visitGym.waMessage, "Coba Visit Gym", "line"),
    body: () => membershipSec({ h: false }) + faqSec("membership", "Pertanyaan tentang membership"),
    images: []
  },
  {
    key: "kelas", path: "kelas/", nav: "Kelas", crumb: "Kelas",
    title: "Kelas & Jadwal Wellness Gym Purwokerto | Zumba, Yoga, Aerobic",
    desc: `Jadwal kelas mingguan Wellness Gym Purwokerto: ${classNames.join(", ")}. Harga mulai ${idr(minClass)} per kedatangan. Jadwal bisa berubah.`,
    h1: "Kelas & jadwal mingguan",
    intro: `Kelas ${classNames.join(", ")} dengan harga mulai ${idr(minClass)} per kedatangan. ${site.scheduleNote}`,
    short: `${classNames.join(", ")} dan jadwal mingguan`,
    related: ["membership", "personal-trainer", "fasilitas"],
    ctas: () => waBtn(site.scheduleWaMessage, "Tanya Jadwal Terbaru") + btn(u("membership/"), "Lihat Membership", "line"),
    body: () => classesSec({ h: false }) + scheduleSec({ h: true }) + faqSec("kelas", "Pertanyaan tentang kelas"),
    images: ["classesPhoto"]
  },
  {
    key: "personal-trainer", path: "personal-trainer/", nav: "Personal Trainer", crumb: "Personal Trainer",
    title: "Personal Trainer Purwokerto | Paket Entry, Core, Premium",
    desc: `Paket Personal Trainer Wellness Gym Purwokerto: Entry, Core, Premium untuk mahasiswa dan umum, mulai ${idr(minPT)}. Booking lewat xnkbooking.my.id.`,
    h1: "Personal Trainer di Purwokerto",
    intro: `Tiga paket: ${ptTiers.map((t) => `${t.name} (${t.subtitle.toLowerCase()})`).join(", ")}. Harga mulai ${idr(minPT)}. Booking lewat xnkbooking.my.id.`,
    short: `Paket ${ptTiers.map((t) => t.name[0] + t.name.slice(1).toLowerCase()).join(", ")}, booking online`,
    related: ["membership", "kelas", "faq"],
    ctas: () => btn(site.ptBookingUrl, "Booking PT", "gold", ext + ' data-cursor="Booking"') + waBtn(site.personalTrainer.waMessage, "Konsultasi PT", "line"),
    body: () => ptSec({ h: false }) + faqSec("personal-trainer", "Pertanyaan tentang Personal Trainer"),
    images: []
  },
  {
    key: "fasilitas", path: "fasilitas/", nav: "Fasilitas", crumb: "Fasilitas",
    title: "Fasilitas Gym Purwokerto | WiFi, Shower, Locker, Instruktur",
    desc: `Fasilitas Wellness Gym Purwokerto: ${site.facilities.map((f) => f.name).join(", ")}.`,
    h1: "Fasilitas gym",
    intro: `${site.facilities.map((f) => f.name).join(", ")}. ${site.whyUs.points[1].desc}`,
    short: site.facilities.map((f) => f.name.replace(/^(Free|Tersedia) /, "")).join(", "),
    related: ["kelas", "membership", "lokasi"],
    ctas: () => waBtn(site.waGeneralMessage) + btn(u("membership/"), "Lihat Membership", "line"),
    body: () => facilitiesSec({ h: false }) + ribbonSec() + faqSec("fasilitas", "Pertanyaan tentang fasilitas"),
    images: [...new Set([...site.facilities.map((f) => f.photo).filter(Boolean), ...site.ribbon])]
  },
  {
    key: "lokasi", path: "lokasi/", nav: "Lokasi", crumb: "Lokasi",
    title: "Lokasi & Jam Buka Wellness Gym | Purwokerto Utara",
    desc: `Wellness Gym di Jl. Jatisari No.24, Karangmiri, Sumampir, Purwokerto Utara. Buka ${hoursText}. Petunjuk arah dan WhatsApp.`,
    h1: "Lokasi & jam buka",
    intro: `${b.address}. Buka ${hoursText}.`,
    short: `Jl. Jatisari No.24, Purwokerto Utara. ${hoursText}`,
    related: ["membership", "kelas", "faq"],
    ctas: () => btn(b.mapsDirectionsUrl, "Dapatkan Arah", "gold", ext) + waBtn(site.waGeneralMessage, "Chat WhatsApp", "line"),
    body: () => locationSec({ h: false }) + faqSec("lokasi", "Pertanyaan tentang lokasi"),
    images: []
  },
  {
    key: "faq", path: "faq/", nav: "FAQ", crumb: "FAQ",
    title: "FAQ Wellness Gym Purwokerto | Harga, Jadwal, Lokasi",
    desc: "Jawaban singkat tentang harga membership, visit gym, kelas, Personal Trainer, jam buka, dan lokasi Wellness Gym Purwokerto.",
    header: false,
    h1: "Pertanyaan umum",
    intro: "Jawaban singkat tentang harga, jadwal kelas, Personal Trainer, jam buka, dan lokasi. Tidak menemukan jawabannya? Tanya langsung lewat WhatsApp.",
    short: "Harga, jadwal, Personal Trainer, jam buka, lokasi",
    related: ["membership", "kelas", "personal-trainer"],
    ctas: () => waBtn(site.waGeneralMessage, "Tanya via WhatsApp") + btn(u("membership/"), "Lihat Membership", "line"),
    body: () => faqSec("faq", "Semua pertanyaan", true),
    images: []
  }
];

// ---------- Tips (cited articles) and gallery ----------
const fmtDate = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const wordsOf = (a) => [a.intro, ...a.points, ...a.sections.flatMap((x) => x.p)].join(" ").split(/\s+/).length;
const readMin = (a) => Math.max(1, Math.ceil(wordsOf(a) / 180));

function cite(text, order) {
  return esc(text).replace(/\{\{(\w+)\}\}/g, (_, id) => {
    if (!references[id]) throw new Error("Unknown reference: " + id);
    let i = order.indexOf(id);
    if (i < 0) { order.push(id); i = order.length - 1; }
    return `<sup class="cite"><a href="#ref-${id}" aria-label="Referensi ${i + 1}">[${i + 1}]</a></sup>`;
  });
}

function articleBody(a, pg) {
  const order = [];
  const pts = a.points.map((t) => `<li>${cite(t, order)}</li>`).join("");
  const secs = a.sections.map((x) => `<section><h2>${esc(x.h)}</h2>${x.p.map((t) => `<p>${cite(t, order)}</p>`).join("")}</section>`).join("");
  const declared = [...a.refs].sort().join(",");
  if (declared !== [...order].sort().join(",")) throw new Error(`Cited refs (${order}) differ from declared refs (${a.refs}) in ${a.slug}`);
  const refs = order.map((id) => {
    const r = references[id];
    return `<li id="ref-${id}">${esc(r.authors)} (${r.year}). ${esc(r.title)} <i>${esc(r.journal)}</i>. ${r.year};${r.volume}(${r.issue}):${r.pages}. <a href="https://doi.org/${r.doi}" ${ext}>doi:${esc(r.doi)}</a> · <a href="https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/" ${ext}>PubMed ${r.pmid}</a></li>`;
  }).join("\n      ");
  return `<article class="sec prose-wrap">
  <div class="prose">
    <aside class="keypts" aria-labelledby="kp-title"><h2 id="kp-title">Ringkasan</h2><ul>${pts}</ul></aside>
    ${secs}
    <p class="disclaimer">Artikel ini ringkasan edukasi umum dari literatur yang dikutip, bukan nasihat medis. Jika kamu memiliki kondisi kesehatan tertentu, konsultasikan dengan tenaga kesehatan sebelum mengubah program latihan atau pola makan.</p>
    <section class="refs" aria-labelledby="refs-title">
      <h2 id="refs-title">Referensi</h2>
      <ol>
      ${refs}
      </ol>
      <p class="refs__note">Referensi diverifikasi melalui PubMed pada ${fmtDate(contentDate)}.</p>
    </section>
  </div>
</article>`;
}

const tipKeys = articles.map((a) => "tip-" + a.slug);
const tipsIndex = {
  key: "tips", path: "tips/", nav: "Tips", crumb: "Tips",
  title: "Tips Latihan Berbasis Jurnal Ilmiah | Wellness Gym Purwokerto",
  desc: "Tips latihan beban, progresi, protein, dan kesehatan mental yang dirangkum dari jurnal ilmiah, lengkap dengan referensi dan DOI.",
  h1: "Tips latihan berbasis penelitian",
  intro: "Ringkasan singkat dari jurnal ilmiah tentang latihan, nutrisi, dan kesehatan. Setiap artikel mencantumkan referensi dan DOI agar bisa kamu cek sendiri.",
  short: "Ringkasan jurnal ilmiah tentang latihan beban, protein, dan kesehatan mental",
  related: ["membership", "personal-trainer", "kelas"],
  ctas: () => waBtn(site.waGeneralMessage) + btn(u("membership/"), "Lihat Membership", "line"),
  body: () => `<section class="sec" aria-labelledby="tips-list-title">
  <h2 class="sr-only" id="tips-list-title">Daftar artikel</h2>
  <ul class="rel">
    ${articles.map((a) => `<li><a href="${u("tips/" + a.slug + "/")}"><span class="rel__name">${esc(a.h1)}</span><span class="rel__desc">${esc(a.intro)} ${readMin(a)} menit baca.</span>${arrow}</a></li>`).join("\n    ")}
  </ul>
</section>`,
  images: []
};
const articlePages = articles.map((a, i) => {
  const pg = {
    key: tipKeys[i], path: `tips/${a.slug}/`, nav: null, navKey: "tips", crumb: a.crumb,
    trail: [["Tips", "tips/"], [a.crumb]],
    title: a.title, desc: a.desc, h1: a.h1, intro: a.intro,
    meta: `Diperbarui ${fmtDate(contentDate)} · ${readMin(a)} menit baca · ${a.refs.length} referensi ilmiah`,
    short: a.desc, article: a, images: [],
    related: [...tipKeys.filter((k) => k !== tipKeys[i]).slice(0, 2), "personal-trainer"],
    ctas: () => waBtn(site.waGeneralMessage) + btn(u("personal-trainer/"), "Lihat Personal Trainer", "line")
  };
  pg.body = () => articleBody(a, pg);
  return pg;
});

const galleryReady = events.every((e) => e.photo);
const galeri = {
  key: "galeri", path: "galeri/", nav: "Galeri", crumb: "Galeri",
  hidden: !galleryReady, noindex: !galleryReady,
  title: "Galeri Wellness Gym Purwokerto | Kegiatan dan Kelas",
  desc: "Foto kegiatan, kelas senam dan aerobic, serta suasana latihan bersama instruktur di Wellness Gym Purwokerto.",
  h1: "Galeri & kegiatan",
  intro: "Suasana latihan, kelas, dan kegiatan di Wellness Gym. Foto akan terus ditambah.",
  short: "Foto kegiatan, kelas, dan suasana latihan",
  related: ["kelas", "fasilitas", "membership"],
  ctas: () => waBtn(site.waGeneralMessage) + btn(u("membership/"), "Lihat Membership", "line"),
  body: () => `<section class="sec" aria-labelledby="gal-title">
  <h2 class="sr-only" id="gal-title">Foto kegiatan</h2>
  <ul class="gal">
    ${events.map((e) => `<li class="gal__item" data-spot>
      <div class="gal__media">${e.photo ? photo(e.photo, "gal__img", "(max-width: 767px) 100vw, 40vw") : `<div class="gal__ph" role="img" aria-label="Foto kegiatan, menyusul"><span>Foto menyusul</span></div>`}</div>
      <h3>${esc(e.title)}</h3>
    </li>`).join("\n    ")}
  </ul>
</section>`,
  images: []
};
pages.splice(pages.findIndex((x) => x.key === "faq"), 0, tipsIndex, ...articlePages, galeri);

const pageByKey = Object.fromEntries(pages.map((p) => [p.key, p]));
const pageUrl = (p) => site.url + p.path;

const navLinks = (cur, footer = false) => pages.filter((p) => p.nav && !p.hidden && (footer || p.header !== false)).map((p) => `<a href="${u(p.path)}"${p.key === cur ? ' aria-current="page"' : ""}>${p.nav}</a>`).join("");

const crumbsHtml = (p) => {
  const trail = p.trail || [[p.crumb]];
  return `<nav class="crumbs" aria-label="Breadcrumb"><a href="${u("") || "./"}">Beranda</a>${trail.map(([label, path]) => `<span aria-hidden="true">/</span>` + (path ? `<a href="${u(path)}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`)).join("")}</nav>`;
};

const pageHead = (p) => `<header class="phead">
  <div class="phead__in">
    ${crumbsHtml(p)}
    <h1 class="phead__title" data-split>${esc(p.h1)}</h1>
    <p class="phead__intro">${esc(p.intro)}</p>
    ${p.meta ? `<p class="phead__meta">${esc(p.meta)}</p>` : ""}
    <div class="hero__ctas">${p.ctas()}</div>
  </div>
</header>`;

const related = (p) => `<section class="sec related" aria-labelledby="rel-title">
  <h2 class="rel__title" id="rel-title">Lihat juga</h2>
  <ul class="rel">
    ${p.related.map((k) => `<li><a href="${u(pageByKey[k].path)}"><span class="rel__name">${esc(pageByKey[k].nav || pageByKey[k].crumb)}</span><span class="rel__desc">${esc(pageByKey[k].short)}</span>${arrow}</a></li>`).join("\n    ")}
  </ul>
</section>`;

// ---------- Home body ----------
const homeBody = () => `<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="hero__frame">
    ${photo(site.hero.photo, "hero__img", "100vw", true)}
    <div class="hero__shade" aria-hidden="true"></div>
    <svg class="led" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true">
      <path class="led__path" d="M-20 120 L380 160 L520 60 L1460 40"/>
      <path class="led__path led__path--b" d="M-20 300 L640 230 L760 250 L1460 190"/>
    </svg>
  </div>
  <div class="hero__content">
    <p class="kicker">${esc(b.tagline)}</p>
    <h1 class="hero__title" id="hero-title"><span class="line">${accent(l1)}</span> <span class="line">${accent(l2)}</span></h1>
    <div class="hero__foot">
      <p class="hero__sub">${esc(site.hero.subcopy)}</p>
      <div class="hero__ctas">
        ${waBtn(site.waGeneralMessage)}
        ${btn("#membership", "Lihat Membership", "line")}
      </div>
    </div>
    <a class="hero__loc" href="${esc(b.mapsDirectionsUrl)}" ${ext}><span class="dot" aria-hidden="true"></span>${esc(site.hero.location)}</a>
  </div>
</section>

<div class="marquee" aria-hidden="true">
  <div class="marquee__row"><div class="marquee__track">${marqueeWords[0]}</div></div>
  <div class="marquee__row marquee__row--rev"><div class="marquee__track">${marqueeWords[1]}</div></div>
</div>

<section class="quick" id="info" aria-label="Informasi singkat">
  <ul class="quick__list">
    ${site.quickInfo.map((q) => `<li class="quick__item"><strong>${esc(q.value)}</strong><span>${esc(q.label)}</span></li>`).join("\n    ")}
  </ul>
</section>

<section class="why" id="why" aria-labelledby="why-title">
  <div class="why__pin">
    <h2 class="why__title" id="why-title" data-scrub>${esc(site.whyUs.headline)}</h2>
    <ol class="why__track">
      ${site.whyUs.points.map((pt, i) => {
        const media = site.whyPhotos[i] ? photo(site.whyPhotos[i], "why__img", "(max-width: 600px) 100vw, 44rem") : "";
        const mg = media ? "" : `<div class="why__mg" aria-hidden="true">${icons[["breath", "", "orbit", "coach"][i]]}</div>`;
        return `<li class="why__card${media ? " why__card--photo" : ""}">${media}${mg}<div class="why__body"><span class="why__n" aria-hidden="true">0${i + 1}</span><h3>${esc(pt.title)}</h3><p>${esc(pt.desc)}</p></div></li>`;
      }).join("\n      ")}
    </ol>
  </div>
</section>

${membershipSec({ h: true, more: "membership/" })}

${facilitiesTeaser()}

${classesTeaser()}

${ptTeaser()}

${reviewsSec()}

${locationSec({ h: true, more: "lokasi/" })}

${finalSec()}`;

// ---------- JSON-LD ----------
const gymId = site.url + "#gym";
const gymNode = {
  "@type": "ExerciseGym", "@id": gymId,
  name: b.name, slogan: b.tagline, description: site.seo.description, url: site.url,
  image: [site.url + "og-image.png", site.url + heroP.src, site.url + P.instructor.src, site.url + P.dumbbell.src],
  logo: site.url + "logo.png",
  telephone: b.telephone,
  priceRange: `${idr(Math.min(...prices))} - ${idr(Math.max(...prices))}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Jatisari No.24, Karangmiri, Sumampir",
    addressLocality: "Purwokerto Utara",
    addressRegion: "Jawa Tengah",
    postalCode: "53125",
    addressCountry: "ID"
  },
  areaServed: { "@type": "City", name: "Purwokerto" },
  hasMap: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(b.address),
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "06:00", closes: "21:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "06:00", closes: "12:00" }
  ],
  amenityFeature: site.facilities.map((f) => ({ "@type": "LocationFeatureSpecification", name: f.name, value: true })),
  hasOfferCatalog: { "@type": "OfferCatalog", name: "Harga Wellness Gym", itemListElement: offers },
  sameAs: [b.instagramUrl, b.tiktokUrl]
};
const webSite = { "@type": "WebSite", "@id": site.url + "#website", url: site.url, name: b.name, inLanguage: "id-ID", publisher: { "@id": gymId } };

function jsonLd(p) {
  const url = pageUrl(p);
  const webPage = {
    "@type": "WebPage", "@id": url + "#webpage", url, name: p.title, description: p.desc, inLanguage: "id-ID",
    isPartOf: { "@id": site.url + "#website" }, about: { "@id": gymId },
    primaryImageOfPage: { "@type": "ImageObject", url: site.url + "og-image.png", width: 1200, height: 630 },
    ...(p.key !== "home" && { breadcrumb: { "@id": url + "#breadcrumb" } })
  };
  if (p.key === "home") return { "@context": "https://schema.org", "@graph": [webSite, webPage, gymNode] };
  const trail = p.trail || [[p.crumb]];
  const crumbs = { "@type": "BreadcrumbList", "@id": url + "#breadcrumb", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Beranda", item: site.url },
    ...trail.map(([label, path], i) => ({ "@type": "ListItem", position: i + 2, name: label, item: path ? site.url + path : url }))
  ] };
  if (p.article) {
    const a = p.article;
    return { "@context": "https://schema.org", "@graph": [webPage, crumbs, {
      "@type": "Article", "@id": url + "#article", headline: a.h1, description: a.desc,
      datePublished: contentDate, dateModified: contentDate, inLanguage: "id-ID",
      mainEntityOfPage: { "@id": url + "#webpage" }, author: { "@id": gymId }, publisher: { "@id": gymId },
      image: site.url + "og-image.png",
      citation: a.refs.map((id) => ({ "@type": "ScholarlyArticle", name: references[id].title, datePublished: String(references[id].year), url: "https://doi.org/" + references[id].doi, sameAs: "https://pubmed.ncbi.nlm.nih.gov/" + references[id].pmid + "/", isPartOf: { "@type": "Periodical", name: references[id].journal } }))
    }] };
  }
  const list = faqsFor(p.key);
  const graph = [webPage, crumbs];
  if (list.length) graph.push({ "@type": "FAQPage", "@id": url + "#faq", inLanguage: "id-ID", mainEntity: list.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  return { "@context": "https://schema.org", "@graph": graph };
}

// ---------- Layout ----------
function layout(p, body) {
  const url = pageUrl(p);
  const ogAlt = "Wellness Gym Purwokerto, area latihan dengan alat beban hitam-ungu";
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<meta name="robots" content="${p.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}">
<meta name="author" content="${esc(b.name)}">
<meta name="geo.region" content="ID-JT">
<meta name="geo.placename" content="Purwokerto">
<meta name="theme-color" content="#0d0b12">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="id" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="id_ID">
<meta property="og:site_name" content="${esc(b.name)}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:image" content="${site.url}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${ogAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.desc)}">
<meta name="twitter:image" content="${site.url}og-image.png">
<meta name="twitter:image:alt" content="${ogAlt}">
<link rel="icon" href="${u("favicon.ico")}" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="${u("favicon-32x32.png")}">
<link rel="icon" type="image/png" sizes="16x16" href="${u("favicon-16x16.png")}">
<link rel="apple-touch-icon" href="${u("apple-touch-icon.png")}">
<link rel="manifest" href="${u("site.webmanifest")}">
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=satoshi@400,500,700&display=swap" media="print" onload="this.media='all'">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=satoshi@400,500,700&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap"></noscript>
${HOME ? `<link rel="preload" as="image" href="${heroP.src}" imagesrcset="${heroP.small} 640w, ${heroP.src} ${heroP.w}w" imagesizes="100vw">\n` : ""}<link rel="stylesheet" href="${u("styles.css")}">
<script>
  // Motion only arms when JS runs; if scripts fail to load, everything stays visible.
  // "pending" hides only the hero copy until the intro takes over; always released after 3s.
  (function (d) {
    d.classList.add("js");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) d.classList.add("pending");
    setTimeout(function () { d.classList.remove("pending"); if (!window.__wg) d.classList.remove("js"); }, 3000);
  })(document.documentElement);
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js" defer></script>
<script src="${u("script.js")}" defer></script>
<script type="application/ld+json">${JSON.stringify(jsonLd(p))}</script>
</head>
<body class="${HOME ? "is-home" : "is-sub"}">
<a class="skip" href="#main">Lewati ke konten utama</a>
<div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div>

<header class="nav" id="nav">
  <a class="nav__brand" href="${HOME ? "#top" : u("")}" aria-label="Wellness Gym, ${HOME ? "ke atas" : "ke beranda"}">${logo("nav__logo")}<span>Wellness Gym</span></a>
  <nav class="nav__links" aria-label="Navigasi utama">${navLinks(p.navKey || p.key)}</nav>
  ${waBtn(site.waGeneralMessage, "Chat WhatsApp", "gold btn--sm nav__cta")}
  <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu"><span class="nav__toggle-text">Menu</span></button>
</header>
<nav class="menu" id="menu" aria-label="Navigasi mobile" hidden>
  <div class="menu__links">${navLinks(p.navKey || p.key, true)}</div>
  ${waBtn(site.waGeneralMessage)}
  <p class="menu__meta">${esc(b.address)}</p>
</nav>

<main id="main">
${body}
</main>

<footer class="footer">
  <div class="footer__grid">
    <div>
      <p class="footer__tag">${esc(b.tagline)}</p>
      <address>${esc(b.address)}</address>
    </div>
    <nav aria-label="Navigasi footer" class="footer__nav">${navLinks(p.navKey || p.key, true)}</nav>
    <ul class="footer__social">
      <li><a href="${esc(waLink(site.waGeneralMessage))}" ${ext}>WhatsApp ${esc(b.whatsappDisplay)}</a></li>
      <li><a href="${b.instagramUrl}" ${ext}>Instagram ${esc(b.instagram)}</a></li>
      <li><a href="${b.tiktokUrl}" ${ext}>TikTok ${esc(b.tiktok)}</a></li>
    </ul>
  </div>
  <p class="footer__word" aria-hidden="true">Wellness Gym</p>
</footer>

<div class="dock" aria-label="Aksi cepat">
  ${btn(membershipHref(), "Membership", "line")}
  ${waBtn(site.waGeneralMessage)}
</div>
</body>
</html>
`;
}

// ---------- Build all pages ----------
const out = {};
for (const p of pages) {
  HOME = p.key === "home";
  REL = "../".repeat(p.path.split("/").filter(Boolean).length);
  if (p.key !== "home" && p.desc.length > 165) throw new Error(`Description too long (${p.desc.length}) on ${p.key}`);
  const body = HOME ? homeBody() : pageHead(p) + p.body() + related(p) + finalSec();
  out[p.key] = layout(p, body);
  if (p.path) mkdirSync(here(p.path), { recursive: true });
  writeFileSync(here(p.path + "index.html"), out[p.key]);
}
HOME = true; REL = "";
const all = Object.values(out).join("\n");

// Self-check: every business value from data must land in the output, links must be well-formed.
const homeMust = [
  site.hero.headline.split(" ").pop(),
  ...site.quickInfo.flatMap((q) => [q.value, q.label]),
  ...m.single.flatMap((x) => [x.oneMonth, x.threeMonth]),
  ...m.couple.map((c) => c.price), site.visitGym.price,
  H.pt.price, H.classes.note,
  ...site.socialProof.testimonials.map((t) => t.text), site.finalCta.contact
].map(esc);
const allMust = [
  ...site.classes.map((c) => c.price),
  ...site.schedule.flatMap((x) => [x.time, x.cls]),
  ...ptTiers.flatMap((t) => t.rows.flatMap((r) => r.prices))
].map(esc);
const must = [...homeMust, ...allMust];
const missing = [...homeMust.filter((x) => !out.home.includes(x)), ...allMust.filter((x) => !all.includes(x))];
if (missing.length) throw new Error("Missing in output: " + missing.join(" | "));
for (const mm of all.matchAll(/href="(https:\/\/wa\.me[^"]*)"/g)) {
  if (!mm[1].startsWith(`https://wa.me/${b.whatsappNumber}?text=`)) throw new Error("Bad WA link: " + mm[1]);
}
for (const k of ["home", "personal-trainer"]) if (!out[k].includes(`href="${site.ptBookingUrl}"`)) throw new Error("PT booking link missing on " + k);
for (const mm of all.matchAll(/src="(?:\.\.\/)?(assets\/[^"]+)"/g)) if (!existsSync(here(mm[1]))) throw new Error("Missing asset: " + mm[1]);
// Internal links must resolve to a generated page
const known = new Set(["", ...pages.map((p) => p.path)]);
for (const [k, html] of Object.entries(out)) {
  for (const mm of html.matchAll(/<a [^>]*href="((?:\.\.\/)*(?:[a-z0-9-]+\/)*)"/g)) {
    const target = mm[1].replace(/^(?:\.\.\/)+/, "");
    if (!known.has(target)) throw new Error(`Broken internal link "${mm[1]}" on ${k}`);
  }
}

// ---------- Generated crawler/PWA files ----------
const base = new URL(site.url).pathname;
const today = new Date().toISOString().slice(0, 10);
const homeImgs = [...new Set([site.hero.photo, ...site.whyPhotos, ...site.ribbon, site.classesPhoto, ...site.facilities.map((f) => f.photo).filter(Boolean)])];
const imgTags = (keys) => keys.map((k) => `    <image:image><image:loc>${site.url}${P[k].src}</image:loc><image:caption>${esc(P[k].alt)}</image:caption></image:image>`).join("\n");
const imgKeys = (p) => (p.key === "home" ? homeImgs : (p.images || []).map((i) => (P[i] ? i : site[i])));
writeFileSync(here("sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.filter((p) => !p.noindex).map((p) => `  <url>
    <loc>${pageUrl(p)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.key === "home" || p.key === "kelas" ? "weekly" : "monthly"}</changefreq>
    <priority>${p.key === "home" ? "1.0" : p.key === "faq" ? "0.6" : "0.8"}</priority>
${imgTags(imgKeys(p))}
  </url>`).join("\n")}
</urlset>
`);

writeFileSync(here("robots.txt"), `# Search and AI answer engines are welcome. Remove a group below to opt out.
User-agent: *
Allow: /

User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /

Sitemap: ${site.url}sitemap.xml
`);

writeFileSync(here("llms.txt"), `# ${b.name} Purwokerto

> ${site.seo.description}

${b.name} (${b.tagline}) adalah gym di Purwokerto Utara, Kabupaten Banyumas, Jawa Tengah.

## Halaman
${pages.filter((p) => !p.noindex).map((p) => `- [${p.nav || p.crumb || "Beranda"}](${pageUrl(p)}): ${p.key === "home" ? "Ringkasan gym, harga, jadwal, dan lokasi" : p.short}`).join("\n")}

## Informasi utama
- Alamat: ${b.address}
- WhatsApp: ${b.whatsappDisplay} (${waLink(site.waGeneralMessage)})
- Jam buka: ${b.hours.map((h) => `${h.days} ${h.time}`).join("; ")}
- Instagram: ${b.instagramUrl}
- TikTok: ${b.tiktokUrl}
- Rating: ${site.socialProof.rating}
- Booking Personal Trainer: ${site.ptBookingUrl}

## Harga
${offers.map((o) => `- ${o.name}: ${idr(o.price)}`).join("\n")}

## Jadwal kelas mingguan
${days.map((d) => `- ${d}: ${site.schedule.filter((x) => x.day === d).map((x) => `${x.time} ${x.cls}`).join(", ")}`).join("\n")}
${site.scheduleNote}

## Fasilitas
${site.facilities.map((f) => `- ${f.name}`).join("\n")}

## Tanya jawab
${faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}

## Referensi ilmiah (dikutip di halaman Tips)
${Object.values(references).map((r) => `- ${r.authors} (${r.year}). ${r.title} ${r.journal}. https://doi.org/${r.doi}`).join("\n")}
`);

writeFileSync(here("404.html"), `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Halaman tidak ditemukan | ${esc(b.name)}</title>
<meta name="robots" content="noindex">
<link rel="icon" href="${base}favicon.ico" sizes="any">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=satoshi@400,500,700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${base}styles.css">
<style>.nf{min-height:100svh;display:grid;align-content:center;gap:1.5rem;padding:2rem var(--gutter);max-width:var(--max);margin:0 auto}.nf h1{font:600 clamp(3rem,10vw,9rem)/.9 var(--display);letter-spacing:-.045em}.nf p{color:var(--muted);max-width:32rem}.nf .row{display:flex;flex-wrap:wrap;gap:.75rem}</style>
</head>
<body>
<main class="nf">
  <p class="kicker">404</p>
  <h1>Halaman tidak ditemukan.</h1>
  <p>Alamat yang kamu buka tidak ada. Kembali ke halaman utama untuk melihat membership, kelas, dan lokasi ${esc(b.name)}.</p>
  <div class="row">
    <a class="btn btn--gold" href="${base}"><span class="btn__label">Ke halaman utama</span></a>
    <a class="btn btn--line" href="${esc(waLink(site.waGeneralMessage))}" ${ext}><span class="btn__label">Chat WhatsApp</span></a>
  </div>
</main>
</body>
</html>
`);

writeFileSync(here("site.webmanifest"), JSON.stringify({
  id: base, name: `${b.name} Purwokerto`, short_name: b.name, lang: "id",
  description: site.seo.title, start_url: base, scope: base, display: "standalone",
  background_color: "#0d0b12", theme_color: "#0d0b12", categories: ["health", "fitness", "sports"],
  icons: [
    { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png" }
  ]
}, null, 2) + "\n");

console.log(`${pages.length} pages, ${faqs.length} FAQs, ${offers.length} offers, ${must.length} values verified`);
for (const p of pages) console.log(`  /${p.path}  title ${p.title.length}c  desc ${p.desc.length}c  faqs ${p.key === "home" ? 0 : faqsFor(p.key).length}`);
