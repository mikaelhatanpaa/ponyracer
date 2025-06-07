import { formatDistanceToNowStrict, parseISO } from 'date-fns';

export default function fromNow(date: string) {
  const dateObj = parseISO(date);
  const instant = formatDistanceToNowStrict(dateObj, { addSuffix: true });
  return instant;
}
