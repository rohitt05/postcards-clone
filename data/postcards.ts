export type Collection =
  | "all"
  | "love"
  | "best-friends"
  | "christmas"
  | "easter"
  | "birthday"
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
  image?: string;
}

export const postcards: Postcard[] = [
  // ── LOVE ──────────────────────────────────────────────────────────────────
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
  {
    id: "lv-04",
    title: "My Person",
    artist: "Mono Studio",
    collection: "love",
    bg: "#FADADD",
    textColor: "#5C0020",
    description: "You are home to me.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_wedding_re_lgem.svg",
  },

  // ── BEST FRIENDS ──────────────────────────────────────────────────────────
  {
    id: "bf-01",
    title: "Always There",
    artist: "Mono Studio",
    collection: "best-friends",
    bg: "#FFF9C4",
    textColor: "#4A3500",
    description: "Through everything, side by side.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_best_friends_re_ce13.svg",
  },
  {
    id: "bf-02",
    title: "Ride or Die",
    artist: "Mono Studio",
    collection: "best-friends",
    bg: "#C8E6C9",
    textColor: "#1B5E20",
    description: "The kind of friendship that never fades.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_friends_re_uu9t.svg",
  },
  {
    id: "bf-03",
    title: "Good Times",
    artist: "Mono Studio",
    collection: "best-friends",
    bg: "#E1BEE7",
    textColor: "#4A148C",
    description: "Here's to all the laughs we've shared.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_having_fun_re_vj4h.svg",
  },
  {
    id: "bf-04",
    title: "Just Us",
    artist: "Mono Studio",
    collection: "best-friends",
    bg: "#B3E5FC",
    textColor: "#01579B",
    description: "No explanation needed. You just get it.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_hang_out_re_udl5.svg",
  },

  // ── CHRISTMAS ───────────────────────────────────────────────────────────────
  {
    id: "xm-01",
    title: "Season's Joy",
    artist: "Mono Studio",
    collection: "christmas",
    bg: "#E8F5E9",
    textColor: "#1B5E20",
    description: "Warmth, wonder, and a little bit of magic.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_christmas_re_q9wo.svg",
  },
  {
    id: "xm-02",
    title: "Cosy Night",
    artist: "Mono Studio",
    collection: "christmas",
    bg: "#C62828",
    textColor: "#FFEBEE",
    description: "Firelight, hot cocoa, and you.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_winter_re_0kxc.svg",
  },
  {
    id: "xm-03",
    title: "Gift of You",
    artist: "Mono Studio",
    collection: "christmas",
    bg: "#FFFDE7",
    textColor: "#4A3500",
    description: "The best present is having you in my life.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_gift_re_qr17.svg",
  },
  {
    id: "xm-04",
    title: "Snowfall",
    artist: "Mono Studio",
    collection: "christmas",
    bg: "#E3F2FD",
    textColor: "#0D47A1",
    description: "Every flake a tiny miracle.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_snowman_re_qpc9.svg",
  },

  // ── EASTER ──────────────────────────────────────────────────────────────────
  {
    id: "ea-01",
    title: "Egg Hunt",
    artist: "Mono Studio",
    collection: "easter",
    bg: "#F1F8E9",
    textColor: "#33691E",
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
    image: "https://undraw.co/api/illustrations/undraw_blooming_jtv6.svg",
  },
  {
    id: "ea-03",
    title: "Hello Spring",
    artist: "Mono Studio",
    collection: "easter",
    bg: "#FCE4EC",
    textColor: "#880E4F",
    description: "Pastel skies and hopeful hearts.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_spring_illustration_kvum.svg",
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
    bg: "#E8EAF6",
    textColor: "#1A237E",
    description: "Let the whole world know it's your day.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_celebration_re_kc9k.svg",
  },
  {
    id: "bd-04",
    title: "You Glow",
    artist: "Mono Studio",
    collection: "birthday",
    bg: "#FBE9E7",
    textColor: "#BF360C",
    description: "Brighter every single year.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_happy_birthday_re_c559.svg",
  },

  // ── LONG DISTANCE ──────────────────────────────────────────────────────────
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
  {
    id: "ld-04",
    title: "Thinking of You",
    artist: "Mono Studio",
    collection: "long-distance",
    bg: "#E8F5E9",
    textColor: "#1B5E20",
    description: "Every quiet moment, my mind goes to you.",
    year: 2025,
    image: "https://undraw.co/api/illustrations/undraw_feeling_happy_re_e5c6.svg",
  },
];
