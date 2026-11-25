import type { BookSvgVariant, BookVocabularyItem, BookVocabularySet } from "./types.ts";

const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";

function twemojiUrl(code: string): string {
  return `${TWEMOJI_BASE}/${code}.svg`;
}

function item(
  id: string,
  en: string,
  pt: string,
  svgVariant: BookSvgVariant,
  emoji: string,
  twemojiCode?: string,
  imageUrl?: string,
): BookVocabularyItem {
  return {
    id,
    en,
    pt,
    ...(twemojiCode ? { clipartUrl: twemojiUrl(twemojiCode) } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    svgVariant,
    emoji,
  };
}

export const INTRO_VOCABULARY_SETS: BookVocabularySet[] = [
  {
    id: "titles-mr-ms-mrs",
    title: "Titles (Mr. / Ms. / Mrs.)",
    subtitle: "Cumprimentos e formas de tratamento",
    items: [
      item("intro-title-mr", "Mr.", "Sr. (homens)", "greeting", "👨", "1f468"),
      item("intro-title-ms", "Ms.", "Sra. / Srta. (mulheres)", "greeting", "👩", "1f469"),
      item("intro-title-mrs", "Mrs.", "Sra. (mulher casada)", "greeting", "💍", "1f48d"),
      item("intro-title-miss", "Miss", "Srta. (mulher solteira)", "greeting", "🙋", "1f64b"),
      item("intro-title-first-name", "first name", "primeiro nome", "greeting", "🪪", "1faaa"),
      item("intro-title-last-name", "last name", "sobrenome", "greeting", "🏷️", "1f3f7"),
      item("intro-title-hello", "Hello", "Olá", "greeting", "👋", "1f44b"),
      item("intro-title-good-morning", "Good morning", "Bom dia", "greeting", "🌅", "1f305"),
    ],
  },
  {
    id: "school-items",
    title: "School Items",
    subtitle: "Objetos da sala de aula",
    items: [
      item("intro-school-book", "book", "livro", "school", "📘", "1f4d8"),
      item("intro-school-notebook", "notebook", "caderno", "school", "📓", "1f4d3"),
      item("intro-school-pen", "pen", "caneta", "school", "🖊️", "1f58a"),
      item("intro-school-pencil", "pencil", "lápis", "school", "✏️", "270f"),
      item("intro-school-backpack", "backpack", "mochila", "school", "🎒", "1f392"),
      item("intro-school-desk", "desk", "escrivaninha / carteira", "school", "🪑", "1fa91"),
      item("intro-school-eraser", "eraser", "borracha", "school", "🧽", "1f9fd"),
      item("intro-school-ruler", "ruler", "régua", "school", "📏", "1f4cf"),
    ],
  },
  {
    id: "countries-nationalities",
    title: "Countries & Nationalities",
    subtitle: "Países e nacionalidades",
    items: [
      item("intro-country-brazil", "Brazil / Brazilian", "Brasil / brasileiro(a)", "globe", "🇧🇷", "1f1e7-1f1f7"),
      item("intro-country-usa", "United States / American", "Estados Unidos / americano(a)", "globe", "🇺🇸", "1f1fa-1f1f8"),
      item("intro-country-canada", "Canada / Canadian", "Canadá / canadense", "globe", "🇨🇦", "1f1e8-1f1e6"),
      item("intro-country-mexico", "Mexico / Mexican", "México / mexicano(a)", "globe", "🇲🇽", "1f1f2-1f1fd"),
      item("intro-country-japan", "Japan / Japanese", "Japão / japonês(a)", "globe", "🇯🇵", "1f1ef-1f1f5"),
      item("intro-country-italy", "Italy / Italian", "Itália / italiano(a)", "globe", "🇮🇹", "1f1ee-1f1f9"),
      item("intro-country-france", "France / French", "França / francês(a)", "globe", "🇫🇷", "1f1eb-1f1f7"),
      item("intro-country-spain", "Spain / Spanish", "Espanha / espanhol(a)", "globe", "🇪🇸", "1f1ea-1f1f8"),
    ],
  },
  {
    id: "clothes",
    title: "Clothes",
    subtitle: "Roupas e acessórios",
    items: [
      item("intro-clothes-shirt", "shirt", "camisa", "clothing", "👔", "1f454"),
      item("intro-clothes-tshirt", "T-shirt", "camiseta", "clothing", "👕", "1f455"),
      item("intro-clothes-jeans", "jeans", "calça jeans", "clothing", "👖", "1f456", "/study-area/flashcards/clothes/jeans.jpg"),
      item("intro-clothes-dress", "dress", "vestido", "clothing", "👗", "1f457"),
      item("intro-clothes-jacket", "jacket", "jaqueta", "clothing", "🧥", "1f9e5"),
      item("intro-clothes-shoes", "shoes", "sapatos", "clothing", "👞", "1f45e"),
      item("intro-clothes-sneakers", "sneakers", "tênis", "clothing", "👟", "1f45f", "/study-area/flashcards/clothes/sneakers.jpg"),
      item("intro-clothes-hat", "hat", "chapéu", "clothing", "🧢", "1f9e2"),
    ],
  },
  {
    id: "transport-family-routines",
    title: "Transport, Family & Routines",
    subtitle: "Transporte, família e verbos da rotina",
    items: [
      item("intro-tfr-bus", "bus", "ônibus", "transport", "🚌", "1f68c"),
      item("intro-tfr-subway", "subway", "metrô", "transport", "🚇", "1f687"),
      item("intro-tfr-bicycle", "bicycle", "bicicleta", "transport", "🚲", "1f6b2"),
      item("intro-tfr-parents", "parents", "pais", "transport", "👪", "1f46a"),
      item("intro-tfr-brother", "brother", "irmão", "transport", "👦", "1f466"),
      item("intro-tfr-sister", "sister", "irmã", "transport", "👧", "1f467"),
      item("intro-tfr-wake-up", "wake up", "acordar", "transport", "⏰", "23f0"),
      item("intro-tfr-go-to-work", "go to work", "ir trabalhar", "transport", "💼", "1f4bc"),
    ],
  },
  {
    id: "house-furniture",
    title: "House & Furniture",
    subtitle: "Cômodos e móveis da casa",
    items: [
      item("intro-house-sofa", "sofa", "sofá", "home", "🛋️", "1f6cb", "/study-area/flashcards/furniture/sofa.jpg"),
      item("intro-house-bed", "bed", "cama", "home", "🛏️", "1f6cf", "/study-area/flashcards/furniture/bed.jpg"),
      item("intro-house-table", "table", "mesa", "home", "🪑", "1fa91"),
      item("intro-house-chair", "chair", "cadeira", "home", "🪑", "1fa91"),
      item("intro-house-lamp", "lamp", "luminária", "home", "💡", "1f4a1"),
      item("intro-house-kitchen", "kitchen", "cozinha", "home", "🍳", "1f373"),
      item("intro-house-bedroom", "bedroom", "quarto", "home", "🛌", "1f6cc"),
      item("intro-house-bathroom", "bathroom", "banheiro", "home", "🚿", "1f6bf"),
    ],
  },
  {
    id: "jobs",
    title: "Professions",
    subtitle: "Profissões do dia a dia",
    items: [
      item("intro-job-teacher", "teacher", "professor(a)", "briefcase", "👩‍🏫", "1f469-200d-1f3eb", "/study-area/flashcards/jobs/teacher.jpg"),
      item("intro-job-doctor", "doctor", "médico(a)", "briefcase", "👨‍⚕️", "1f468-200d-2695-fe0f", "/study-area/flashcards/jobs/doctor.jpg"),
      item("intro-job-nurse", "nurse", "enfermeiro(a)", "briefcase", "🩺", "1fa7a", "/study-area/flashcards/jobs/nurse.jpg"),
      item("intro-job-chef", "chef", "cozinheiro(a)", "briefcase", "👨‍🍳", "1f468-200d-1f373", "/study-area/flashcards/jobs/chef.jpg"),
      item("intro-job-engineer", "engineer", "engenheiro(a)", "briefcase", "👷", "1f477"),
      item("intro-job-lawyer", "lawyer", "advogado(a)", "briefcase", "⚖️", "2696", "/study-area/flashcards/jobs/lawyer.jpg"),
      item("intro-job-pilot", "pilot", "piloto", "briefcase", "✈️", "2708", "/study-area/flashcards/jobs/pilot.jpg"),
      item("intro-job-dentist", "dentist", "dentista", "briefcase", "🦷", "1f9b7"),
    ],
  },
  {
    id: "food",
    title: "Food",
    subtitle: "Alimentos e bebidas",
    items: [
      item("intro-food-bread", "bread", "pão", "food", "🍞", "1f35e"),
      item("intro-food-rice", "rice", "arroz", "food", "🍚", "1f35a"),
      item("intro-food-chicken", "chicken", "frango", "food", "🍗", "1f357"),
      item("intro-food-salad", "salad", "salada", "food", "🥗", "1f957"),
      item("intro-food-apple", "apple", "maçã", "food", "🍎", "1f34e"),
      item("intro-food-cheese", "cheese", "queijo", "food", "🧀", "1f9c0"),
      item("intro-food-coffee", "coffee", "café", "food", "☕", "2615"),
      item("intro-food-water", "water", "água", "food", "💧", "1f4a7"),
    ],
  },
  {
    id: "sports",
    title: "Sports",
    subtitle: "Esportes e atividades físicas",
    items: [
      item("intro-sport-soccer", "soccer", "futebol", "sport", "⚽", "26bd"),
      item("intro-sport-basketball", "basketball", "basquete", "sport", "🏀", "1f3c0"),
      item("intro-sport-tennis", "tennis", "tênis", "sport", "🎾", "1f3be"),
      item("intro-sport-swimming", "swimming", "natação", "sport", "🏊", "1f3ca"),
      item("intro-sport-volleyball", "volleyball", "vôlei", "sport", "🏐", "1f3d0"),
      item("intro-sport-running", "running", "corrida", "sport", "🏃", "1f3c3"),
      item("intro-sport-cycling", "cycling", "ciclismo", "sport", "🚴", "1f6b4"),
      item("intro-sport-baseball", "baseball", "beisebol", "sport", "⚾", "26be"),
    ],
  },
  {
    id: "holidays",
    title: "Holidays",
    subtitle: "Datas comemorativas e feriados",
    items: [
      item("intro-holiday-birthday", "birthday", "aniversário", "calendar", "🎂", "1f382"),
      item("intro-holiday-new-year", "New Year's Day", "Ano Novo", "calendar", "🎆", "1f386"),
      item("intro-holiday-christmas", "Christmas", "Natal", "calendar", "🎄", "1f384"),
      item("intro-holiday-thanksgiving", "Thanksgiving", "Dia de Ação de Graças", "calendar", "🦃", "1f983"),
      item("intro-holiday-halloween", "Halloween", "Dia das Bruxas", "calendar", "🎃", "1f383"),
      item("intro-holiday-valentines", "Valentine's Day", "Dia dos Namorados", "calendar", "💝", "1f49d"),
      item("intro-holiday-independence", "Independence Day", "Dia da Independência", "calendar", "🎇", "1f387"),
      item("intro-holiday-easter", "Easter", "Páscoa", "calendar", "🐣", "1f423"),
    ],
  },
  {
    id: "body-health-remedies",
    title: "Body, Health & Remedies",
    subtitle: "Partes do corpo, sintomas e remédios",
    items: [
      item("intro-bhr-headache", "headache", "dor de cabeça", "health", "🤕", "1f915", "/study-area/flashcards/health-problems/headache.jpg"),
      item("intro-bhr-fever", "fever", "febre", "health", "🤒", "1f912"),
      item("intro-bhr-cough", "cough", "tosse", "health", "🤧", "1f927"),
      item("intro-bhr-stomachache", "stomachache", "dor de estômago", "health", "😣", "1f623", "/study-area/flashcards/health-problems/stomachache.jpg"),
      item("intro-bhr-aspirin", "aspirin", "aspirina", "health", "💊", "1f48a"),
      item("intro-bhr-cough-syrup", "cough syrup", "xarope para tosse", "health", "🧴", "1f9f4"),
      item("intro-bhr-bandage", "bandage", "curativo", "health", "🩹", "1fa79"),
      item("intro-bhr-eye-drops", "eye drops", "colírio", "health", "💧", "1f4a7"),
    ],
  },
  {
    id: "places-in-town",
    title: "Places in Town",
    subtitle: "Lugares da cidade",
    items: [
      item("intro-place-bank", "bank", "banco", "place", "🏦", "1f3e6"),
      item("intro-place-hospital", "hospital", "hospital", "place", "🏥", "1f3e5"),
      item("intro-place-library", "library", "biblioteca", "place", "📚", "1f4da"),
      item("intro-place-park", "park", "parque", "place", "🌳", "1f333"),
      item("intro-place-restaurant", "restaurant", "restaurante", "place", "🍽️", "1f37d"),
      item("intro-place-supermarket", "supermarket", "supermercado", "place", "🛒", "1f6d2"),
      item("intro-place-pharmacy", "pharmacy", "farmácia", "place", "💊", "1f48a"),
      item("intro-place-bakery", "bakery", "padaria", "place", "🥐", "1f950"),
    ],
  },
  {
    id: "weekend-activities",
    title: "Weekend Activities",
    subtitle: "Atividades de fim de semana",
    items: [
      item("intro-wknd-movies", "watch a movie", "assistir a um filme", "weekend", "🎬", "1f3ac"),
      item("intro-wknd-music", "listen to music", "ouvir música", "weekend", "🎧", "1f3a7"),
      item("intro-wknd-friends", "meet friends", "encontrar amigos", "weekend", "🤝", "1f91d"),
      item("intro-wknd-shopping", "go shopping", "fazer compras", "weekend", "🛍️", "1f6cd"),
      item("intro-wknd-cook", "cook dinner", "fazer o jantar", "weekend", "🍳", "1f373"),
      item("intro-wknd-read", "read a book", "ler um livro", "weekend", "📖", "1f4d6"),
      item("intro-wknd-beach", "go to the beach", "ir à praia", "weekend", "🏖️", "1f3d6"),
      item("intro-wknd-sleep-in", "sleep in", "dormir até mais tarde", "weekend", "😴", "1f634"),
    ],
  },
  {
    id: "school-subjects",
    title: "School Subjects",
    subtitle: "Matérias escolares",
    items: [
      item("intro-subj-math", "math", "matemática", "subject", "➗", "2797"),
      item("intro-subj-science", "science", "ciências", "subject", "🔬", "1f52c"),
      item("intro-subj-history", "history", "história", "subject", "🏛️", "1f3db"),
      item("intro-subj-geography", "geography", "geografia", "subject", "🗺️", "1f5fa"),
      item("intro-subj-english", "English", "inglês", "subject", "🗣️", "1f5e3"),
      item("intro-subj-art", "art", "artes", "subject", "🎨", "1f3a8"),
      item("intro-subj-music", "music", "música", "subject", "🎵", "1f3b5"),
      item("intro-subj-pe", "physical education", "educação física", "subject", "🏅", "1f3c5"),
    ],
  },
];

export function getIntroVocabularySet(setId?: string): BookVocabularySet | undefined {
  return INTRO_VOCABULARY_SETS.find((set) => set.id === setId);
}
