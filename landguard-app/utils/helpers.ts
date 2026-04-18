import { Alert } from 'react-native';

export function showAlert(title: string, message: string, buttons?: any[]) {
  Alert.alert(title, message, buttons || [{ text: 'OK', onPress: () => {} }]);
}

export function showError(title: string, message: string) {
  showAlert(title, message);
}

export function showSuccess(message: string) {
  Alert.alert('Success', message);
}

export function formatCurrency(amount: number, currency = 'GHS'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  return phoneRegex.test(phone) || phone.length >= 10;
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function getStatusColor(status: string): string {
  const statusColors: { [key: string]: string } = {
    available: '#10b981',
    under_offer: '#f59e0b',
    sold: '#6366f1',
    disputed: '#ef4444',
    pending: '#f59e0b',
    completed: '#10b981',
    cancelled: '#6b7280',
    draft: '#9ca3af',
    published: '#10b981',
  };
  return statusColors[status] || '#6b7280';
}

export function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    available: 'Available',
    under_offer: 'Under Offer',
    sold: 'Sold',
    disputed: 'Disputed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    draft: 'Draft',
    published: 'Published',
  };
  return labels[status] || status;
}
