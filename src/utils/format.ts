import dayjs from 'dayjs';

export function formatDate(date: Date | string | number | null): string {
  if (!date) return '';

  //TEMPLATE: change date format if needed
  return dayjs(date).format('DD.MM.YYYY');
}

export function formatDateTime(date: Date | string | number | null): string {
  if (!date) return '';

  //TEMPLATE: change datetime format if needed
  return dayjs(date).format('DD.MM.YYYY HH:mm');
}
