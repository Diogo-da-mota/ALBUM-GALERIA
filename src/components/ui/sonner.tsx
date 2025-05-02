import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      duration={2000}
      richColors
      closeButton
      visibleToasts={1}
      expand={false}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

let lastToastTimestamp = 0;
const MIN_TOAST_INTERVAL = 1000;

const canShowToast = () => {
  const now = Date.now();
  if (now - lastToastTimestamp < MIN_TOAST_INTERVAL) {
    return false;
  }
  lastToastTimestamp = now;
  return true;
};

const success = (message: string, options?: any) => {
  if (!canShowToast()) return;
  return toast.success(message, { duration: 1500, ...options });
};

const error = (message: string, options?: any) => {
  return toast.error(message, { duration: 4000, ...options });
};

const info = (message: string, options?: any) => {
  if (!canShowToast()) return;
  return toast.info(message, options);
};

const warning = (message: string, options?: any) => {
  if (!canShowToast()) return;
  return toast.warning(message, options);
};

export { Toaster };
export default { success, error, info, warning, toast };
