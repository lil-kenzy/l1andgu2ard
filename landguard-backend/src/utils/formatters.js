function normalizeGhanaPhone(input) {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '');

  if (digits.startsWith('233') && digits.length >= 12) {
    return `+233${digits.slice(3, 12)}`;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `+233${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `+233${digits}`;
  }

  return '';
}

function normalizeGhanaCard(input) {
  if (!input) return '';
  const value = String(input).toUpperCase().replace(/\s/g, '');
  if (/^GHA-\d{9}-\d$/.test(value)) return value;

  const digits = value.replace(/^GHA-?/i, '').replace(/\D/g, '').slice(0, 10);
  if (digits.length < 10) return '';
  return `GHA-${digits.slice(0, 9)}-${digits.slice(9)}`;
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '';
  const [name, domain] = email.split('@');
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return '';
  const normalized = normalizeGhanaPhone(phone);
  if (!normalized) return '';
  return `${normalized.slice(0, 7)}****`;
}

module.exports = {
  normalizeGhanaPhone,
  normalizeGhanaCard,
  maskEmail,
  maskPhone
};
