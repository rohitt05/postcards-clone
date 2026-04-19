export type Collection =
  | "all"
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "love"
  | "friendship"
  | "birthday"
  | "easter"
  | "long-distance";

export interface Postcard {
  id: string;
  title: string;
  artist: string;
  collection: Collection;
  bg: string;
  textColor: string;
  description: string;
  year: number;
  image?: string; // unDraw SVG illustration URL
}

export const postcards: Postcard[] = [
  // ── SPRING ──────────────────────────────────────────────────────────────────
  {
    id: "sp-01",
    title: "Bloom",
    artist: "Mono Studio",
    collection: "spring",
    bg: "#D4E8C2",
    textColor: "#2D4A1E",
    description: "Soft greens and cherry blossoms of early spring.",
    year: 2024,
    image: "https://undraw.co/api/illustrations/undraw_spring_illustration_kvum.svg",
  },
  {
    id: "sp-02",
    title: "Petal Rain",
    artist: "Mono Studio",
    collection: "spring",
    bg: "#F2C4CE",
    textColor: "#5C1A2B",
    description: "Pink petals falling like a gentle morning rain.",
    year: 2024,
    image: "https://undraw.co/api/illustrations/undraw_blooming_jtv6.svg",
  },
  {
    id: "sp-03",
    title: "Golden Hour",
    artist: "Mono Studio",
    collection: "spring",
    bg: "#F9E4B7",
    textColor: "#5C3A00",
    description: "Warm spring afternoons bathed in golden light.",
    year: 2024,
    image: "https://undraw.co/api/illustrations/undraw_sunny_day_-8-f3r.svg",
  },

  // ── SUMMER ──────────────────────────────────────────────────────────────────
  {
    id: "su-01",
    title: "Azure",
    artist: "Mono Studio",
    collection: "summer",
    bg: "#B3D9F2",
    textColor: "#0A2E4A",
    description: "The deep blue of a perfect summer sky.",
    year: 2024,
    image: "https://undraw.co/api/illustrations/undraw_beach_sunset_gkmo.svg",
  },
  {
    id: "su-02",
    title: "Solstice",
    artist: "Mono Studio",
    collection: "summer",
    bg: "#FFD166",
    textColor: "#3D2000",
    description: "Long evenings at the peak of summer.",
    year: 2024,
    image: "https://undraw.co/api/illustrations/undraw_sunshine_re_246h.svg",
  },

  // ── AUTUMN ──────────────────────────────────────────────────────────────────
  {
    id: "au-01",
    title: "Ember",
    artist: "Mono Studio",
    collection: "autumn",
    bg: "#E8A87C",
    textColor: "#3D1500",
    description: "Amber leaves and the smell of wood smoke.",
    year: 2024,
    image: "https://undraw.co/api/illustrations/undraw_fall_is_coming_yl-0-x.svg",
  },
  {
    id: "au-02",
    title: "Harvest",
    artist: "Mono Studio",
    collection: "autumn",
    bg: "#C0392B",
    textColor: "#FFF5F0",
    description: "Deep reds of a late October evening.",
    year: 2024,
    image: "https://undraw.co/api/illustrations/undraw_autumn_re_rvy6.svg",
  },

  // ── WINTER ──────────────────────────────────────────────────────────────────
  {
    id: "wi-01",
    title: "Frost",
    artist: "Mono Studio",
    collection: "winter",
    bg: "#D6E4F0",
    textColor: "#1A2E3D",
    description: "A still morning after the first snowfall.",
    year: 2024,
    image: "https://undraw.co/api/illustrations/undraw_snowman_re_qpc9.svg",
  },
  {
    id: "wi-02",
    title: "Solitude",
    artist: "Mono Studio",
    collection: "winter",
    bg: "#2C3E50",
    textColor: "#D6E4F0",
    description: "The quiet beauty of a frozen landscape.",
    year: 2024,
    image: "https://undraw.co/api/illustrations/undraw_cold_night_re_vj05.svg",
  },

  // ── LOVE ────────────────────────────────────────────────────────────────────
  {
    id: "lv-01",
    title: "Always You",
    artist: "Mono Studio",
    collection: "love",
    bg: "#FFE4EC",
    textColor: "#7A0030",
    description: "For the one who makes every moment feel warm.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_love_re_mwbq.svg",
  },
  {
    id: "lv-02",
    title: "Heartstrings",
    artist: "Mono Studio",
    collection: "love",
    bg: "#F7CAD0",
    textColor: "#6B001E",
    description: "Tied together across every mile.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_lovers_re_v056.svg",
  },
  {
    id: "lv-03",
    title: "Tender",
    artist: "Mono Studio",
    collection: "love",
    bg: "#E8C4D8",
    textColor: "#4A0028",
    description: "Softness in every thought of you.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_romantic_couple_re_bbd4.svg",
  },

  // ── FRIENDSHIP ──────────────────────────────────────────────────────────────
  {
    id: "fr-01",
    title: "Together",
    artist: "Mono Studio",
    collection: "friendship",
    bg: "#FFF3CD",
    textColor: "#4A3500",
    description: "Side by side, always.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_best_friends_re_ce13.svg",
  },
  {
    id: "fr-02",
    title: "Ride or Die",
    artist: "Mono Studio",
    collection: "friendship",
    bg: "#C8E6C9",
    textColor: "#1B5E20",
    description: "The kind of friendship that never fades.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_friends_re_uu9t.svg",
  },
  {
    id: "fr-03",
    title: "Good Times",
    artist: "Mono Studio",
    collection: "friendship",
    bg: "#E1BEE7",
    textColor: "#4A148C",
    description: "Here's to all the laughs we've shared.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_having_fun_re_vj4h.svg",
  },

  // ── BIRTHDAY ────────────────────────────────────────────────────────────────
  {
    id: "bd-01",
    title: "Make a Wish",
    artist: "Mono Studio",
    collection: "birthday",
    bg: "#FFF9C4",
    textColor: "#4A3500",
    description: "Blow out the candles — this one's for you.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_birthday_re_cv4k.svg",
  },
  {
    id: "bd-02",
    title: "Celebrate",
    artist: "Mono Studio",
    collection: "birthday",
    bg: "#F8BBD0",
    textColor: "#880E4F",
    description: "Another year more wonderful than the last.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_partying_re_at7f.svg",
  },
  {
    id: "bd-03",
    title: "Confetti",
    artist: "Mono Studio",
    collection: "birthday",
    bg: "#B3E5FC",
    textColor: "#01579B",
    description: "Let the whole world know it's your day.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_celebration_re_kc9k.svg",
  },

  // ── EASTER ──────────────────────────────────────────────────────────────────
  {
    id: "ea-01",
    title: "Egg Hunt",
    artist: "Mono Studio",
    collection: "easter",
    bg: "#E8F5E9",
    textColor: "#1B5E20",
    description: "Spring magic hidden in the grass.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_easter_egg_hunt_re_ap1a.svg",
  },
  {
    id: "ea-02",
    title: "New Beginnings",
    artist: "Mono Studio",
    collection: "easter",
    bg: "#FFF8E1",
    textColor: "#4A3500",
    description: "Every spring is a fresh start.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_nature_benefits_re_kn53.svg",
  },

  // ── LONG DISTANCE ───────────────────────────────────────────────────────────
  {
    id: "ld-01",
    title: "Miles Apart",
    artist: "Mono Studio",
    collection: "long-distance",
    bg: "#E3F2FD",
    textColor: "#0D47A1",
    description: "Distance is just a test of how far love can travel.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_long_distance_re_ue0e.svg",
  },
  {
    id: "ld-02",
    title: "Same Sky",
    artist: "Mono Studio",
    collection: "long-distance",
    bg: "#EDE7F6",
    textColor: "#311B92",
    description: "Wherever you are, we're under the same stars.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_stars_re_6je7.svg",
  },
  {
    id: "ld-03",
    title: "Soon",
    artist: "Mono Studio",
    collection: "long-distance",
    bg: "#FCE4EC",
    textColor: "#880E4F",
    description: "Counting down every day until I see you again.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_countdown_re_rbro.svg",
  },
];
