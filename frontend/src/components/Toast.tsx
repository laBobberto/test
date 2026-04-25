import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      richColors
      theme="dark"
      expand={true}
      closeButton
      duration={3000}
    />
  );
};
