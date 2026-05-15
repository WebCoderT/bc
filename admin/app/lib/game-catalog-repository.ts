"use client";

import { categoryItems, gameItems } from "@/app/data/admin-data";
import {
  GameCategoryResponseDtoStatusEnum,
  type GameCategoryResponseDto,
} from "@/app/generated/admin-api/data-contracts";
import type { CategoryItem, GameItem, GameStatus } from "@/app/types/ui";

export type GameCatalogState = {
  categories: CategoryItem[];
  games: GameItem[];
};

export type CategoryFormInput = Required<
  Pick<
    GameCategoryResponseDto,
    "name" | "description" | "tags" | "isRecommended" | "heat" | "status"
  >
>;

const GAME_CATALOG_STORAGE_KEY = "admin-game-catalog";
const UNCATEGORIZED_LABEL = "未分类";

function getNowString() {
  return new Date().toISOString();
}

function normalizeGamesWithCategories(
  games: GameItem[],
  categories: CategoryItem[],
) {
  const categoryMap = new Map(categories.map((item) => [item.id, item]));

  return games.map((item) => {
    if (!item.categoryId) {
      return {
        ...item,
        category: UNCATEGORIZED_LABEL,
      };
    }

    const category = categoryMap.get(item.categoryId);

    if (!category) {
      return {
        ...item,
        categoryId: null,
        category: UNCATEGORIZED_LABEL,
      };
    }

    return {
      ...item,
      category: category.name,
    };
  });
}

function normalizeCategoriesWithGames(
  categories: CategoryItem[],
  games: GameItem[],
) {
  return categories.map((item) => ({
    ...item,
    gameCount: games.filter((game) => game.categoryId === item.id).length,
  }));
}

function normalizeCatalog(state: GameCatalogState): GameCatalogState {
  const normalizedGames = normalizeGamesWithCategories(
    state.games,
    state.categories,
  );
  const normalizedCategories = normalizeCategoriesWithGames(
    state.categories,
    normalizedGames,
  );

  return {
    categories: normalizedCategories,
    games: normalizedGames,
  };
}

export function getDefaultGameCatalog(): GameCatalogState {
  return normalizeCatalog({
    categories: categoryItems,
    games: gameItems,
  });
}

export function readGameCatalog(): GameCatalogState {
  if (typeof window === "undefined") {
    return getDefaultGameCatalog();
  }

  const raw = window.localStorage.getItem(GAME_CATALOG_STORAGE_KEY);

  if (!raw) {
    return getDefaultGameCatalog();
  }

  try {
    const parsed = JSON.parse(raw) as GameCatalogState;
    return normalizeCatalog(parsed);
  } catch {
    window.localStorage.removeItem(GAME_CATALOG_STORAGE_KEY);
    return getDefaultGameCatalog();
  }
}

export function writeGameCatalog(state: GameCatalogState) {
  if (typeof window === "undefined") {
    return normalizeCatalog(state);
  }

  const normalizedState = normalizeCatalog(state);
  window.localStorage.setItem(
    GAME_CATALOG_STORAGE_KEY,
    JSON.stringify(normalizedState),
  );
  return normalizedState;
}

export function createEmptyCategoryInput(): CategoryFormInput {
  return {
    name: "",
    description: "",
    tags: [],
    isRecommended: false,
    heat: 0,
    status: GameCategoryResponseDtoStatusEnum.Value已启用,
  };
}

export function upsertCategory(
  state: GameCatalogState,
  input: CategoryFormInput,
  categoryId?: number,
) {
  const now = getNowString();

  if (categoryId) {
    return normalizeCatalog({
      ...state,
      categories: state.categories.map((item) =>
        item.id === categoryId
          ? {
              ...item,
              ...input,
              updatedAt: now,
            }
          : item,
      ),
    });
  }

  const nextId =
    state.categories.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;

  return normalizeCatalog({
    ...state,
    categories: [
      {
        id: nextId,
        ...input,
        gameCount: 0,
        createdAt: now,
        updatedAt: now,
      },
      ...state.categories,
    ],
  });
}

export function deleteCategory(state: GameCatalogState, categoryId: number) {
  const nextCategories = state.categories.filter(
    (item) => item.id !== categoryId,
  );
  const nextGames = state.games.map((item) =>
    item.categoryId === categoryId
      ? {
          ...item,
          categoryId: null,
          category: UNCATEGORIZED_LABEL,
          updatedAt: getNowString(),
        }
      : item,
  );

  return normalizeCatalog({
    categories: nextCategories,
    games: nextGames,
  });
}

export function updateGamesByCategoryStatus(
  state: GameCatalogState,
  categoryId: number,
  status: GameStatus,
) {
  const now = getNowString();

  return normalizeCatalog({
    ...state,
    games: state.games.map((item) =>
      item.categoryId === categoryId
        ? {
            ...item,
            status,
            updatedAt: now,
          }
        : item,
    ),
  });
}

export function resetGameCatalog() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(GAME_CATALOG_STORAGE_KEY);
  }

  return getDefaultGameCatalog();
}
