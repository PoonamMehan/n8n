export function WebhookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-20 h-20 ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 3.87 3.13 7 7 7 1.66 0 3.2-.66 4.24-1.76L19 16v2l-2.76-2.76C15.2 16.34 13.66 17 12 17c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8h-2c0-3.87-3.13-7-7-7z"/>
      <path d="M16.24 7.76C14.4 5.92 11.24 5.92 9.4 7.76 7.57 9.6 7.57 12.76 9.4 14.6l1.41-1.41C10.01 12.39 9.8 11.2 10.47 10.47c.68-.74 1.87-.96 3.13-.38L15.17 8.35c.58-.58 .37-1.37-.93-1.37-.44 0-.88.17-1.21.5z"/>
    </svg>
  );
}
