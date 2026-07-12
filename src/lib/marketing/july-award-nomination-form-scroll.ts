/** Visual order of nomination fields (matches the form layout). */
export const JULY_AWARD_NOMINATION_FIELD_ORDER = [
  "clubName",
  "clubLogoFile",
  "universityName",
  "clubSocialLink",
  "yearEstablished",
  "communicationEmail",
  "mobileNumber",
  "activeMembersApprox",
  "eventsLast12Months",
  "presidentName",
  "facultyRole",
  "facultyContactName",
  "facultyContactMobile",
  "supportingDriveLinks",
  "supportingPdf",
] as const;

export type JulyAwardNominationFieldId = (typeof JULY_AWARD_NOMINATION_FIELD_ORDER)[number];

export const JULY_AWARD_NOMINATION_FORM_ERROR_ID = "july-award-nomination-form-error";

export function firstJulyAwardNominationErrorFieldId(
  fieldErrors?: Record<string, string>,
  hasFormError?: boolean
): string | null {
  if (fieldErrors) {
    for (const key of JULY_AWARD_NOMINATION_FIELD_ORDER) {
      if (fieldErrors[key]) return key;
    }
  }
  if (hasFormError) return JULY_AWARD_NOMINATION_FORM_ERROR_ID;
  return null;
}

export function scrollToJulyAwardNominationField(fieldId: string): void {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  if (el instanceof HTMLElement) {
    el.focus({ preventScroll: true });
  }
}
