import type { VocabularyEntry } from "../model/content";
import type {
  VocabularyCategoryId,
  VocabularyEntryId,
} from "../../shared/types/domain";

export const MVP_VOCABULARY_ENTRIES: VocabularyEntry[] = [
  vocabularyEntry("body_head", "body", "Head", "Cabeça"),
  vocabularyEntry("body_hand", "body", "Hand", "Mão"),
  vocabularyEntry("body_foot", "body", "Foot", "Pé"),
  vocabularyEntry("body_eye", "body", "Eye", "Olho"),
  vocabularyEntry("body_ear", "body", "Ear", "Orelha"),
  vocabularyEntry("body_arm", "body", "Arm", "Braço"),
  vocabularyEntry("body_leg", "body", "Leg", "Perna"),
  vocabularyEntry("body_nose", "body", "Nose", "Nariz"),
  vocabularyEntry("body_mouth", "body", "Mouth", "Boca"),
  vocabularyEntry("body_finger", "body", "Finger", "Dedo"),

  vocabularyEntry("clothes_shirt", "clothes", "Shirt", "Camisa"),
  vocabularyEntry("clothes_pants", "clothes", "Pants", "Calça"),
  vocabularyEntry("clothes_shoes", "clothes", "Shoes", "Sapatos"),
  vocabularyEntry("clothes_hat", "clothes", "Hat", "Chapéu"),
  vocabularyEntry("clothes_jacket", "clothes", "Jacket", "Jaqueta"),
  vocabularyEntry("clothes_dress", "clothes", "Dress", "Vestido"),
  vocabularyEntry("clothes_socks", "clothes", "Socks", "Meias"),
  vocabularyEntry("clothes_belt", "clothes", "Belt", "Cinto"),
  vocabularyEntry("clothes_skirt", "clothes", "Skirt", "Saia"),
  vocabularyEntry("clothes_scarf", "clothes", "Scarf", "Cachecol"),

  vocabularyEntry("furniture_chair", "furniture", "Chair", "Cadeira"),
  vocabularyEntry("furniture_table", "furniture", "Table", "Mesa"),
  vocabularyEntry("furniture_bed", "furniture", "Bed", "Cama"),
  vocabularyEntry("furniture_sofa", "furniture", "Sofa", "Sofá"),
  vocabularyEntry("furniture_shelf", "furniture", "Shelf", "Prateleira"),
  vocabularyEntry("furniture_lamp", "furniture", "Lamp", "Luminária"),
  vocabularyEntry("furniture_mirror", "furniture", "Mirror", "Espelho"),
  vocabularyEntry("furniture_closet", "furniture", "Closet", "Armário"),
  vocabularyEntry("furniture_desk", "furniture", "Desk", "Escrivaninha"),
  vocabularyEntry("furniture_drawer", "furniture", "Drawer", "Gaveta"),

  vocabularyEntry("animals_dog", "animals", "Dog", "Cachorro"),
  vocabularyEntry("animals_cat", "animals", "Cat", "Gato"),
  vocabularyEntry("animals_bird", "animals", "Bird", "Pássaro"),
  vocabularyEntry("animals_fish", "animals", "Fish", "Peixe"),
  vocabularyEntry("animals_horse", "animals", "Horse", "Cavalo"),
  vocabularyEntry("animals_cow", "animals", "Cow", "Vaca"),
  vocabularyEntry("animals_pig", "animals", "Pig", "Porco"),
  vocabularyEntry("animals_sheep", "animals", "Sheep", "Ovelha"),
  vocabularyEntry("animals_lion", "animals", "Lion", "Leão"),
  vocabularyEntry("animals_elephant", "animals", "Elephant", "Elefante"),

  vocabularyEntry("jobs_teacher", "jobs", "Teacher", "Professor"),
  vocabularyEntry("jobs_doctor", "jobs", "Doctor", "Médico"),
  vocabularyEntry("jobs_engineer", "jobs", "Engineer", "Engenheiro"),
  vocabularyEntry("jobs_nurse", "jobs", "Nurse", "Enfermeiro"),
  vocabularyEntry("jobs_lawyer", "jobs", "Lawyer", "Advogado"),
  vocabularyEntry("jobs_chef", "jobs", "Chef", "Cozinheiro"),
  vocabularyEntry("jobs_police_officer", "jobs", "Police Officer", "Policial"),
  vocabularyEntry("jobs_firefighter", "jobs", "Firefighter", "Bombeiro"),
  vocabularyEntry("jobs_farmer", "jobs", "Farmer", "Fazendeiro"),
  vocabularyEntry("jobs_dentist", "jobs", "Dentist", "Dentista"),

  vocabularyEntry("places_school", "places", "School", "Escola"),
  vocabularyEntry("places_hospital", "places", "Hospital", "Hospital"),
  vocabularyEntry("places_bank", "places", "Bank", "Banco"),
  vocabularyEntry("places_park", "places", "Park", "Parque"),
  vocabularyEntry("places_store", "places", "Store", "Loja"),
  vocabularyEntry("places_restaurant", "places", "Restaurant", "Restaurante"),
  vocabularyEntry("places_library", "places", "Library", "Biblioteca"),
  vocabularyEntry("places_church", "places", "Church", "Igreja"),
  vocabularyEntry("places_airport", "places", "Airport", "Aeroporto"),
  vocabularyEntry("places_pharmacy", "places", "Pharmacy", "Farmácia"),
];

export function getVocabularyEntriesByCategory(
  categoryId: VocabularyCategoryId,
): VocabularyEntry[] {
  return MVP_VOCABULARY_ENTRIES.filter(
    (entry) => entry.categoryId === categoryId,
  );
}

export function getVocabularyEntryById(
  entryId: VocabularyEntryId,
): VocabularyEntry | undefined {
  return MVP_VOCABULARY_ENTRIES.find((entry) => entry.id === entryId);
}

function vocabularyEntry(
  id: VocabularyEntryId,
  categoryId: VocabularyCategoryId,
  term: string,
  translation: string,
): VocabularyEntry {
  return {
    id,
    categoryId,
    term,
    translation,
    availabilityStatus: "available",
  };
}
