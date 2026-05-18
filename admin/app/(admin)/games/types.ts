import type {
  AdminGame,
  SaveAdminGameInput,
  UpdateAdminGameInput,
} from "@/app/lib/admin-api";

export type GameFormInput = SaveAdminGameInput | UpdateAdminGameInput;

export type GamesPaginationState = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type GamesModalState = {
  selectedGame: AdminGame | null;
  isCreating: boolean;
};

export type CategoryNameMap = ReadonlyMap<number, string>;

export type GameModelNameMap = ReadonlyMap<string, string>;
