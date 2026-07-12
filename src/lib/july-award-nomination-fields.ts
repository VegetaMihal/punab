/** Text fields on the July Award nomination form (files excluded — not echoable). */
export type JulyAwardNominationFieldValues = {
  clubName: string;
  universityName: string;
  clubSocialLink: string;
  yearEstablished: string;
  communicationEmail: string;
  mobileNumber: string;
  activeMembersApprox: string;
  eventsLast12Months: string;
  presidentName: string;
  facultyRole: string;
  facultyContactName: string;
  facultyContactMobile: string;
  supportingDriveLinks: string;
};

export function emptyJulyAwardNominationFields(): JulyAwardNominationFieldValues {
  return {
    clubName: "",
    universityName: "",
    clubSocialLink: "",
    yearEstablished: "",
    communicationEmail: "",
    mobileNumber: "",
    activeMembersApprox: "",
    eventsLast12Months: "",
    presidentName: "",
    facultyRole: "",
    facultyContactName: "",
    facultyContactMobile: "",
    supportingDriveLinks: "",
  };
}

export function echoJulyAwardNominationFieldsFromFormData(
  formData: FormData
): JulyAwardNominationFieldValues {
  const g = (key: keyof JulyAwardNominationFieldValues) => formData.get(key)?.toString() ?? "";
  return {
    clubName: g("clubName"),
    universityName: g("universityName"),
    clubSocialLink: g("clubSocialLink"),
    yearEstablished: g("yearEstablished"),
    communicationEmail: g("communicationEmail"),
    mobileNumber: g("mobileNumber"),
    activeMembersApprox: g("activeMembersApprox"),
    eventsLast12Months: g("eventsLast12Months"),
    presidentName: g("presidentName"),
    facultyRole: g("facultyRole"),
    facultyContactName: g("facultyContactName"),
    facultyContactMobile: g("facultyContactMobile"),
    supportingDriveLinks: g("supportingDriveLinks"),
  };
}
