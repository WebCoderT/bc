function formatDatePrefix(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

export function generateIssueNo(lastIssueNo?: string | null, now = new Date()) {
  const datePrefix = formatDatePrefix(now);

  if (lastIssueNo?.startsWith(datePrefix)) {
    const sequence = Number(lastIssueNo.slice(datePrefix.length) || '0') + 1;
    return `${datePrefix}${String(sequence).padStart(5, '0')}`;
  }

  return `${datePrefix}00001`;
}
