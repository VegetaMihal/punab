import { z } from "zod";

export const MUN_GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
export type MunGender = (typeof MUN_GENDERS)[number];
export const MUN_GENDER_LABEL: Record<MunGender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

export const MUN_EDUCATION_LEVELS = ["college", "undergraduate", "postgraduate", "other"] as const;
export type MunEducationLevel = (typeof MUN_EDUCATION_LEVELS)[number];
export const MUN_EDUCATION_LEVEL_LABEL: Record<MunEducationLevel, string> = {
  college: "College",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  other: "Other",
};

export const MUN_COMMITTEES = [
  "UNSC",
  "DISEC",
  "UNHRC",
  "UNEP",
  "UN Women",
  "INTERPOL",
  "MNAB",
  "International Press",
  "ICJ",
  "OIC",
] as const;
export type MunCommittee = (typeof MUN_COMMITTEES)[number];

export const MUN_COMMITTEE_FULL_NAME: Record<MunCommittee, string> = {
  UNSC: "United Nations Security Council",
  DISEC: "Disarmament and International Security Committee",
  UNHRC: "United Nations Human Rights Commission",
  UNEP: "United Nations Environment Programme",
  "UN Women": "UN Women",
  INTERPOL: "International Criminal Police Organization",
  MNAB: "Model National Assembly of Bangladesh",
  "International Press": "International Press",
  ICJ: "International Court of Justice",
  OIC: "Organisation of Islamic Cooperation",
};

export const MUN_YES_NO = ["yes", "no"] as const;
export type MunYesNo = (typeof MUN_YES_NO)[number];

export const MUN_FOOD_PREFERENCES = ["vegetarian", "non_vegetarian"] as const;
export type MunFoodPreference = (typeof MUN_FOOD_PREFERENCES)[number];
export const MUN_FOOD_PREFERENCE_LABEL: Record<MunFoodPreference, string> = {
  vegetarian: "Vegetarian",
  non_vegetarian: "Non-vegetarian",
};

export const MUN_AREAS_OF_INTEREST = [
  "international_relations",
  "diplomacy",
  "human_rights",
  "climate_environment",
  "international_security",
  "law_justice",
  "journalism_media",
  "womens_empowerment",
  "national_politics",
  "other",
] as const;
export type MunAreaOfInterest = (typeof MUN_AREAS_OF_INTEREST)[number];
export const MUN_AREA_OF_INTEREST_LABEL: Record<MunAreaOfInterest, string> = {
  international_relations: "International Relations",
  diplomacy: "Diplomacy",
  human_rights: "Human Rights",
  climate_environment: "Climate and Environment",
  international_security: "International Security",
  law_justice: "Law and Justice",
  journalism_media: "Journalism and Media",
  womens_empowerment: "Women's Empowerment",
  national_politics: "National Politics",
  other: "Other",
};

export const MUN_STATUSES = [
  "New",
  "Payment Pending",
  "Confirmed",
  "Payment Failed",
  "Rejected",
  "Duplicate",
] as const;
export type MunStatus = (typeof MUN_STATUSES)[number];

export const MUN_REGISTRATION_FEE_BDT = 3750;

export const MUN_PAYMENT_METHODS = ["bkash", "nagad", "bank", "cash_deposit"] as const;
export type MunPaymentMethod = (typeof MUN_PAYMENT_METHODS)[number];
export const MUN_PAYMENT_METHOD_LABEL: Record<MunPaymentMethod, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank Transfer",
  cash_deposit: "Cash Deposit",
};

const req = (msg: string) => z.string().trim().min(1, msg);
const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s === undefined || s === "" ? "" : s));

export const munFormSchema = z
  .object({
    // Personal
    fullName: req("Full name is required"),
    certificateName: req("Name for certificate is required"),
    dob: req("Date of birth is required"),
    gender: z.enum(MUN_GENDERS, { error: () => ({ message: "Select a gender." }) }),
    nationality: req("Nationality is required"),
    idNumber: optionalTrimmed,
    presentAddress: req("Present address is required"),
    permanentAddress: req("Permanent address is required"),
    mobile: z.string().trim().min(1, "Mobile number is required").regex(/^[\d+\-\s()]{8,22}$/, "Enter a valid mobile number"),
    whatsapp: z.string().trim().min(1, "WhatsApp number is required").regex(/^[\d+\-\s()]{8,22}$/, "Enter a valid number"),
    email: z.string().trim().email("Enter a valid email"),
    facebookLink: optionalTrimmed,

    // Academic
    institutionName: req("Institution name is required"),
    department: req("Department / programme is required"),
    currentYear: req("Current semester/year is required"),
    studentId: req("Student ID is required"),
    educationLevel: z.enum(MUN_EDUCATION_LEVELS, { error: () => ({ message: "Select your education level." }) }),
    educationLevelOther: optionalTrimmed,

    // Committee/country preference
    firstCommittee: z.enum(MUN_COMMITTEES, { error: () => ({ message: "Select your first committee preference." }) }),
    secondCommittee: z.enum(MUN_COMMITTEES, { error: () => ({ message: "Select your second committee preference." }) }),
    thirdCommittee: z.enum(MUN_COMMITTEES, { error: () => ({ message: "Select your third committee preference." }) }),
    firstCountry: req("First country/portfolio preference is required"),
    secondCountry: req("Second country/portfolio preference is required"),
    thirdCountry: req("Third country/portfolio preference is required"),

    // MUN experience
    hasPriorMun: z.enum(MUN_YES_NO, { error: () => ({ message: "Choose Yes or No." }) }),
    totalConferences: optionalTrimmed,
    previousExperience: optionalTrimmed,
    wasLeadership: z.enum(MUN_YES_NO, { error: () => ({ message: "Choose Yes or No." }) }),
    leadershipDetails: optionalTrimmed,

    // Motivation
    areasOfInterest: z.array(z.enum(MUN_AREAS_OF_INTEREST)).min(1, "Select at least one area of interest"),
    areasOfInterestOther: optionalTrimmed,

    // Emergency
    emergencyContactName: req("Emergency contact name is required"),
    emergencyRelationship: req("Relationship is required"),
    emergencyMobile: z.string().trim().min(1, "Emergency mobile number is required").regex(/^[\d+\-\s()]{8,22}$/, "Enter a valid number"),
    emergencyAltMobile: optionalTrimmed,
    emergencyAddress: req("Emergency contact address is required"),

    // Special requirements
    dietaryRestrictions: z.enum(MUN_YES_NO, { error: () => ({ message: "Choose Yes or No." }) }),
    dietaryDetails: optionalTrimmed,
    accessibilityNeeds: z.enum(MUN_YES_NO, { error: () => ({ message: "Choose Yes or No." }) }),
    accessibilityDetails: optionalTrimmed,
    medicalRequirements: z.enum(MUN_YES_NO, { error: () => ({ message: "Choose Yes or No." }) }),
    medicalDetails: optionalTrimmed,
    foodPreference: z.enum(MUN_FOOD_PREFERENCES, { error: () => ({ message: "Select a food preference." }) }),

    // Accommodation/travel
    needsAccommodation: z.enum(MUN_YES_NO, { error: () => ({ message: "Choose Yes or No." }) }),
    fromOutsideDhaka: z.enum(MUN_YES_NO, { error: () => ({ message: "Choose Yes or No." }) }),
    departureDistrict: optionalTrimmed,
    arrivalDateTime: optionalTrimmed,
    departureDateTime: optionalTrimmed,
    travelNotes: optionalTrimmed,

    // Referral
    referredBy: optionalTrimmed,

    // Payment verification
    paymentMethod: z.enum(MUN_PAYMENT_METHODS, { error: () => ({ message: "Select a payment method." }) }),
    amountPaid: req("Amount paid is required"),
    paymentDate: req("Payment date is required"),
    transactionId: req("Transaction ID is required"),
    paymentSenderInfo: req("Sender's mobile number or bank account number is required"),
    paymentAccountHolderName: req("Account holder's name is required"),
    paymentBankName: optionalTrimmed,
    paymentAdditionalInfo: optionalTrimmed,

    // Declaration
    declarationAccepted: z.literal(true, { error: () => ({ message: "You must accept the declaration." }) }),
    codeOfConductAccepted: z.literal(true, { error: () => ({ message: "You must agree to the code of conduct." }) }),
  })
  .superRefine((data, ctx) => {
    if (data.educationLevel === "other" && !data.educationLevelOther) {
      ctx.addIssue({ code: "custom", message: "Describe your education level.", path: ["educationLevelOther"] });
    }
    if (data.areasOfInterest.includes("other") && !data.areasOfInterestOther) {
      ctx.addIssue({ code: "custom", message: "Describe your area of interest.", path: ["areasOfInterestOther"] });
    }
    if (data.hasPriorMun === "yes" && !data.totalConferences) {
      ctx.addIssue({ code: "custom", message: "Enter the number of conferences attended.", path: ["totalConferences"] });
    }
    if (data.wasLeadership === "yes" && !data.leadershipDetails) {
      ctx.addIssue({ code: "custom", message: "Describe your leadership/organizing experience.", path: ["leadershipDetails"] });
    }
    if (data.dietaryRestrictions === "yes" && !data.dietaryDetails) {
      ctx.addIssue({ code: "custom", message: "Please specify your dietary restrictions.", path: ["dietaryDetails"] });
    }
    if (data.accessibilityNeeds === "yes" && !data.accessibilityDetails) {
      ctx.addIssue({ code: "custom", message: "Please specify your accessibility needs.", path: ["accessibilityDetails"] });
    }
    if (data.medicalRequirements === "yes" && !data.medicalDetails) {
      ctx.addIssue({ code: "custom", message: "Please specify your medical requirements.", path: ["medicalDetails"] });
    }
    if (data.fromOutsideDhaka === "yes" && !data.departureDistrict) {
      ctx.addIssue({ code: "custom", message: "Enter your district/country of departure.", path: ["departureDistrict"] });
    }
    if (data.paymentMethod === "bank" && !data.paymentBankName) {
      ctx.addIssue({ code: "custom", message: "Enter the bank name.", path: ["paymentBankName"] });
    }
  });

export type MunFormParsed = z.infer<typeof munFormSchema>;
