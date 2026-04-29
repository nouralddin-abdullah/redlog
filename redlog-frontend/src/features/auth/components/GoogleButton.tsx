import { Button } from '@/shared/components/ui/Button';

export function GoogleButton({ label = 'الدخول بحساب Google' }: { label?: string }) {
  return (
    <Button
      variant="outline"
      size="lg"
      block
      type="button"
      iconStart={
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.6c2.1-2 3.3-4.9 3.3-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8C3.9 20.5 7.7 23 12 23z"
          />
          <path
            fill="#FBBC04"
            d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V7H2.1C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 5l3.7-2.9z"
          />
          <path
            fill="#EA4335"
            d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.2-3.2C17.5 2 14.9 1 12 1 7.7 1 3.9 3.5 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"
          />
        </svg>
      }
    >
      {label}
    </Button>
  );
}
