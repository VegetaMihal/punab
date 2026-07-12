export type JulyAwardClubCategory = {
  key: string;
  name: string;
  blurb: string;
  formHref: string;
};

export const JULY_AWARD_CLUB_CATEGORIES: JulyAwardClubCategory[] = [
  {
    key: "debate",
    name: "Best Debate Club",
    blurb: "Debate programmes, tournaments, and sustained training that sharpen argumentation and campus discourse.",
    formHref: "/july-award-2026/clubs/debate/nominate",
  },
  {
    key: "cultural",
    name: "Best Cultural Club",
    blurb: "Performances and cultural programmes that unite campuses and preserve creative tradition.",
    formHref: "/july-award-2026/clubs/cultural/nominate",
  },
  {
    key: "cs-programming",
    name: "Best Computer Science & Programming Club",
    blurb: "Technical depth—workshops, contests, and peer learning in CS and programming.",
    formHref: "/july-award-2026/clubs/cs-programming/nominate",
  },
  {
    key: "tech-innovation",
    name: "Best Tech & Innovation Club",
    blurb: "Hardware, software, and innovation projects that move ideas into tangible outcomes.",
    formHref: "/july-award-2026/clubs/tech-innovation/nominate",
  },
  {
    key: "business",
    name: "Best Business & Entrepreneurship Club",
    blurb: "Enterprise skills, startups, and career-facing initiatives for members.",
    formHref: "/july-award-2026/clubs/business/nominate",
  },
  {
    key: "career-skills",
    name: "Best Career & Skill Development Club",
    blurb: "Employability, mentorship, and skills training beyond the syllabus.",
    formHref: "/july-award-2026/clubs/career-skills/nominate",
  },
  {
    key: "social-welfare",
    name: "Best Social Welfare & Blood Donation Club",
    blurb: "Social welfare outreach and blood donation drives that serve communities on and beyond campus.",
    formHref: "/july-award-2026/clubs/social-welfare/nominate",
  },
  {
    key: "pharmacy-health",
    name: "Best Pharmacy & Health Club",
    blurb: "Pharmacy education, health literacy, and campus health programmes led by your chapter.",
    formHref: "/july-award-2026/clubs/pharmacy-health/nominate",
  },
  {
    key: "sports",
    name: "Best Sports Club",
    blurb: "Athletics, fitness, and competitive representation with consistent participation.",
    formHref: "/july-award-2026/clubs/sports/nominate",
  },
  {
    key: "media-literature",
    name: "Best Media, Literature & Creative Club",
    blurb: "Journalism, storytelling, literature, and creative work that documents and inspires.",
    formHref: "/july-award-2026/clubs/media-literature/nominate",
  },
];

export type JulyAwardCategoryKey = (typeof JULY_AWARD_CLUB_CATEGORIES)[number]["key"];

export function getJulyAwardCategoryByKey(key: string): JulyAwardClubCategory | undefined {
  return JULY_AWARD_CLUB_CATEGORIES.find((c) => c.key === key);
}

export function isValidJulyAwardCategoryKey(key: string): key is JulyAwardCategoryKey {
  return JULY_AWARD_CLUB_CATEGORIES.some((c) => c.key === key);
}
