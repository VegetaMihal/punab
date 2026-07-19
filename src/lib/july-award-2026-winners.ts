/**
 * July Uprising Memorial Award 2026 — final honoree lists.
 * Source: Injured Crest List.pdf, Teacher Award Final List 2026.pdf, CLUB Award List.pdf
 */

export type ClubExcellencePlace = { place: 1 | 2 | 3; club: string };
export type ClubExcellenceCategory = { key: string; category: string; places: ClubExcellencePlace[] };

export const CLUB_EXCELLENCE_WINNERS: ClubExcellenceCategory[] = [
  {
    key: "cultural",
    category: "Cultural Club",
    places: [
      { place: 1, club: "North South University Shangskritik Shangathan (NSUSS)" },
      { place: 2, club: "BRAC University Cultural Club" },
      { place: 3, club: "DIU Cultural Club" },
    ],
  },
  {
    key: "photography",
    category: "Photography Club",
    places: [
      { place: 1, club: "East West University Photography Club" },
      { place: 2, club: "IUBAT Films & Photography" },
      { place: 3, club: "DIU Film & Photography Club" },
    ],
  },
  {
    key: "media-creative",
    category: "Media and Creative Club",
    places: [
      { place: 1, club: "North South University Ethics and Diversity Club (NSUEDC)" },
      { place: 2, club: "DIU Creative Park" },
      { place: 3, club: "UAP Drama Club" },
    ],
  },
  {
    key: "cs-programming",
    category: "CS and Programming Club",
    places: [
      { place: 1, club: "Daffodil International University Computer & Programming Club" },
      { place: 2, club: "Green University Computer Club (GUCC)" },
      { place: 3, club: "BUBT IT Club" },
    ],
  },
  {
    key: "tech-innovation",
    category: "Tech and Innovation Club",
    places: [
      { place: 1, club: "IUBAT Innovation and Entrepreneurship Centre (IIEC)" },
      { place: 2, club: "IEEE IIUC Student Branch" },
      { place: 3, club: "Premier University Robotics Club" },
    ],
  },
  {
    key: "career",
    category: "Career Club",
    places: [
      { place: 1, club: "Southeast Model United Nations Club" },
      { place: 2, club: "BUFT Career Development Club" },
      { place: 3, club: "Gono Bishwabidyalay Career Development Club (GBCDC)" },
    ],
  },
  {
    key: "volunteer-social-welfare",
    category: "Volunteer Service and Social Welfare Club",
    places: [
      { place: 1, club: "BUFT Rover Scout Group" },
      { place: 2, club: "UU Environment & SDG Club" },
      { place: 3, club: "USTC United Progress Foundation" },
    ],
  },
  {
    key: "sports",
    category: "Sports Club",
    places: [
      { place: 1, club: "UIU Sports Club" },
      { place: 2, club: "North South University Games and Sports Club (NSUSC)" },
      { place: 3, club: "MIU Sports Club" },
    ],
  },
];

export type NationalSpecialAward = { title: string; recipient: string };

export const NATIONAL_SPECIAL_AWARDS: NationalSpecialAward[] = [
  { title: "Anti-Hegemony Cultural Activity Award", recipient: "Inqilab Moncho" },
  { title: "July-related Archiving and Consistent Activity", recipient: "July Revolutionary Alliance (JRA)" },
  { title: "For Inspiring Gen-Z in the Field of Innovation", recipient: "Bangla Innovator" },
];

export const APPRECIATION_CREST: string[] = [
  "BUFT Textile Engineering Management & Innovation Club (BTEMIC)",
  "Rotaract Club of IUBAT",
  "Cyber Security Club, Uttara University",
  "Social Services Club",
  "BUFT Fashion Club",
  "Eastern University Social Media Club",
  "Bio Humanity Trust",
  "Gono Bishwabidyalay Health Club (GBHC)",
  "IIUC Computer Club",
  "GUCC Cybersecurity Society",
  "BBTech Science Club, USTC",
];

export type TeacherHonoree = { name: string; title: string; role: string; isVC?: boolean; isLate?: boolean };

export const TEACHERS_AWARD: TeacherHonoree[] = [
  { name: "Prof. Dr. Abdul Hannan Chowdhury", title: "Vice Chancellor, North South University", role: "Vice Chancellor", isVC: true },
  { name: "Prof. Dr. Yusuf Mahbubul Islam", title: "Vice Chancellor, Southeast University", role: "Vice Chancellor", isVC: true },
  { name: "Prof. Dr. Md. Taufiqul Islam Mithil", title: "Professor, Department of Political Science & Sociology, North South University", role: "Professor" },
  { name: "Dr. Ramit Azad", title: "Professor, Southeast University", role: "Professor" },
  { name: "Shabnin Rahman Shorna", title: "Senior Lecturer, North South University", role: "Senior Lecturer" },
  { name: "Andaleeb Navin Choudhury", title: "Lecturer, Independent University, Bangladesh", role: "Lecturer" },
  { name: "Dr. Shaikh Muhammad Allayear", title: "Proctor, Daffodil International University", role: "Proctor" },
  { name: "Mohammad Jahangir Alam", title: "Assistant Professor and Assistant Proctor, Daffodil International University", role: "Assistant Professor" },
  { name: "Mehdi bin Samad", title: "Lecturer, Department of Pharmacy, Independent University, Bangladesh", role: "Lecturer" },
  { name: "Mahapara Sanjana", title: "Lecturer, Department of Law, Southeast University", role: "Lecturer" },
  { name: "Regan Ahmed", title: "Assistant Professor, Department of Law, Southeast University", role: "Assistant Professor" },
  { name: "Dr. KMN Sarwar Iqbal", title: "Associate Professor, Dept. of Mechanical Engineering, International University of Business Agriculture & Technology", role: "Associate Professor" },
  { name: "Ahmad Asif Sami", title: "Lecturer, Department of Business Administration, East West University", role: "Lecturer" },
  { name: "Mohammad Abdul Hannan CTG", title: "Former Chairman and Assistant Professor, Department of Law, BGC Trust University Bangladesh", role: "Former Chairman" },
  { name: "Md. Towhidul Islam Jihadi", title: "Lecturer, Department of Law, BGC Trust University Bangladesh", role: "Lecturer" },
  { name: "Syed Mohammod Minhaz Hossain (Tonmoy)", title: "Chairman, Department of CSE, Premier University", role: "Chairman", isLate: true },
  { name: "Syed Billal Hossain", title: "Assistant Professor, Department of Public Health, University of Science and Technology Chittagong (USTC)", role: "Assistant Professor" },
  { name: "Mohammad Shyfur Rahman Chowdhury", title: "Associate Professor, BBA Department, IIUC", role: "Associate Professor" },
  { name: "Dr. Mohammad Saiful Islam", title: "Associate Professor & Chairman, Law Department, International Islamic University Chittagong", role: "Associate Professor & Chairman" },
  { name: "Abdullah Md. Ahshanul Mamun", title: "Associate Professor, BBA Department, International Islamic University Chittagong", role: "Associate Professor" },
  { name: "Md. Jehadul Islam Mony", title: "Assistant Professor, Leading University, Sylhet", role: "Assistant Professor" },
  { name: "A M Md. Sayeed", title: "Professor & Chairman, Department of Law, Atish Dipankar University of Science and Technology", role: "Professor & Chairman" },
  { name: "Dr. Mahtab Uddin", title: "Associate Professor, Institute of Natural Sciences, United International University", role: "Associate Professor" },
  { name: "Dr. Mahboob Hossain", title: "Professor, Department of Microbiology, Brac University", role: "Professor" },
  { name: "Mohammad Shawkat Ali", title: "Associate Professor of English, Bangladesh University of Business and Technology (BUBT)", role: "Associate Professor" },
];

export type InjuredHonoree = { name: string; institution: string | null };

/** Injured students from private universities. */
export const INJURED_CREST_PRIVATE_UNIVERSITY: InjuredHonoree[] = [
  { name: "Hasibul Islam Jisan", institution: "Brac University" },
  { name: "Abu Rayhan", institution: "Prime University" },
  { name: "Md Shariful Islam", institution: "European University Bangladesh" },
  { name: "Sadia Tasneem", institution: "IUBAT" },
  { name: "Md Najir Uddin Sabbir", institution: "University of Scholars" },
  { name: "Md Tanbir Hasan Riyad", institution: "University of Scholars" },
  { name: "Md Naimul Islam Khan Anik", institution: "Uttara University" },
  { name: "Irin Hawlader", institution: "Sonargaon University" },
  { name: "Sajjad Hossen", institution: "Shanto Mariam University of Creative Technology" },
  { name: "Badrul Alam Arno", institution: "United International University" },
  { name: "Nafisa Binte Elias", institution: "North South University" },
  { name: "Abdullah Al Shafil", institution: "North South University" },
  { name: "Baki Billah", institution: "Prime University" },
  { name: "Naymul Hossain", institution: "BGC Trust University Bangladesh" },
  { name: "Ahmed Saeed", institution: "BGC Trust University Bangladesh" },
  { name: "Md. Wadud Morshed", institution: "International Islamic University Chittagong" },
  { name: "A K M Nurullah", institution: "International Islamic University Chittagong" },
  { name: "Maraj Kaiyum", institution: "Southeast University" },
  { name: "Md Mustahid Hussain Bhuiyan Sami", institution: "North South University" },
  { name: "Tahmid Huzayfa", institution: "Independent University Bangladesh" },
  { name: "Md Saiyedu Zaman", institution: "European University Bangladesh" },
];

/** Injured honorees from outside the private-university sector. */
export const INJURED_CREST_OUTSIDE_PRIVATE_UNIVERSITY: InjuredHonoree[] = [
  { name: "Alamin Hossain", institution: "Pabna Zila School & College" },
  { name: "Jakir Shikder", institution: null },
  { name: "Rifat Howlader", institution: "Gulshan Commerce College" },
  { name: "Md. Akash Mia", institution: "Netrokona Model School & College" },
  { name: "Md. Rakib Hossain", institution: "Reboti Mohan Pilot School & College" },
  { name: "Ariyan Ahmed", institution: "Tejgaon College" },
];
