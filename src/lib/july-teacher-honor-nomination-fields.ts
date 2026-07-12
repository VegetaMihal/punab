export type JulyTeacherHonorNominationFieldValues = {
  nominatorFullName: string;
  nominatorEmail: string;
  nominatorPhone: string;
  nominatorUniversity: string;
  teacherFullName: string;
  teacherDesignation: string;
  teacherUniversityName: string;
  departmentSubject: string;
  teacherPhone: string;
  teacherEmail: string;
  teacherSocialLink: string;
  nominationNarrative: string;
  referenceLinks: string;
};

export function emptyJulyTeacherHonorNominationFields(): JulyTeacherHonorNominationFieldValues {
  return {
    nominatorFullName: "",
    nominatorEmail: "",
    nominatorPhone: "",
    nominatorUniversity: "",
    teacherFullName: "",
    teacherDesignation: "",
    teacherUniversityName: "",
    departmentSubject: "",
    teacherPhone: "",
    teacherEmail: "",
    teacherSocialLink: "",
    nominationNarrative: "",
    referenceLinks: "",
  };
}

export function echoJulyTeacherHonorFieldsFromFormData(
  formData: FormData
): JulyTeacherHonorNominationFieldValues {
  const g = (key: keyof JulyTeacherHonorNominationFieldValues) =>
    formData.get(key)?.toString() ?? "";
  return {
    nominatorFullName: g("nominatorFullName"),
    nominatorEmail: g("nominatorEmail"),
    nominatorPhone: g("nominatorPhone"),
    nominatorUniversity: g("nominatorUniversity"),
    teacherFullName: g("teacherFullName"),
    teacherDesignation: g("teacherDesignation"),
    teacherUniversityName: g("teacherUniversityName"),
    departmentSubject: g("departmentSubject"),
    teacherPhone: g("teacherPhone"),
    teacherEmail: g("teacherEmail"),
    teacherSocialLink: g("teacherSocialLink"),
    nominationNarrative: g("nominationNarrative"),
    referenceLinks: g("referenceLinks"),
  };
}
