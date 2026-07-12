export type JulyParticipantFieldValues = {
  fullName: string;
  phoneNumber: string;
  email: string;
  universityName: string;
  clubName: string;
  departmentOrRole: string;
  donatesBlood: string;
  bloodGroup: string;
};

export function emptyJulyParticipantFields(): JulyParticipantFieldValues {
  return {
    fullName: "",
    phoneNumber: "",
    email: "",
    universityName: "",
    clubName: "",
    departmentOrRole: "",
    donatesBlood: "",
    bloodGroup: "",
  };
}

export function echoJulyParticipantFieldsFromFormData(
  formData: FormData
): JulyParticipantFieldValues {
  const g = (key: keyof JulyParticipantFieldValues) => formData.get(key)?.toString() ?? "";
  return {
    fullName: g("fullName"),
    phoneNumber: g("phoneNumber"),
    email: g("email"),
    universityName: g("universityName"),
    clubName: g("clubName"),
    departmentOrRole: g("departmentOrRole"),
    donatesBlood: g("donatesBlood"),
    bloodGroup: g("bloodGroup"),
  };
}
