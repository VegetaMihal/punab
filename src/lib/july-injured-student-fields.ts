export type JulyInjuredStudentFieldValues = {
  fullName: string;
  phoneNumber: string;
  universityName: string;
  injuryDescription: string;
};

export function emptyJulyInjuredStudentFields(): JulyInjuredStudentFieldValues {
  return {
    fullName: "",
    phoneNumber: "",
    universityName: "",
    injuryDescription: "",
  };
}

export function echoJulyInjuredStudentFieldsFromFormData(
  formData: FormData
): JulyInjuredStudentFieldValues {
  const g = (key: keyof JulyInjuredStudentFieldValues) => formData.get(key)?.toString() ?? "";
  return {
    fullName: g("fullName"),
    phoneNumber: g("phoneNumber"),
    universityName: g("universityName"),
    injuryDescription: g("injuryDescription"),
  };
}
