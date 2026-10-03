// Single source of truth for business data (ported from ../data.gs, per PRD.md).
// Do not change prices/schedule here unless PRD changes. Run `node build.mjs` after editing.

const address = "Jl. Jatisari No.24, Karangmiri, Sumampir, Kec. Purwokerto Utara, Kab. Banyumas, Jawa Tengah 53125";

export const site = {
  url: "https://xnk-zan.github.io/wellness-gym/",
  ptBookingUrl: "https://xnkbooking.my.id",

  brand: {
    name: "Wellness Gym",
    tagline: "Health · Strength · Balance",
    address,
    whatsappNumber: "6285218724659",
    whatsappDisplay: "0852-1872-4659",
    telephone: "+62 852-1872-4659",
    instagram: "@wellnessgympwt",
    instagramUrl: "https://www.instagram.com/wellnessgympwt",
    tiktok: "@wellnessgympwt",
    tiktokUrl: "https://www.tiktok.com/@wellnessgympwt",
    rating: 4.9,
    reviewCount: 17,
    hours: [
      { days: "Senin–Sabtu", time: "06.00–21.00" },
      { days: "Minggu", time: "06.00–12.00" }
    ],
    mapsEmbedUrl: "https://maps.google.com/maps?q=" + encodeURIComponent(address) + "&output=embed",
    mapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(address)
  },

  hero: {
    headline: "Sehat, Kuat, dan Lebih Percaya Diri.",
    subcopy: "Wellness Gym hadir untuk kamu yang ingin mulai berolahraga, membangun kekuatan, menjaga kebugaran, atau mengikuti kelas dalam lingkungan yang nyaman.",
    location: "Purwokerto Utara · Jl. Jatisari No.24"
  },

  quickInfo: [
    { value: "Rp25.000", label: "Visit Gym" },
    { value: "Mulai Rp100.000", label: "Membership Mahasiswa" },
    { value: "06.00–21.00", label: "Senin–Sabtu" },
    { value: "Beragam Kelas", label: "Zumba · Yoga · Aerobic · BL Power" }
  ],

  whyUs: {
    headline: "Bukan Sekadar Tempat Latihan.",
    points: [
      { title: "Nyaman untuk Berlatih", desc: "Lingkungan nyaman dan friendly untuk berbagai kalangan." },
      { title: "Fasilitas untuk Berlatih", desc: "Fasilitas pendukung untuk latihan sehari-hari." },
      { title: "Lebih dari Sekadar Gym", desc: "Gym, kelas olahraga, atau personal training." },
      { title: "Ada Pendampingan", desc: "Instruktur gym dan personal trainer tersedia." }
    ]
  },

  membership: {
    single: [
      { type: "General", oneMonth: "Rp130.000", threeMonth: "Rp350.000" },
      { type: "Student", oneMonth: "Rp100.000", threeMonth: "Rp280.000" }
    ],
    couple: [
      { type: "Mahasiswa Couple", price: "Rp190.000/bulan" },
      { type: "Umum Couple", price: "Rp250.000/bulan" }
    ],
    waMessage: "Halo Wellness Gym, saya ingin menanyakan membership."
  },

  visitGym: {
    price: "Rp25.000 / visit",
    copy: "Kamu tidak harus langsung mengambil membership. Datang dan rasakan sendiri suasana Wellness Gym.",
    waMessage: "Halo Wellness Gym, saya ingin mencoba visit gym. Boleh info ketentuannya?"
  },

  // image: set to a real photo path (e.g. "assets/facility-wifi.webp") to replace the placeholder.
  facilities: [
    { name: "Free WiFi", image: "" },
    { name: "Free Instruktur Gym", image: "" },
    { name: "Tersedia Personal Trainer", image: "" },
    { name: "Shower", image: "" },
    { name: "Locker", image: "" },
    { name: "Gym Equipment", image: "" }
  ],

  classes: [
    { name: "Aerobic / BL Power", price: "Rp15.000 / kedatangan" },
    { name: "BL Twerking", price: "Rp20.000 / kedatangan" },
    { name: "Zumba", price: "Rp25.000 / kedatangan" },
    { name: "Yoga", price: "Rp35.000 / kedatangan" }
  ],

  schedule: [
    { day: "Senin", time: "08.15", cls: "Zumba" },
    { day: "Senin", time: "16.30", cls: "Aerobic Pemula" },
    { day: "Selasa", time: "08.00", cls: "BL Twerking" },
    { day: "Selasa", time: "16.30", cls: "Yoga" },
    { day: "Selasa", time: "18.30", cls: "BL Power" },
    { day: "Rabu", time: "09.00", cls: "Linedance" },
    { day: "Rabu", time: "16.30", cls: "Aero Advance" },
    { day: "Kamis", time: "08.15", cls: "Aerobic Pemula" },
    { day: "Kamis", time: "16.30", cls: "Zumba" },
    { day: "Jumat", time: "16.30", cls: "BL Power Exercise" },
    { day: "Sabtu", time: "15.15", cls: "Yoga" },
    { day: "Sabtu", time: "16.30", cls: "Aerobic Advance" }
  ],
  scheduleNote: "Jadwal kelas dapat berubah. Hubungi Wellness Gym untuk jadwal terbaru.",
  scheduleWaMessage: "Halo Wellness Gym, saya ingin menanyakan jadwal kelas terbaru minggu ini.",

  personalTrainer: {
    tiers: [
      {
        name: "ENTRY", subtitle: "Hanya Sesi",
        cols: ["4 Sesi", "8 Sesi"],
        rows: [
          { segment: "Mahasiswa", prices: ["Rp250.000", "Rp450.000"] },
          { segment: "Umum", prices: ["Rp350.000", "Rp650.000"] }
        ],
        includes: ["Pendampingan latihan", "Koreksi teknik", "Penjelasan gerakan"]
      },
      {
        name: "CORE", subtitle: "Paket Pelatihan",
        cols: ["4 Sesi+Program", "8 Sesi+Program", "12 Sesi+Program"],
        rows: [
          { segment: "Mahasiswa", prices: ["Rp400.000", "Rp700.000", "Rp900.000"] },
          { segment: "Umum", prices: ["Rp500.000", "Rp900.000", "Rp1.200.000"] }
        ],
        includes: ["Program terstruktur", "Pendampingan latihan", "Tracking progres & beban", "Evaluasi tubuh dasar"]
      },
      {
        name: "PREMIUM", subtitle: "Pelatihan Penuh",
        cols: ["8 Sesi", "12 Sesi"],
        rows: [
          { segment: "Mahasiswa", prices: ["Rp900.000", "Rp1.200.000"] },
          { segment: "Umum", prices: ["Rp1.100.000", "Rp1.500.000"] }
        ],
        includes: ["Semua fitur Core", "Pendampingan prioritas", "Dukungan WhatsApp/video", "Penyesuaian progres lebih cepat"]
      }
    ],
    waMessage: "Halo Wellness Gym, saya ingin konsultasi mengenai Personal Trainer. Saya ingin mengetahui paket yang sesuai dengan kebutuhan saya."
  },

  socialProof: {
    rating: "4.9/5 · 17 Google Reviews",
    testimonials: [
      { name: "Aisyah Rafhanah Razali", text: "Affordable membership fees for student, spotless gym, positive vibe in the air, good environment to workout, good coaching, newbie friendly and lovely staff." },
      { name: "Syamimi Syamilah", text: "good coaching and facilities. friendly staff" },
      { name: "Anggun Wulandari", text: "The gym is very comfortable and has many exercise classes..." }
    ]
  },

  finalCta: {
    headline: "Sudah Siap Mulai Latihan?",
    copy: "Tidak perlu menunggu sampai benar-benar siap. Datang, coba, dan mulai dari langkah pertama.",
    contact: "0852-1872-4659"
  },

  waGeneralMessage: "Halo Wellness Gym, saya ingin mengetahui informasi gym dan membership.",

  seo: {
    title: "Wellness Gym Purwokerto | Gym, Kelas & Personal Trainer",
    description: "Wellness Gym Purwokerto menyediakan membership gym, berbagai kelas olahraga, fasilitas gym, dan Personal Trainer. Temukan harga, jadwal kelas, lokasi, dan hubungi kami."
  }
};

export const waLink = (message) =>
  `https://wa.me/${site.brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
