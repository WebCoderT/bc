import { type ClientNavigation } from "@/app/lib/client-api";

export type GameNavigationItem = {
  label: string;
  href: string;
  badge: string;
  pageTitle: string;
};

export type GameNavigationSection = {
  label: string;
  href: string;
  title: string;
  items: GameNavigationItem[];
};

function createRootNavigationItem(
  navigation: ClientNavigation,
): GameNavigationItem {
  return {
    label: navigation.name,
    href: navigation.path,
    badge: "",
    pageTitle: navigation.name,
  };
}

function createChildNavigationItem(
  navigation: ClientNavigation,
): GameNavigationItem {
  return {
    label: navigation.name,
    href: navigation.path,
    badge: "",
    pageTitle: navigation.name,
  };
}

export function mapNavigationsToGameSections(
  navigations: ClientNavigation[],
): GameNavigationSection[] {
  const sections = navigations
    .filter((item) => item.level === 1)
    .map((item) => {
      const children = item.children.map(createChildNavigationItem);

      return {
        label: item.name,
        href: item.path,
        title: `${item.name}导航`,
        items: [createRootNavigationItem(item), ...children],
      } satisfies GameNavigationSection;
    });

  return sections.length > 0 ? sections : [];
}

export function getGameSectionByPath(
  pathname: string | null,
  sections: GameNavigationSection[] = [],
) {
  const currentPathname = pathname ?? "/game";
  return (
    sections.find(
      (section) =>
        currentPathname === section.href ||
        currentPathname.startsWith(`${section.href}/`),
    ) ?? sections[0]
  );
}

export function isGameLinkActive(pathname: string | null, href: string) {
  const currentPathname = pathname ?? "/game";

  if (href === "/game") {
    return currentPathname === href;
  }

  return currentPathname === href || currentPathname.startsWith(`${href}/`);
}
