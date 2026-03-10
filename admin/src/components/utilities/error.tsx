import { type FC, useMemo } from 'react';
import {
  useNavigate,
  useRouteError,
  isRouteErrorResponse
} from 'react-router';
import { useGlobalProvider } from '../../constants/providers/global.provider';
// Note: We are using native useNavigate instead of the custom useRouter 
// to avoid the context error you encountered.
import styles from "./css/error.module.css";

const ErrorScreen: FC = () => {
  const error = useRouteError();
  const globalProvider = useGlobalProvider();

  // Safe Navigation Hook
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    console.warn("Navigation context unavailable in ErrorScreen");
  }

  const activeColor = globalProvider?.activeColor || {
    text: '#ffffff',
    textFade: 'rgba(255,255,255,0.7)',
    background: '#1a1a1a',
    backgroundFade: 'rgba(255,255,255,0.1)'
  };

  const { title, message, code } = useMemo(() => {
    if (isRouteErrorResponse(error)) {
      return {
        title: "Route Error",
        message: error.statusText || (error.data as any)?.message || "Page not found",
        code: error.status.toString(),
      };
    } else if (error instanceof Error) {
      return {
        title: "Application Error",
        message: error.message,
        code: "500",
      };
    }
    return {
      title: "Unexpected Error",
      message: "An unknown error occurred",
      code: "Error",
    };
  }, [error]);

  const handleHome = () => {
    const path = "/";
    localStorage.removeItem("last_page");
    if (navigate) {
      navigate(path, { replace: true });
    } else {
      window.location.assign(path);
    }
  };

  const handleBack = () => {
    if (navigate) {
      localStorage.removeItem("last_page");
      navigate(-1);
    } else {
      window.history.back();
    }
  };

  return (
    <div
      className={styles.error_container}
      style={{
        color: activeColor.text,
        background: `
            radial-gradient(circle at 20% 30%, ${activeColor.backgroundFade} 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, ${activeColor.backgroundFade} 0%, transparent 40%),
            linear-gradient(135deg, ${activeColor.backgroundFade} 0%, transparent 60%),
            ${activeColor.background}
          `,
      }}
    >
      <div className={styles.error_code} style={{ color: activeColor.text }}>{code}</div>
      <div className={styles.error_title} style={{ color: activeColor.text }}>{title}</div>
      <div className={styles.error_message} style={{ color: activeColor.textFade }}>{message}</div>

      <div className={styles.error_buttons}>
        <button onClick={handleBack} className={styles.error_button}>
          Back
        </button>
        <button onClick={handleHome} className={`${styles.error_button} ${styles.retry}`}>
          Home
        </button>
      </div>
    </div>
  );
};

export default ErrorScreen;