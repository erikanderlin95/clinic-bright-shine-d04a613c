export type QueueVisibilityMode = "live" | "smart";

const STORAGE_KEY = "clynicq_queue_visibility_mode";
export const QUEUE_MODE_EVENT = "clynicq-queue-mode-change";

export const resolveQueueVisibilityMode = (value: string | null): QueueVisibilityMode =>
  value === "smart" ? "smart" : "live";

export const getQueueVisibilityMode = (): QueueVisibilityMode => {
  if (typeof window === "undefined") return "live";
  return resolveQueueVisibilityMode(localStorage.getItem(STORAGE_KEY));
};

export const setQueueVisibilityModeValue = (mode: QueueVisibilityMode) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent(QUEUE_MODE_EVENT, { detail: mode }));
};