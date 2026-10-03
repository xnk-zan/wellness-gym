// Zero-dependency static build: renders index.html from data.mjs.
// Usage: node build.mjs
import { writeFileSync, existsSync } from "node:fs";
import { site, waLink } from "./data.mjs";

const here = (p) => new URL("./" + p, import.meta.url);
const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ext = `target="_blank" rel="noopener"`;
const b = site.brand;
const days = [...new Set(site.schedule.map((s) => s.day))];
const P = site.photos;

const logo = (cls, w = 40, alt = "Wellness Gym") => `<picture><source srcset="logo-320.webp" type="image/webp"><img class="${cls}" src="logo-320.png" alt="${alt}" width="${w}" height="${w}"></picture>`;
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
  return `<img class="${cls}" src="${esc(p.src)}" srcset="${esc(p.small)} 640w, ${esc(p.src)} ${p.w}w" sizes="${sizes}" alt="${esc(p.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="${p.w}" height="${p.h}"${p.pos ? ` style="object-position:${p.pos}"` : ""}>`;
};

const facilityMedia = (f) => f.photo ? photo(f.photo, "fac__img", undefined, false, f.pos)
  : `<div class="fac__mg" aria-hidden="true">${icons[f.icon]}</div>`;
const heroP = P[site.hero.photo];

const nav = [
  ["#membership", "Membership"],
  ["#classes", "Classes"],
  ["#personal-trainer", "Personal Trainer"],
  ["#facilities", "Facilities"],
  ["#location", "Location"]
];
const navLinks = nav.map(([h, l]) => `<a href="${h}">${l}</a>`).join("");

// Headline split into two deliberate lines; "Kuat," gets the accent.
const [l1, l2] = ["Sehat, Kuat, dan", "Lebih Percaya Diri."];
if (`${l1} ${l2}` !== site.hero.headline) throw new Error("Hero headline drifted from data");
const accent = (s) => esc(s).replace("Kuat,", `<em>Kuat,</em>`);

const marqueeWords = [b.tagline.split(" · "), site.classes.flatMap((c) => c.name.split(" / "))].map((row) =>
  [...row, ...row].map((w) => `<span>${esc(w)}</span><i aria-hidden="true"></i>`).join(""));

const priceNum = (s) => Number(String(s).replace(/[^0-9]/g, ""));

// ---------- Structured data + FAQ: every figure is derived from data.mjs ----------
const idr = (n) => "Rp" + n.toLocaleString("id-ID");
const gymId = site.url + "#gym";
const ptTiers = site.personalTrainer.tiers;
const offers = [
  ...site.membership.single.flatMap((m) => [[`Membership ${m.type} 1 bulan`, m.oneMonth], [`Membership ${m.type} 3 bulan`, m.threeMonth]]),
  ...site.membership.couple.map((c) => [`Membership ${c.type} per bulan`, c.price]),
  ["Visit Gym per kunjungan", site.visitGym.price],
  ...site.classes.map((c) => [`Kelas ${c.name} per kedatangan`, c.price]),
  ...ptTiers.flatMap((t) => t.rows.flatMap((r) => t.cols.map((c, i) => [`Personal Trainer ${t.name} ${r.segment} ${c}`, r.prices[i], site.ptBookingUrl])))
].map(([name, price, url]) => ({ "@type": "Offer", name, price: priceNum(price), priceCurrency: "IDR", ...(url && { url }), itemOffered: { "@type": "Service", name } }));
const prices = offers.map((o) => o.price);
const dayText = days.map((d) => `${d} ${site.schedule.filter((x) => x.day === d).map((x) => `${x.time} ${x.cls}`).join(", ")}`).join("; ");
const m = site.membership;
const faqs = [
  ["Berapa harga membership Wellness Gym Purwokerto?",
    `Membership General ${m.single[0].oneMonth} untuk 1 bulan dan ${m.single[0].threeMonth} untuk 3 bulan. Membership Student ${m.single[1].oneMonth} untuk 1 bulan dan ${m.single[1].threeMonth} untuk 3 bulan. Paket couple: ${m.couple.map((c) => `${c.type} ${c.price}`).join(" dan ")}.`],
  ["Berapa harga visit gym harian?",
    `Visit gym ${site.visitGym.price}. ${site.visitGym.copy} Untuk ketentuan visit, tanyakan lewat WhatsApp ${b.whatsappDisplay}.`],
  ["Jam buka Wellness Gym kapan?",
    b.hours.map((h) => `${h.days} pukul ${h.time}`).join(", ") + "."],
  ["Di mana lokasi Wellness Gym?",
    `${b.address}. Gym ini berada di Purwokerto Utara, Kabupaten Banyumas.`],
  ["Kelas apa saja yang ada dan berapa harganya?",
    site.classes.map((c) => `${c.name} ${c.price}`).join("; ") + `. Jadwal mingguan: ${dayText}. ${site.scheduleNote}`],
  ["Apakah ada Personal Trainer di Wellness Gym?",
    `Ada. Paket ${ptTiers.map((t) => `${t.name} (${t.subtitle.toLowerCase()})`).join(", ")}, harga mulai ${ptTiers[0].rows[0].prices[0]} untuk ${ptTiers[0].cols[0].toLowerCase()} segmen ${ptTiers[0].rows[0].segment.toLowerCase()}. Booking Personal Trainer lewat ${site.ptBookingUrl.replace("https://", "")}.`],
  ["Fasilitas apa saja yang tersedia?",
    site.facilities.map((f) => f.name).join(", ") + "."],
  ["Bagaimana ulasan Wellness Gym?",
    `Rating ${site.socialProof.rating}.`]
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": site.url + "#website", url: site.url, name: b.name, inLanguage: "id-ID", publisher: { "@id": gymId } },
    { "@type": "WebPage", "@id": site.url + "#webpage", url: site.url, name: site.seo.title, description: site.seo.description, inLanguage: "id-ID",
      isPartOf: { "@id": site.url + "#website" }, about: { "@id": gymId }, primaryImageOfPage: { "@type": "ImageObject", url: site.url + "og-image.png", width: 1200, height: 630 } },
    {
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
    },
    { "@type": "FAQPage", "@id": site.url + "#faq", inLanguage: "id-ID", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }
  ]
};

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(site.seo.title)}</title>
<meta name="description" content="${esc(site.seo.description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="${esc(b.name)}">
<meta name="geo.region" content="ID-JT">
<meta name="geo.placename" content="Purwokerto">
<link rel="alternate" hreflang="id" href="${site.url}">
<link rel="alternate" hreflang="x-default" href="${site.url}">
<meta name="theme-color" content="#0d0b12">
<link rel="canonical" href="${site.url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="id_ID">
<meta property="og:site_name" content="${esc(b.name)}">
<meta property="og:url" content="${site.url}">
<meta property="og:title" content="${esc(site.seo.title)}">
<meta property="og:description" content="${esc(site.seo.description)}">
<meta property="og:image" content="${site.url}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Wellness Gym Purwokerto, area latihan dengan alat beban hitam-ungu">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(site.seo.title)}">
<meta name="twitter:description" content="${esc(site.seo.description)}">
<meta name="twitter:image" content="${site.url}og-image.png">
<meta name="twitter:image:alt" content="Wellness Gym Purwokerto, area latihan dengan alat beban hitam-ungu">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=satoshi@400,500,700&display=swap" media="print" onload="this.media='all'">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=satoshi@400,500,700&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap"></noscript>
<link rel="preload" as="image" href="${heroP.src}" imagesrcset="${heroP.small} 640w, ${heroP.src} ${heroP.w}w" imagesizes="100vw">
<link rel="stylesheet" href="styles.css">
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
<script src="script.js" defer></script>
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<a class="skip" href="#main">Lewati ke konten utama</a>
<div class="cursor" aria-hidden="true"><span class="cursor__label"></span></div>

<header class="nav" id="nav">
  <a class="nav__brand" href="#top" aria-label="Wellness Gym, ke atas">${logo("nav__logo")}<span>Wellness Gym</span></a>
  <nav class="nav__links" aria-label="Navigasi utama">${navLinks}</nav>
  ${waBtn(site.waGeneralMessage, "Chat WhatsApp", "gold btn--sm nav__cta")}
  <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu"><span class="nav__toggle-text">Menu</span></button>
</header>
<nav class="menu" id="menu" aria-label="Navigasi mobile" hidden>
  <div class="menu__links">${navLinks}</div>
  ${waBtn(site.waGeneralMessage)}
  <p class="menu__meta">${esc(b.address)}</p>
</nav>

<main id="main">

<section class="hero" id="top" aria-labelledby="hero-title">
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
      ${site.whyUs.points.map((p, i) => {
        const media = site.whyPhotos[i] ? photo(site.whyPhotos[i], "why__img", "(max-width: 600px) 100vw, 44rem") : "";
        const mg = media ? "" : `<div class="why__mg" aria-hidden="true">${icons[["breath", "", "orbit", "coach"][i]]}</div>`;
        return `<li class="why__card${media ? " why__card--photo" : ""}">${media}${mg}<div class="why__body"><span class="why__n" aria-hidden="true">0${i + 1}</span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></div></li>`;
      }).join("\n      ")}
    </ol>
  </div>
</section>

<section class="sec" id="membership" aria-labelledby="membership-title">
  <header class="sec__head">
    <h2 class="sec__title" data-split id="membership-title">Membership</h2>
    ${waBtn(site.membership.waMessage, "Tanya Membership", "line")}
  </header>
  <div class="bento">
    ${site.membership.single.map((m) => `<article class="tile tile--single" data-spot>
      <h3 class="tile__title">${esc(m.type)}</h3>
      <dl class="prices">
        <div><dt>1 Bulan</dt><dd class="num" data-count="${priceNum(m.oneMonth)}">${esc(m.oneMonth)}</dd></div>
        <div><dt>3 Bulan</dt><dd class="num" data-count="${priceNum(m.threeMonth)}">${esc(m.threeMonth)}</dd></div>
      </dl>
    </article>`).join("\n    ")}
    <article class="tile tile--couple" data-spot>
      <h3 class="tile__title">Couple</h3>
      <dl class="prices prices--row">
        ${site.membership.couple.map((c) => `<div><dt>${esc(c.type)}</dt><dd class="num">${esc(c.price)}</dd></div>`).join("\n        ")}
      </dl>
    </article>
    <article class="tile tile--visit" id="visit" data-spot>
      <h3 class="tile__title">Visit Gym</h3>
      <p class="num tile__big">${esc(site.visitGym.price)}</p>
      <p class="tile__copy">${esc(site.visitGym.copy)}</p>
      ${waBtn(site.visitGym.waMessage, "Coba Visit Gym", "dark")}
    </article>
  </div>
</section>

<section class="sec" id="facilities" aria-labelledby="facilities-title">
  <header class="sec__head"><h2 class="sec__title" data-split id="facilities-title">Fasilitas</h2></header>
  <ul class="fac">
    ${site.facilities.map((f, i) => `<li class="fac__item fac__item--${i < 2 ? "big" : "small"}" data-spot>
      <div class="fac__media">${facilityMedia(f)}</div>
      <h3>${esc(f.name)}</h3>
    </li>`).join("\n    ")}
  </ul>
</section>

<div class="ribbon" aria-label="Galeri foto Wellness Gym">
  <ul class="ribbon__track">
    ${site.ribbon.map((k, i) => `<li class="ribbon__item ribbon__item--${P[k].h > P[k].w ? "tall" : "wide"}">${photo(k, "ribbon__img", "(max-width: 767px) 70vw, 32vw")}</li>`).join("\n    ")}
  </ul>
</div>

<section class="sec" id="classes" aria-labelledby="classes-title">
  <header class="sec__head">
    <h2 class="sec__title" data-split id="classes-title">Kelas</h2>
    ${waBtn(site.scheduleWaMessage, "Tanya Jadwal", "line")}
  </header>
  <figure class="classes__banner">${photo(site.classesPhoto, "classes__img", "(max-width: 767px) 100vw, 88rem")}</figure>
  <ul class="classes">
    ${site.classes.map((c) => `<li class="class-row">
      <h3>${esc(c.name)}</h3>
      <p class="num">${esc(c.price)}</p>
    </li>`).join("\n    ")}
  </ul>
</section>

<section class="sec" id="schedule" aria-labelledby="schedule-title">
  <header class="sec__head">
    <h2 class="sec__title" data-split id="schedule-title">Jadwal mingguan</h2>
    ${waBtn(site.scheduleWaMessage, "Tanya Jadwal Terbaru", "line")}
  </header>
  <div class="week" tabindex="0" aria-label="Jadwal kelas per hari">
    ${days.map((d) => `<section class="week__day" aria-labelledby="d-${d}">
      <h3 id="d-${d}">${esc(d)}</h3>
      <ul>${site.schedule.filter((s) => s.day === d).map((s) => `<li><time class="num">${esc(s.time)}</time><span>${esc(s.cls)}</span></li>`).join("")}</ul>
    </section>`).join("\n    ")}
  </div>
  <p class="note">${esc(site.scheduleNote)}</p>
</section>

<section class="sec pt" id="personal-trainer" aria-labelledby="pt-title">
  <header class="sec__head">
    <h2 class="sec__title" data-split id="pt-title">Personal Trainer</h2>
    <a class="spin" href="${site.ptBookingUrl}" ${ext} data-cursor="Booking">
      <svg viewBox="0 0 200 200" class="spin__ring" aria-hidden="true"><defs><path id="ring" d="M100 100m-76 0a76 76 0 1 1 152 0a76 76 0 1 1-152 0"/></defs><text><textPath href="#ring">Booking Personal Trainer · xnkbooking.my.id · </textPath></text></svg>
      <span class="spin__core">${arrow}</span>
      <span class="sr-only">Booking Personal Trainer di xnkbooking.my.id</span>
    </a>
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
        <tbody>${t.cols.map((c, ci) => `<tr><th scope="row">${esc(c)}</th>${t.rows.map((r) => `<td class="num">${esc(r.prices[ci])}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </article>`).join("\n    ")}
  </div>
  <div class="pt__cta">
    ${btn(site.ptBookingUrl, "Booking Personal Trainer", "gold", ext + ' data-cursor="Booking"')}
    ${waBtn(site.personalTrainer.waMessage, "Konsultasi via WhatsApp", "line")}
  </div>
</section>

<section class="sec reviews" id="reviews" aria-labelledby="reviews-title">
  <header class="reviews__head">
    <h2 class="sr-only" id="reviews-title">Ulasan Google</h2>
    <p class="rating"><span class="rating__n" data-count="${b.rating}" data-decimals="1">${b.rating}</span><span class="rating__meta">${esc(site.socialProof.rating)}</span></p>
  </header>
  <ul class="wall">
    ${site.socialProof.testimonials.map((t, i) => `<li class="wall__item wall__item--${i}">
      <blockquote><p>&ldquo;${esc(t.text)}&rdquo;</p></blockquote>
      <p class="wall__by">${esc(t.name)} <span>Google Review</span></p>
    </li>`).join("\n    ")}
  </ul>
</section>

<section class="sec faq" id="faq" aria-labelledby="faq-title">
  <header class="sec__head"><h2 class="sec__title" data-split id="faq-title">Pertanyaan umum</h2></header>
  <dl class="faq__list">
    ${faqs.map(([q, a]) => `<div class="faq__item"><dt><h3>${esc(q)}</h3></dt><dd>${esc(a)}</dd></div>`).join("\n    ")}
  </dl>
</section>

<section class="sec loc" id="location" aria-labelledby="location-title">
  <div class="loc__info">
    <h2 class="sec__title" data-split id="location-title">Lokasi &amp; jam buka</h2>
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
</section>

<section class="final" id="mulai" aria-labelledby="final-title">
  <h2 class="final__title" id="final-title"><span class="final__a">Sudah siap</span> <span class="final__mask" style="--img:url('${heroP.src}')">mulai latihan?</span></h2>
  <p class="final__copy">${esc(site.finalCta.copy)}</p>
  <div class="hero__ctas">
    ${waBtn(site.waGeneralMessage)}
    ${btn("#membership", "Lihat Membership", "line")}
  </div>
  <p class="final__contact">WhatsApp <a class="num" href="${esc(waLink(site.waGeneralMessage))}" ${ext}>${esc(site.finalCta.contact)}</a></p>
</section>

</main>

<footer class="footer">
  <div class="footer__grid">
    <div>
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
  <p class="footer__word" aria-hidden="true">Wellness Gym</p>
</footer>

<div class="dock" aria-label="Aksi cepat">
  ${btn("#membership", "Membership", "line")}
  ${waBtn(site.waGeneralMessage)}
</div>
</body>
</html>
`;

// Self-check: every business value from data must land in the output, links must be well-formed.
const must = [
  site.hero.headline.split(" ").pop(),
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
for (const m of html.matchAll(/src="(assets\/[^"]+)"/g)) if (!existsSync(here(m[1]))) throw new Error("Missing asset: " + m[1]);

writeFileSync(here("index.html"), html);
console.log("index.html written,", html.length, "bytes,", must.length, "values verified,");

// ---------- Generated crawler/PWA files ----------
const base = new URL(site.url).pathname;
const today = new Date().toISOString().slice(0, 10);
const imgUrls = [...new Set([site.hero.photo, ...site.whyPhotos, ...site.ribbon, site.classesPhoto, ...site.facilities.map((f) => f.photo).filter(Boolean)])];
writeFileSync(here("sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${site.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${imgUrls.map((k) => `    <image:image><image:loc>${site.url}${P[k].src}</image:loc><image:caption>${esc(P[k].alt)}</image:caption></image:image>`).join("\n")}
  </url>
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

${b.name} (${b.tagline}) adalah gym di Purwokerto Utara, Kabupaten Banyumas, Jawa Tengah. Halaman utama: ${site.url}

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
${faqs.map(([q, a]) => `### ${q}\n${a}`).join("\n\n")}
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
console.log("sitemap, robots, llms.txt, 404, manifest written;", faqs.length, "FAQs,", offers.length, "offers");
