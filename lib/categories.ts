export const STATIC_CATEGORIES = [
  // Vehicles
  "Car Brands",
  "Motorcycle Brands",
  // Geography
  "Countries",
  "Capital Cities",
  "US States",
  // Entertainment
  "Disney Movies",
  "Marvel Superheroes",
  "Harry Potter Characters",
  // Food & Drink
  "Fruits",
  "Ice Cream Flavors",
  // Animals
  "Dog Breeds",
  "Zoo Animals",
  // Sports
  "Football Teams",
  "Olympic Sports",
]

export function getStaticSuggestions(count: number = 4) {
  const shuffled = [...STATIC_CATEGORIES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
