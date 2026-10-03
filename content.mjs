// Editorial content: tips articles with cited references, and the gallery.
// Citations: write {{id}} in text; build.mjs numbers them per article and links to the reference list.
// References were verified against PubMed on 2026-10-03 (PMID + DOI below).

export const contentDate = "2026-10-03";

export const references = {
  who: {
    authors: "Bull FC, Al-Ansari SS, Biddle S, et al.", year: 2020,
    title: "World Health Organization 2020 guidelines on physical activity and sedentary behaviour.",
    journal: "Br J Sports Med", volume: "54", issue: "24", pages: "1451-1462",
    doi: "10.1136/bjsports-2020-102955", pmid: "33239350"
  },
  acsm: {
    authors: "American College of Sports Medicine.", year: 2009,
    title: "American College of Sports Medicine position stand. Progression models in resistance training for healthy adults.",
    journal: "Med Sci Sports Exerc", volume: "41", issue: "3", pages: "687-708",
    doi: "10.1249/MSS.0b013e3181915670", pmid: "19204579"
  },
  schoenfeld: {
    authors: "Schoenfeld BJ, Ogborn D, Krieger JW.", year: 2016,
    title: "Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis.",
    journal: "Sports Med", volume: "46", issue: "11", pages: "1689-1697",
    doi: "10.1007/s40279-016-0543-8", pmid: "27102172"
  },
  morton: {
    authors: "Morton RW, Murphy KT, McKellar SR, et al.", year: 2018,
    title: "A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults.",
    journal: "Br J Sports Med", volume: "52", issue: "6", pages: "376-384",
    doi: "10.1136/bjsports-2017-097608", pmid: "28698222"
  },
  singh: {
    authors: "Singh B, Olds T, Curtis R, et al.", year: 2023,
    title: "Effectiveness of physical activity interventions for improving depression, anxiety and distress: an overview of systematic reviews.",
    journal: "Br J Sports Med", volume: "57", issue: "18", pages: "1203-1209",
    doi: "10.1136/bjsports-2022-106195", pmid: "36796860"
  }
};

export const articles = [
  {
    slug: "latihan-beban-berapa-kali-seminggu",
    crumb: "Frekuensi latihan beban",
    title: "Berapa Kali Seminggu Latihan Beban? Kata Penelitian | Wellness Gym",
    desc: "Ringkasan bukti ilmiah tentang frekuensi latihan beban untuk pemula: rekomendasi WHO, meta-analisis pembesaran otot, dan posisi ACSM, lengkap dengan referensi.",
    h1: "Berapa kali seminggu sebaiknya latihan beban?",
    intro: "Jawaban singkat dari penelitian: mulai dengan 2–3 sesi per minggu, dan latih tiap otot besar minimal dua kali seminggu.",
    points: [
      "WHO merekomendasikan aktivitas penguatan otot secara teratur untuk semua kelompok usia.{{who}}",
      "Untuk pemula, ACSM menyarankan frekuensi latihan 2–3 hari per minggu.{{acsm}}",
      "Melatih satu kelompok otot dua kali seminggu memberi hasil pembesaran otot lebih baik daripada sekali seminggu, pada volume latihan yang disamakan.{{schoenfeld}}"
    ],
    sections: [
      { h: "Apa kata pedoman kesehatan", p: [
        "Pedoman WHO 2020 meminta semua orang dewasa melakukan 150–300 menit aktivitas aerobik intensitas sedang, atau 75–150 menit intensitas berat, atau kombinasi yang setara, setiap minggu.{{who}} Pedoman yang sama merekomendasikan aktivitas penguatan otot secara teratur untuk semua kelompok usia.{{who}}"
      ] },
      { h: "Frekuensi untuk pemula", p: [
        "ACSM mendefinisikan pemula sebagai orang yang belum pernah berlatih beban, atau sudah beberapa tahun tidak berlatih. Untuk kelompok ini frekuensi yang disarankan adalah 2–3 hari per minggu. Untuk tingkat menengah (sekitar 6 bulan berlatih konsisten) 3–4 hari, dan untuk tingkat lanjut 4–5 hari per minggu.{{acsm}}"
      ] },
      { h: "Seberapa sering tiap otot dilatih", p: [
        "Sebuah meta-analisis dari 10 studi membandingkan frekuensi melatih satu kelompok otot 1 sampai 3 hari per minggu, dengan volume latihan yang disamakan. Hasilnya, melatih otot dua kali seminggu lebih unggul daripada sekali seminggu untuk pembesaran otot. Apakah tiga kali seminggu lebih baik lagi belum dapat dipastikan. Para penulis menyimpulkan otot-otot besar sebaiknya dilatih minimal dua kali seminggu.{{schoenfeld}}"
      ] },
      { h: "Jadi, bagaimana menerapkannya", p: [
        "Program 2–3 sesi per minggu yang menyentuh tiap otot besar minimal dua kali sudah sejalan dengan ketiga sumber di atas. Ini ringkasan umum. Program yang tepat tetap bergantung pada tujuan, kemampuan fisik, dan status latihanmu.{{acsm}}"
      ] }
    ],
    refs: ["who", "acsm", "schoenfeld"]
  },
  {
    slug: "progresi-beban-untuk-pemula",
    crumb: "Progresi beban untuk pemula",
    title: "Cara Menaikkan Beban untuk Pemula Menurut ACSM | Wellness Gym",
    desc: "Cara menaikkan beban latihan secara bertahap untuk pemula berdasarkan posisi resmi American College of Sports Medicine: repetisi, frekuensi, dan kenaikan beban.",
    h1: "Cara menaikkan beban untuk pemula",
    intro: "Tubuh berhenti beradaptasi jika beban tidak pernah naik. Posisi resmi ACSM memberi patokan yang jelas untuk pemula.",
    points: [
      "Untuk pemula, pilih beban yang setara 8–12 RM.{{acsm}}",
      "Frekuensi yang disarankan 2–3 hari per minggu.{{acsm}}",
      "Naikkan beban 2–10% ketika kamu bisa melakukan 1–2 repetisi lebih banyak dari target.{{acsm}}"
    ],
    sections: [
      { h: "Kenapa beban perlu naik", p: [
        "Untuk merangsang adaptasi lanjutan menuju tujuan latihan tertentu, protokol latihan beban yang progresif diperlukan.{{acsm}}"
      ] },
      { h: "Apa itu RM", p: [
        "RM adalah singkatan dari repetition maximum, yaitu beban terberat yang bisa kamu angkat untuk jumlah repetisi tertentu. Beban 8–12 RM berarti beban yang membuatmu mencapai batas kemampuan di repetisi ke-8 sampai ke-12. ACSM menyarankan rentang ini untuk pemula, yaitu orang tanpa pengalaman latihan beban atau yang sudah beberapa tahun tidak berlatih.{{acsm}}"
      ] },
      { h: "Kapan menaikkan beban", p: [
        "Ketika kamu sudah bisa melakukan beban kerja saat ini untuk satu sampai dua repetisi di atas target, ACSM menyarankan menaikkan beban sebesar 2–10%.{{acsm}} Sebagai gambaran hitung, jika beban kerjamu 20 kg, kenaikan 2–10% setara 0,4–2 kg."
      ] },
      { h: "Urutan latihan", p: [
        "Agar intensitas latihan tetap terjaga, ACSM menyarankan urutan gerakan sebagai berikut: otot besar sebelum otot kecil, dan gerakan multi-sendi sebelum gerakan satu sendi.{{acsm}}"
      ] },
      { h: "Catatan penting", p: [
        "Posisi resmi ini ditulis untuk orang dewasa sehat. ACSM menekankan bahwa rekomendasi perlu disesuaikan dengan tujuan, kapasitas fisik, dan status latihan masing-masing orang.{{acsm}} Jika kamu punya riwayat cedera atau kondisi medis, konsultasikan dulu sebelum menaikkan beban."
      ] }
    ],
    refs: ["acsm"]
  },
  {
    slug: "protein-dan-massa-otot",
    crumb: "Protein dan massa otot",
    title: "Protein dan Massa Otot: Kata Meta-Analisis 49 Studi | Wellness Gym",
    desc: "Apa kata meta-analisis 49 studi tentang suplemen protein dan latihan beban: besar manfaat, batas sekitar 1,6 g/kg per hari, dan siapa yang paling diuntungkan.",
    h1: "Protein dan massa otot: apa kata bukti?",
    intro: "Suplemen protein sering dianggap wajib bagi yang berlatih beban. Meta-analisis besar memberi gambaran yang lebih terukur.",
    points: [
      "Analisis 49 studi dengan 1.863 peserta menunjukkan suplemen protein menambah kekuatan dan massa bebas lemak selama latihan beban minimal 6 minggu.{{morton}}",
      "Efeknya kecil: rata-rata tambahan 0,30 kg massa bebas lemak dan 2,49 kg kekuatan 1RM.{{morton}}",
      "Di atas total asupan protein sekitar 1,62 g/kg per hari, suplemen tidak menambah massa bebas lemak lagi.{{morton}}"
    ],
    sections: [
      { h: "Apa yang diteliti", p: [
        "Penelitian ini adalah tinjauan sistematis, meta-analisis, dan meta-regresi. Datanya berasal dari uji acak terkendali pada orang dewasa sehat, dengan latihan beban minimal 6 minggu dan pemberian suplemen protein.{{morton}}"
      ] },
      { h: "Seberapa besar efeknya", p: [
        "Suplemen protein meningkatkan kekuatan (1RM) rata-rata 2,49 kg dan massa bebas lemak rata-rata 0,30 kg. Manfaat pada massa bebas lemak lebih kecil pada usia yang lebih tua, dan lebih besar pada orang yang sudah terlatih.{{morton}}"
      ] },
      { h: "Batas sekitar 1,6 g/kg per hari", p: [
        "Analisis titik patah menunjukkan bahwa dengan suplementasi, total asupan protein di atas 1,62 g/kg per hari tidak memberi tambahan massa bebas lemak.{{morton}} Sebagai gambaran hitung, 1,62 g/kg untuk orang dengan berat 60 kg setara sekitar 97 gram protein per hari dari semua sumber."
      ] },
      { h: "Yang perlu dicatat", p: [
        "Studi ini menilai suplemen protein pada orang dewasa sehat, bukan kebutuhan protein harian secara umum. Jika kamu memiliki penyakit ginjal atau kondisi medis lain, konsultasikan ke dokter atau ahli gizi sebelum mengubah asupan protein."
      ] }
    ],
    refs: ["morton"]
  },
  {
    slug: "olahraga-dan-kesehatan-mental",
    crumb: "Olahraga dan kesehatan mental",
    title: "Olahraga dan Kesehatan Mental: Apa Kata Bukti? | Wellness Gym",
    desc: "Ringkasan overview 97 tinjauan sistematis tentang aktivitas fisik, depresi, kecemasan, dan distres pada orang dewasa, beserta keterbatasan buktinya.",
    h1: "Olahraga dan kesehatan mental: apa kata bukti?",
    intro: "Aktivitas fisik dikaitkan dengan gejala depresi, kecemasan, dan distres yang lebih ringan. Berikut ringkasan overview besar tentang topik ini, lengkap dengan batasannya. Buktinya berlaku untuk orang dewasa secara umum.",
    points: [
      "Overview dari 97 tinjauan sistematis (1.039 uji, 128.119 peserta) menemukan efek sedang pada depresi, kecemasan, dan distres dibanding perawatan biasa.{{singh}}",
      "Aktivitas dengan intensitas lebih tinggi dikaitkan dengan perbaikan gejala yang lebih besar.{{singh}}",
      "Sebagian besar tinjauan (77 dari 97) bernilai sangat rendah pada skor kualitas metodologi AMSTAR, jadi kesimpulannya perlu dibaca dengan hati-hati.{{singh}}"
    ],
    sections: [
      { h: "Apa yang diteliti", p: [
        "Ini adalah umbrella review, yaitu tinjauan atas tinjauan sistematis dengan meta-analisis uji acak terkendali. Penelusuran dilakukan di 12 basis data sampai 1 Januari 2022. Pesertanya orang dewasa: yang sehat, yang memiliki gangguan kesehatan mental, dan yang memiliki penyakit kronis.{{singh}}"
      ] },
      { h: "Seberapa besar efeknya", p: [
        "Dibanding perawatan biasa, aktivitas fisik memberi efek sedang. Ukuran efek median adalah −0,43 untuk depresi dan −0,42 untuk kecemasan, sedangkan untuk distres psikologis −0,60. Tanda minus berarti gejala menurun. Manfaat terbesar terlihat pada penderita depresi, HIV, dan penyakit ginjal, pada ibu hamil dan pascamelahirkan, serta pada orang yang sehat.{{singh}}"
      ] },
      { h: "Intensitas dan durasi", p: [
        "Aktivitas berintensitas lebih tinggi dikaitkan dengan perbaikan gejala yang lebih besar. Efektivitas intervensi juga cenderung menurun pada program yang durasinya lebih panjang.{{singh}}"
      ] },
      { h: "Patokan aktivitas mingguan", p: [
        "Sebagai patokan umum, WHO menyarankan orang dewasa melakukan 150–300 menit aktivitas aerobik intensitas sedang, atau 75–150 menit intensitas berat, atau kombinasi yang setara, setiap minggu.{{who}}"
      ] },
      { h: "Batasan", p: [
        "Para penulis menyimpulkan aktivitas fisik sangat bermanfaat untuk gejala depresi, kecemasan, dan distres, dan layak menjadi bagian utama penanganannya.{{singh}} Namun kualitas sebagian besar tinjauan yang dirangkum rendah. Aktivitas fisik juga bukan pengganti perawatan profesional. Jika gejala mengganggu aktivitas harianmu, hubungi tenaga kesehatan."
      ] }
    ],
    refs: ["singh", "who"]
  }
];

// Gallery. photo = key in data.mjs `photos`; photo: null renders a clear placeholder.
// The page stays noindex and out of navigation/sitemap until every entry has a real photo.
export const events = [
  { title: "Foto bersama peserta kelas senam", photo: "senam" },
  { title: "Kelas aerobic di studio", photo: "aerobic" },
  { title: "Instruktur mendampingi member berlatih", photo: "instructor2" },
  { title: "Kegiatan komunitas (menyusul)", photo: null },
  { title: "Acara dan kelas spesial (menyusul)", photo: null },
  { title: "Momen member (menyusul)", photo: null }
];
