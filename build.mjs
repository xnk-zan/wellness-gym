// Zero-dependency static build: renders index.html from data.mjs.
// Usage: node build.mjs
import { writeFileSync } from "node:fs";
import { site, waLink } from "./data.mjs";

const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ext = `target="_blank" rel="noopener"`;
const b = site.brand;
const days = [...new Set(site.schedule.map((s) => s.day))];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const logo = (cls, w = 40) => `<picture><source srcset="logo-320.webp" type="image/webp"><img class="${cls}" src="logo-320.png" alt="Wellness Gym" width="${w}" height="${w}"></picture>`;

const btn = (href, label, variant, extra = "") =>
  `<a class="btn btn--${variant}" href="${esc(href)}"${extra ? " " + extra : ""}><span>${esc(label)}</span></a>`;
const waBtn = (msg, label = "Chat WhatsApp", variant = "gold") => btn(waLink(msg), label, variant, ext);

// Placeholder media: swap for a real photo by setting `image` in data.mjs.
const media = (image, alt, i) => image
  ? `<img class="media__img" src="${esc(image)}" alt="${esc(alt)}" loading="lazy" decoding="async" width="800" height="600">`
  : `<div class="media__ph" style="--h:${i}" role="img" aria-label="${esc(alt)} (placeholder, foto asli menyusul)"><span>Foto menyusul</span></div>`;

const nav = [
  ["#membership", "Membership"],
  ["#classes", "Classes"],
  ["#personal-trainer", "Personal Trainer"],
  ["#facilities", "Facilities"],
  ["#location", "Location"]
];
const navLinks = nav.map(([h, l]) => `<a href="${h}">${l}</a>`).join("");

const heroWords = site.hero.headline.split(" ").map((w, i) =>
  `<span class="ignite${w === "Kuat," ? " ignite--accent" : ""}" style="--i:${i}">${esc(w)}</span>`).join(" ");

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: b.name,
  slogan: b.tagline,
  url: site.url,
  image: site.url + "og-image.png",
  logo: site.url + "logo.png",
  telephone: b.telephone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Jatisari No.24, Karangmiri, Sumampir",
    addressLocality: "Purwokerto Utara",
    addressRegion: "Jawa Tengah",
    postalCode: "53125",
    addressCountry: "ID"
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "06:00", closes: "21:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "06:00", closes: "12:00" }
  ],
  aggregateRating: { "@type": "AggregateRating", ratingValue: b.rating, reviewCount: b.reviewCount, bestRating: 5 },
  sameAs: [b.instagramUrl, b.tiktokUrl]
};

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(site.seo.title)}</title>
<meta name="description" content="${esc(site.seo.description)}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#24104F">
<link rel="canonical" href="${site.url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="id_ID">
<meta property="og:url" content="${site.url}">
<meta property="og:title" content="${esc(site.seo.title)}">
<meta property="og:description" content="${esc(site.seo.description)}">
<meta property="og:image" content="${site.url}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(site.seo.title)}">
<meta name="twitter:description" content="${esc(site.seo.description)}">
<meta name="twitter:image" content="${site.url}og-image.png">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,800;1,9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="styles.css">
<script>
  // Reveal animations only arm when JS runs; if script.js never loads, content is un-hidden.
  document.documentElement.classList.add("js");
  setTimeout(function () { if (!window.__wg) document.documentElement.classList.remove("js"); }, 2500);
</script>
<script src="script.js" defer></script>
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<a class="skip" href="#main">Lewati ke konten utama</a>
<div class="progress" aria-hidden="true"><span></span></div>

<header class="nav" id="nav">
  <div class="nav__pill">
    <a class="nav__brand" href="#top" aria-label="Wellness Gym, ke atas">${logo("nav__logo")}<span>Wellness Gym</span></a>
    <nav class="nav__links" aria-label="Navigasi utama">${navLinks}</nav>
    ${waBtn(site.waGeneralMessage, "Chat WhatsApp", "gold btn--sm nav__cta")}
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Buka menu"><span></span><span></span></button>
  </div>
  <nav class="nav__menu" id="menu" aria-label="Navigasi mobile" hidden>${navLinks}${waBtn(site.waGeneralMessage)}</nav>
</header>

<main id="main">

<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="hero__light" aria-hidden="true"></div>
  ${logo("hero__mark", 640).replace("<img", '<img aria-hidden="true"').replace('alt="Wellness Gym"', 'alt=""')}
  <div class="hero__inner wrap">
    <p class="eyebrow eyebrow--light">${esc(b.tagline)}</p>
    <h1 class="hero__title" id="hero-title">${heroWords}</h1>
    <p class="hero__sub">${esc(site.hero.subcopy)}</p>
    <div class="hero__ctas">
      ${waBtn(site.waGeneralMessage)}
      ${btn("#membership", "Lihat Membership", "ghost")}
    </div>
    <p class="hero__loc"><a href="${esc(b.mapsDirectionsUrl)}" ${ext}>${esc(site.hero.location)}</a></p>
  </div>
  <ul class="quick wrap" id="info" aria-label="Informasi singkat">
    ${site.quickInfo.map((q, i) => `<li class="quick__item" data-reveal="bar" style="--i:${i}"><strong>${esc(q.value)}</strong><span>${esc(q.label)}</span></li>`).join("\n    ")}
  </ul>
</section>

<section class="chapter chapter--light why" id="why" aria-labelledby="why-title">
  <div class="wrap why__grid">
    <div class="why__head">
      <h2 class="display" id="why-title">${esc(site.whyUs.headline)}</h2>
    </div>
    <ol class="why__list">
      ${site.whyUs.points.map((p) => `<li class="why__point"><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>

<section class="chapter chapter--dark plate" id="membership" aria-labelledby="membership-title">
  <div class="wrap">
    <header class="sec-head">
      <h2 class="display" id="membership-title">Membership</h2>
      ${waBtn(site.membership.waMessage, "Tanya Membership")}
    </header>
    <div class="bento">
      ${site.membership.single.map((m, i) => `<article class="card bento__single" data-reveal="${i ? "right" : "left"}">
        <h3 class="card__title">${esc(m.type)}</h3>
        <dl class="price-list">
          <div><dt>1 Bulan</dt><dd class="price">${esc(m.oneMonth)}</dd></div>
          <div><dt>3 Bulan</dt><dd class="price">${esc(m.threeMonth)}</dd></div>
        </dl>
      </article>`).join("\n      ")}
      <article class="card bento__couple" data-reveal="up">
        <h3 class="card__title">Couple</h3>
        <dl class="price-list price-list--row">
          ${site.membership.couple.map((c) => `<div><dt>${esc(c.type)}</dt><dd class="price">${esc(c.price)}</dd></div>`).join("\n          ")}
        </dl>
      </article>
      <article class="card card--gold bento__visit" id="visit" data-reveal="up">
        <h3 class="card__title">Visit Gym</h3>
        <p class="price">${esc(site.visitGym.price)}</p>
        <p class="card__copy">${esc(site.visitGym.copy)}</p>
        ${waBtn(site.visitGym.waMessage, "Coba Visit Gym", "dark")}
      </article>
    </div>
  </div>
</section>

<section class="chapter chapter--light plate plate--rev" id="facilities" aria-labelledby="facilities-title">
  <div class="wrap">
    <header class="sec-head"><h2 class="display" id="facilities-title">Fasilitas</h2></header>
    <ul class="facilities">
      ${site.facilities.map((f, i) => `<li class="facility" data-reveal="shutter" style="--i:${i}">
        <div class="media">${media(f.image, f.name, i)}</div>
        <h3>${esc(f.name)}</h3>
      </li>`).join("\n      ")}
    </ul>
  </div>
</section>

<section class="chapter chapter--dark plate" id="classes" aria-labelledby="classes-title">
  <div class="wrap">
    <header class="sec-head">
      <h2 class="display" id="classes-title">Kelas</h2>
      ${waBtn(site.scheduleWaMessage, "Tanya Jadwal", "ghost")}
    </header>
    <ul class="accordion">
      ${site.classes.map((c, i) => `<li class="slice${i === 0 ? " is-open" : ""}" tabindex="0" style="--h:${i}">
        <h3 class="slice__name">${esc(c.name)}</h3>
        <p class="slice__price price">${esc(c.price)}</p>
      </li>`).join("\n      ")}
    </ul>
  </div>
</section>

<section class="chapter chapter--light plate plate--rev" id="schedule" aria-labelledby="schedule-title">
  <div class="wrap">
    <header class="sec-head"><h2 class="display" id="schedule-title">Jadwal Mingguan</h2></header>
    <div class="tabs" role="tablist" aria-label="Pilih hari" hidden>
      ${days.map((d, i) => `<button class="tab" type="button" role="tab" id="tab-${slug(d)}" aria-controls="day-${slug(d)}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ""}>${esc(d)}</button>`).join("")}
      <span class="tabs__rail" aria-hidden="true"></span>
    </div>
    <div class="days">
      ${days.map((d) => `<section class="day" id="day-${slug(d)}" aria-labelledby="day-h-${slug(d)}">
        <h3 class="day__name" id="day-h-${slug(d)}">${esc(d)}</h3>
        <ul class="day__list">${site.schedule.filter((s) => s.day === d).map((s) => `<li><time>${esc(s.time)}</time><span>${esc(s.cls)}</span></li>`).join("")}</ul>
      </section>`).join("\n      ")}
    </div>
    <div class="note-row">
      <p class="note">${esc(site.scheduleNote)}</p>
      ${waBtn(site.scheduleWaMessage, "Tanya Jadwal Terbaru", "purple")}
    </div>
  </div>
</section>

<section class="chapter chapter--dark plate" id="personal-trainer" aria-labelledby="pt-title">
  <div class="wrap">
    <header class="sec-head">
      <h2 class="display" id="pt-title">Personal Trainer</h2>
      <div class="sec-head__ctas">
        ${btn(site.ptBookingUrl, "Booking PT", "gold", ext)}
        ${waBtn(site.personalTrainer.waMessage, "Konsultasi PT", "ghost")}
      </div>
    </header>
    <div class="stack">
      ${site.personalTrainer.tiers.map((t, i) => `<article class="tier" style="--i:${i}">
        <div class="tier__info">
          <h3 class="tier__name">${esc(t.name)}</h3>
          <p class="tier__sub">${esc(t.subtitle)}</p>
          <ul class="tier__inc">${t.includes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        </div>
        <table class="tier__table">
          <caption class="sr-only">Harga ${esc(t.name)} — ${esc(t.subtitle)}</caption>
          <thead><tr><th scope="col">Paket</th>${t.rows.map((r) => `<th scope="col">${esc(r.segment)}</th>`).join("")}</tr></thead>
          <tbody>${t.cols.map((c, ci) => `<tr><th scope="row">${esc(c)}</th>${t.rows.map((r) => `<td class="price">${esc(r.prices[ci])}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </article>`).join("\n      ")}
    </div>
    <div class="pt-cta">
      ${btn(site.ptBookingUrl, "Booking Personal Trainer", "gold", ext)}
      ${waBtn(site.personalTrainer.waMessage, "Konsultasi via WhatsApp", "ghost")}
    </div>
  </div>
</section>

<section class="chapter chapter--white plate plate--rev" id="reviews" aria-labelledby="reviews-title">
  <div class="wrap">
    <header class="sec-head">
      <h2 class="display" id="reviews-title"><span class="rating">${b.rating}</span><span class="rating__meta">${esc(site.socialProof.rating)}</span></h2>
      <div class="carousel__ctrl">
        <button class="round" type="button" data-dir="-1" aria-label="Ulasan sebelumnya" aria-controls="track">&larr;</button>
        <button class="round" type="button" data-dir="1" aria-label="Ulasan berikutnya" aria-controls="track">&rarr;</button>
      </div>
    </header>
    <ul class="carousel" id="track" tabindex="0" aria-label="Ulasan Google">
      ${site.socialProof.testimonials.map((t) => `<li class="quote">
        <blockquote><p>&ldquo;${esc(t.text)}&rdquo;</p></blockquote>
        <p class="quote__by">${esc(t.name)} <span>· Google Review</span></p>
      </li>`).join("\n      ")}
    </ul>
  </div>
</section>

<section class="chapter chapter--light" id="location" aria-labelledby="location-title">
  <div class="wrap loc">
    <div class="loc__info">
      <h2 class="display" id="location-title">Lokasi &amp; Jam Buka</h2>
      <button class="copy" type="button" data-copy="${esc(b.address)}">
        <span class="copy__text">${esc(b.address)}</span>
        <span class="copy__hint">Ketuk untuk salin alamat</span>
      </button>
      <p class="toast" role="status" aria-live="polite"></p>
      <dl class="hours">
        ${b.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join("\n        ")}
      </dl>
      <div class="loc__ctas">
        ${btn(b.mapsDirectionsUrl, "Dapatkan Arah", "purple", ext)}
        ${waBtn(site.waGeneralMessage, "Chat WhatsApp", "outline")}
      </div>
    </div>
    <div class="loc__map">
      <iframe src="${esc(b.mapsEmbedUrl)}" title="Peta lokasi Wellness Gym" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>

<section class="chapter chapter--dark plate final" id="mulai" aria-labelledby="final-title">
  <div class="hero__light" aria-hidden="true"></div>
  <div class="wrap final__inner">
    <h2 class="final__title" id="final-title">Sudah Siap <span class="pill" aria-hidden="true">${logo("pill__logo", 48).replace('alt="Wellness Gym"', 'alt=""')}</span> Mulai Latihan?</h2>
    <p class="final__copy">${esc(site.finalCta.copy)}</p>
    <div class="hero__ctas">
      ${waBtn(site.waGeneralMessage)}
      ${btn("#membership", "Lihat Membership", "ghost")}
    </div>
    <p class="final__contact">WhatsApp <a href="${esc(waLink(site.waGeneralMessage))}" ${ext}>${esc(site.finalCta.contact)}</a></p>
  </div>
</section>

</main>

<footer class="footer">
  <div class="wrap footer__grid">
    <div>
      <p class="footer__brand">${esc(b.name)}</p>
      <p class="footer__tag">${esc(b.tagline)}</p>
      <address>${esc(b.address)}</address>
    </div>
    <nav aria-label="Navigasi footer" class="footer__nav">${navLinks}</nav>
    <ul class="footer__social">
      <li><a href="${esc(waLink(site.waGeneralMessage))}" ${ext}>WhatsApp ${esc(b.whatsappDisplay)}</a></li>
      <li><a href="${b.instagramUrl}" ${ext}>Instagram ${esc(b.instagram)}</a></li>
      <li><a href="${b.tiktokUrl}" ${ext}>TikTok ${esc(b.tiktok)}</a></li>
    </ul>
  </div>
</footer>

<div class="dock" aria-label="Aksi cepat">
  ${btn("#membership", "Lihat Membership", "outline-light")}
  ${waBtn(site.waGeneralMessage)}
</div>
</body>
</html>
`;

// Self-check: every business value from data must land in the output, links must be well-formed.
const must = [
  ...site.quickInfo.flatMap((q) => [q.value, q.label]),
  ...site.membership.single.flatMap((m) => [m.oneMonth, m.threeMonth]),
  ...site.membership.couple.map((c) => c.price), site.visitGym.price,
  ...site.classes.map((c) => c.price),
  ...site.schedule.flatMap((s) => [s.time, s.cls]),
  ...site.personalTrainer.tiers.flatMap((t) => t.rows.flatMap((r) => r.prices)),
  ...site.socialProof.testimonials.map((t) => t.text), site.finalCta.contact
].map(esc);
const missing = must.filter((s) => !html.includes(s));
if (missing.length) throw new Error("Missing in output: " + missing.join(" | "));
for (const m of html.matchAll(/href="(https:\/\/wa\.me[^"]*)"/g)) {
  if (!m[1].startsWith(`https://wa.me/${b.whatsappNumber}?text=`)) throw new Error("Bad WA link: " + m[1]);
}
if (!html.includes(`href="${site.ptBookingUrl}"`)) throw new Error("PT booking link missing");

writeFileSync(new URL("./index.html", import.meta.url), html);
console.log("index.html written,", html.length, "bytes,", must.length, "values verified");
