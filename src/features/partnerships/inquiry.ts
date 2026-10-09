export const inquiryTopics = ["Brand partnership", "Sponsored content", "Editorial correction", "General enquiry"] as const;
export function inquiryDraft(topic: string, organisation: string, message: string) {
  if (!(inquiryTopics as readonly string[]).includes(topic)) return null;
  const cleanOrganisation = organisation.trim();
  const cleanMessage = message.trim();
  if (!cleanMessage || cleanMessage.length > 3000 || cleanOrganisation.length > 120) return null;
  const subject = `${topic}${cleanOrganisation ? `: ${cleanOrganisation}` : ""}`.replace(/[\r\n]/g, " ");
  const body = `${cleanOrganisation ? `Organisation: ${cleanOrganisation}\n\n` : ""}${cleanMessage}`;
  return { subject, body, href: `mailto:hello@thepetclub.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}
