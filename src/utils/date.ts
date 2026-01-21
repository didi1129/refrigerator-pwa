import { differenceInDays, parseISO, format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export const getRemainingDays = (expiryDate: string): number => {
  const now = new Date();
  const expiry = parseISO(expiryDate);
  return differenceInDays(expiry, now);
};

export const getExpiryStatus = (expiryDate: string): 'expired' | 'urgent' | 'safe' => {
  const days = getRemainingDays(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 3) return 'urgent';
  return 'safe';
};

export const formatDate = (dateString: string): string => {
  return format(parseISO(dateString), 'yyyy.MM.dd');
};

export const formatRelativeDate = (dateString: string): string => {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: ko });
};
