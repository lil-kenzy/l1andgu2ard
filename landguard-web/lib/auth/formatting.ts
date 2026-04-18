export type VerificationChannel = "sms" | "email";

const GHANA_CARD_MAIN_LENGTH = 9;
const GHANA_CARD_TOTAL_DIGITS = 10;
const GHANA_PHONE_LOCAL_LENGTH = 10;

export function cleanGhanaCard(value: string) {
  return value.toUpperCase().replace(/^GHA-?/i, "").replace(/\D/g, "").slice(0, GHANA_CARD_TOTAL_DIGITS);
}

export function formatGhanaCard(value: string, includePrefix = true) {
  const digits = cleanGhanaCard(value);
  const main = digits.slice(0, GHANA_CARD_MAIN_LENGTH);
  const suffix = digits.slice(GHANA_CARD_MAIN_LENGTH, GHANA_CARD_TOTAL_DIGITS);
  const formattedBody = suffix ? `${main}-${suffix}` : main;

  if (!includePrefix) {
    return formattedBody;
  }

  if (!formattedBody) {
    return "GHA-";
  }

  return `GHA-${formattedBody}`;
}

export function validateGhanaCard(value: string) {
  return /^GHA-\d{9}-\d$/i.test(formatGhanaCard(value, true));
}

export function cleanGhanaPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("233") && digits.length >= 12) {
    return `0${digits.slice(3, 12)}`;
  }

  if (!digits) {
    return "";
  }

  if (digits[0] !== "0") {
    return `0${digits.slice(0, GHANA_PHONE_LOCAL_LENGTH - 1)}`;
  }

  return digits.slice(0, GHANA_PHONE_LOCAL_LENGTH);
}

export function formatGhanaPhone(value: string) {
  return cleanGhanaPhone(value);
}

export function validateGhanaPhone(value: string) {
  return /^0\d{9}$/.test(cleanGhanaPhone(value));
}

export function toBackendGhanaPhone(value: string) {
  const local = cleanGhanaPhone(value);
  if (!/^0\d{9}$/.test(local)) {
    return "";
  }

  return `+233${local.slice(1)}`;
}

export function getVerificationContactPreview(
  channel: VerificationChannel,
  contacts: { email?: string; phone?: string }
) {
  if (channel === "email") {
    return contacts.email?.trim() || "your registered email address";
  }

  return contacts.phone?.trim() || "your registered phone number";
}
