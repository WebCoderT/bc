export type AuthMode = "login" | "register";

export {
  AUTH_STORAGE_KEY,
  type AuthSession,
  type AuthUser,
  ClientApiError as AuthApiError,
  type LoginInput,
  type RegisterInput,
  SafeUserDtoRoleEnum,
  clearStoredSession,
  fetchCurrentUserProfile,
  formatAuthCurrency,
  formatAuthDate,
  formatAuthUserRole,
  loginGameSession,
  readStoredSession,
  refreshStoredSession,
  registerAndLoginGameSession,
  registerGameUser,
  writeStoredSession,
} from "./client-api";
