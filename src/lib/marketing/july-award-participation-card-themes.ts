export type JulyAwardParticipationTheme = {
  name: string;
  paper: string;
  paperDeep: string;
  ink: string;
  inkSoft: string;
  red: string;
  redDeep: string;
  green: string;
  greenDeep: string;
  gold: string;
  cream: string;
};

export const JULY_AWARD_PARTICIPATION_THEMES: Record<string, JulyAwardParticipationTheme> = {
  tricolor: {
    name: "Tricolor (RWG)",
    paper: "#FFFCF5",
    paperDeep: "#F4EEDF",
    ink: "#0E120F",
    inkSoft: "#3B4540",
    red: "#C8161E",
    redDeep: "#8E0C12",
    green: "#1B7F3A",
    greenDeep: "#0F5424",
    gold: "#C49B5A",
    cream: "#FAF4E2",
  },
};

export const JULY_AWARD_PARTICIPATION_DEFAULT_THEME = JULY_AWARD_PARTICIPATION_THEMES.tricolor;
