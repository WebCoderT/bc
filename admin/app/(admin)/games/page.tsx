"use client";

import { GamesPageContent } from "./games-page-content";
import { useGamesPage } from "./use-games-page";

export default function GamesRoute() {
  const gamesPageState = useGamesPage();

  return <GamesPageContent {...gamesPageState} />;
}
