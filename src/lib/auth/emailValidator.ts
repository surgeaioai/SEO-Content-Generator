const PERSONAL_EMAIL_REASON =
  "Personal emails are not allowed. Please use your work email.";

export const BLOCKED_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "ymail.com",
  "live.com",
  "msn.com",
  "mail.com",
  "inbox.com",
  "zohomail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "mailinator.com",
] as const;

export type EmailValidationResult =
  | { allowed: true; domain: string }
  | { allowed: false; domain: string; reason: string };

function parseAllowedDomainsFromEnv(): string[] {
  return (process.env.ALLOWED_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Extracts and normalizes domain from an email address.
 */
export function getEmailDomain(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === normalizedEmail.length - 1) {
    return "";
  }
  return normalizedEmail.slice(atIndex + 1);
}

/**
 * Validates whether an email is allowed under business-email rules.
 */
export function validateWorkEmail(email: string): EmailValidationResult {
  const domain = getEmailDomain(email);
  if (!domain) {
    return {
      allowed: false,
      domain: "",
      reason: "Please enter a valid email address.",
    };
  }

  const explicitAllowedDomains = parseAllowedDomainsFromEnv();
  if (explicitAllowedDomains.length > 0) {
    const explicitlyAllowed = explicitAllowedDomains.includes(domain);
    if (!explicitlyAllowed) {
      return {
        allowed: false,
        domain,
        reason: "This email domain is not allowed for your organization.",
      };
    }

    return { allowed: true, domain };
  }

  if ((BLOCKED_DOMAINS as readonly string[]).includes(domain)) {
    return {
      allowed: false,
      domain,
      reason: PERSONAL_EMAIL_REASON,
    };
  }

  return { allowed: true, domain };
}

/**
 * Boolean helper for fast domain checks.
 */
export function isWorkEmail(email: string): boolean {
  return validateWorkEmail(email).allowed;
}
