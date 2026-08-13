export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
};

const STORAGE_KEY = "airbnb_current_user";

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser =
      localStorage.getItem(STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Failed to read current user:",
      error
    );

    return null;
  }
}

export function setCurrentUser(
  user: CurrentUser
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(user)
  );
}

export function clearCurrentUser() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}