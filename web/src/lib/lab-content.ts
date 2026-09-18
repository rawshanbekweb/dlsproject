/** Curated lessons: runtime uses local rules, never a cloud model. */
export type TeachingStep = {
  prompt: string;
  goal: string;
  hint: string;
  example: string;
  rule: "birds-correction" | "birds-example" | "ostrich" | "whale-correction" | "whale-reason" | "dolphin" | "plants-correction" | "plants-reason" | "cactus";
  learned: string;
};

export type TeachingLesson = {
  id: string;
  title: string;
  topic: string;
  icon: string;
  description: string;
  steps: TeachingStep[];
};

export const teachingLessons: TeachingLesson[] = [
  {
    id: "birds", title: "Hamma qushlar uchadimi?", topic: "Animals", icon: "🪶",
    description: "Nomiga qoida va istisno o‘rtasidagi farqni tushuntir.",
    steps: [
      { prompt: "I have wings in my picture book. So ALL birds can fly. Right?", goal: "Nomining fikrini inglizcha tuzat.", hint: "Not all… yoki Some birds cannot… bilan boshla.", example: "Not all birds can fly.", rule: "birds-correction", learned: "Not all birds can fly." },
      { prompt: "Oh! Can you name a bird that cannot fly? Teach me with an example.", goal: "Ucha olmaydigan qushga misol keltir va buni ayt.", hint: "Penguin yoki ostrich haqida gap tuz: A … cannot fly.", example: "A penguin is a bird, but it cannot fly.", rule: "birds-example", learned: "Penguins and ostriches are flightless birds." },
      { prompt: "Let me try a new example: an ostrich is a bird. Does that mean it can fly?", goal: "Yangi vaziyatda Nomiga to‘g‘ri xulosa chiqarishga yordam ber.", hint: "Ostrich so‘zini ishlatib, uning ucha olmasligini tushuntir.", example: "No, an ostrich cannot fly, but it can run.", rule: "ostrich", learned: "An ostrich cannot fly, even though it is a bird." },
    ],
  },
  {
    id: "ocean", title: "Kit ham baliqmi?", topic: "Ocean life", icon: "🐋",
    description: "Bir joyda yashash bir xil turga mansublikni anglatmasligini o‘rgat.",
    steps: [
      { prompt: "Whales live in water. Fish live in water. A whale must be a fish!", goal: "Kitning baliq emasligini yoki sutemizuvchi ekanini ayt.", hint: "A whale is not… yoki Whales are mammals…", example: "A whale is not a fish. It is a mammal.", rule: "whale-correction", learned: "Whales are mammals, not fish." },
      { prompt: "A mammal? What does a whale do that helps me understand?", goal: "Kitning havo bilan nafas olishi yoki bolasini sut bilan boqishini tushuntir.", hint: "Whales breathe… yoki Whales feed their babies…", example: "Whales breathe air and feed their babies milk.", rule: "whale-reason", learned: "Whales breathe air and feed their young milk." },
      { prompt: "Dolphins breathe air and feed their babies milk too. Are dolphins mammals?", goal: "O‘rgatgan belgilarni delfinga ham qo‘lla.", hint: "Dolphins are… because…", example: "Dolphins are mammals because they breathe air and feed their babies milk.", rule: "dolphin", learned: "Dolphins are mammals too." },
    ],
  },
  {
    id: "plants", title: "Daraxt tirikmi?", topic: "Nature", icon: "🌱",
    description: "Nomiga tiriklik faqat yurish bilan o‘lchanmasligini ko‘rsat.",
    steps: [
      { prompt: "A tree cannot walk. I think trees are not living things!", goal: "Daraxtlar yoki o‘simliklar tirik ekanini tushuntir.", hint: "Trees are alive… yoki Plants are living things…", example: "Trees are alive even though they cannot walk.", rule: "plants-correction", learned: "Plants are living things, even though they do not walk." },
      { prompt: "How can I tell that a plant is alive? What does it do or need?", goal: "O‘simlikning o‘sishi yoki suvga ehtiyoji haqida gapir.", hint: "Plants grow… yoki Plants need water…", example: "Plants grow and need water to live.", rule: "plants-reason", learned: "Plants grow and need water." },
      { prompt: "A cactus grows very slowly and needs water. Is it a living thing too?", goal: "Kaktus haqida xulosa chiqar va bitta sabab ayt.", hint: "A cactus is alive because…", example: "A cactus is alive because it grows and needs water.", rule: "cactus", learned: "A cactus is alive: it grows and needs water." },
    ],
  },
];

export type ObjectId = "red-chair" | "blue-chair" | "green-plant" | "red-book";
export type Anchor = "table" | "window" | "shelf";
export type Relation = "left" | "right" | "on" | "under" | "near";
export type Placement = { object: ObjectId; relation: Relation; anchor: Anchor };
export const roomObjects: { id: ObjectId; color: string; noun: string; label: string }[] = [
  { id: "red-chair", color: "red", noun: "chair", label: "red chair" },
  { id: "blue-chair", color: "blue", noun: "chair", label: "blue chair" },
  { id: "green-plant", color: "green", noun: "plant", label: "green plant" },
  { id: "red-book", color: "red", noun: "book", label: "red book" },
];
export const relationLabels: Record<Relation, string> = {
  left: "to the left of", right: "to the right of", on: "on", under: "under", near: "next to",
};
export const labMissions: { id: string; title: string; goal: string; target: Placement; example: string }[] = [
  { id: "chair", title: "O‘qish burchagi", goal: "Qizil stulni stolning chap tomoniga qo‘y.", target: { object: "red-chair", relation: "left", anchor: "table" }, example: "Put the red chair to the left of the table." },
  { id: "plant", title: "Yashil laboratoriya", goal: "Yashil o‘simlikni tokcha ustiga qo‘y.", target: { object: "green-plant", relation: "on", anchor: "shelf" }, example: "Put the green plant on the shelf." },
  { id: "book", title: "Kitobning yangi joyi", goal: "Qizil kitobni stol ustiga qo‘y.", target: { object: "red-book", relation: "on", anchor: "table" }, example: "Put the red book on the table." },
];

export const LAB_TITLES = { teach: "AI’ga sen o‘rgat", room: "Tushunmovchilik laboratoriyasi" } as const;
