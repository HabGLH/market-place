import { useState } from "react";
import FeedbackContext from "../context/FeedbackContext";

const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const notify = (message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismissToast(id), 4500);
  };

  const confirm = ({
    title = "Confirm action",
    message,
    confirmLabel = "Confirm",
  }) =>
    new Promise((resolve) => {
      setConfirmation({ title, message, confirmLabel, resolve });
    });

  const resolveConfirmation = (accepted) => {
    confirmation?.resolve(accepted);
    setConfirmation(null);
  };

  return (
    <FeedbackContext.Provider value={{ notify, confirm }}>
      {children}
      <div
        className="fixed right-4 top-20 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`flex items-start justify-between gap-4 border-l-4 bg-white px-4 py-3 text-sm shadow-lg dark:bg-gray-800 ${
              toast.type === "error"
                ? "border-red-600 text-red-800 dark:text-red-200"
                : "border-emerald-600 text-gray-900 dark:text-gray-100"
            }`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded text-gray-500 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 dark:hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {confirmation && (
        <div
          className="fixed inset-0 z-[110] grid place-items-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              resolveConfirmation(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            className="w-full max-w-md border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            <h2
              id="confirmation-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {confirmation.title}
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {confirmation.message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => resolveConfirmation(false)}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus-visible:outline focus-visible:outline-2 dark:border-gray-600 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => resolveConfirmation(true)}
                className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2"
              >
                {confirmation.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </FeedbackContext.Provider>
  );
};

export default FeedbackProvider;
