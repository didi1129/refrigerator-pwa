import { differenceInDays, parseISO, format } from 'date-fns';

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
