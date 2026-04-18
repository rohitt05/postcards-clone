export type Collection = "all" | "spring" | "summer" | "autumn" | "winter";

export interface Postcard {
  id: string;
  title: string;
  artist: string;
  collection: Collection;
  bg: string;
  textColor: string;
  description: string;
  year: number;
}

export const postcards: Postcard[] = [
  {
    id: "sp-01",
    title: "Bloom",
    artist: "Mono Studio",
    collection: "spring",
    bg: "#D4E8C2",
    textColor: "#2D4A1E",
    description: "Soft greens and cherry blossoms of early spring.",
    year: 2024,
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
  },
  {
    id: "su-01",
    title: "Azure",
    artist: "Mono Studio",
    collection: "summer",
    bg: "#B3D9F2",
    textColor: "#0A2E4A",
    description: "The deep blue of a perfect summer sky.",
    year: 2024,
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
  },
  {
    id: "au-01",
    title: "Ember",
    artist: "Mono Studio",
    collection: "autumn",
    bg: "#E8A87C",
    textColor: "#3D1500",
    description: "Amber leaves and the smell of wood smoke.",
    year: 2024,
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
  },
  {
    id: "wi-01",
    title: "Frost",
    artist: "Mono Studio",
    collection: "winter",
    bg: "#D6E4F0",
    textColor: "#1A2E3D",
    description: "A still morning after the first snowfall.",
    year: 2024,
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
  },
];
