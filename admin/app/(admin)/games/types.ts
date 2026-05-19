import type {
  SaveAdminGameInput,
  UpdateAdminGameInput,
  AdminGame,
} from "@/app/lib/admin-api";
import type {
  GameCurrentIssueResponseDto,
  GameDrawRecordResponseDto,
} from "@/app/generated/admin-api/data-contracts";

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

export type GameDrawModalState = {
  game: AdminGame | null;
  currentIssue: GameCurrentIssueResponseDto | null;
  records: GameDrawRecordResponseDto[];
  isLoading: boolean;
  isDrawing: boolean;
  error: string;
};

export type CategoryNameMap = ReadonlyMap<number, string>;

export type GameModelNameMap = ReadonlyMap<string, string>;
