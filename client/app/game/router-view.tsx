"use client";

import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useGameUser } from "./game-user-context";
import ProfileHome from "./profile-home";
import { gameSecondaryRoutes } from "./routes";
import { EmptyGamePage } from "./components/empty-game-page";

/**
 * 登录态丢失时，直接回到未登录首页。
 */
function RedirectToRoot() {
  useEffect(() => {
    window.location.replace("/");
  }, []);

  return null;
}

/**
 * `react-router-dom` 侧的权限守卫。
 */
function RequireGameAuth() {
  const user = useGameUser();

  if (!user) {
    return <RedirectToRoot />;
  }

  return <Outlet />;
}

/**
 * `/game` 内部路由视图。
 *
 * 路由项全部来源于 `routes.ts`，页面层只负责把配置映射成组件。
 */
export default function GameRouterView() {
  return (
    <Routes>
      <Route element={<RequireGameAuth />}>
        {gameSecondaryRoutes.map((route) => {
          if (route.pageType === "profile") {
            return route.to === "/" ? (
              <Route key={route.to} index element={<ProfileHome />} />
            ) : (
              <Route
                key={route.to}
                path={route.to.slice(1)}
                element={<ProfileHome />}
              />
            );
          }

          return route.to === "/" ? null : (
            <Route
              key={route.to}
              path={route.to.slice(1)}
              element={<EmptyGamePage title={route.pageTitle} />}
            />
          );
        })}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
