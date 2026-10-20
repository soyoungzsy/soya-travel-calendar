import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import {WishlistToast} from "./WishlistToast.jsx";
import "./wishlist-feedback.css";
import {AnalyticsPrivacy} from "./AnalyticsPrivacy.jsx";
import {startAnalytics} from "./analytics.mjs";
import "./analytics.css";
const Encyclopedia=React.lazy(()=>import("./Encyclopedia.jsx"));
const Insights=React.lazy(()=>import("./Insights.jsx"));
startAnalytics();
import "./styles.css";
import "./revision-five.css";
import "./personal-places.css";

createRoot(document.getElementById("journey-atlas-root")).render(
  <React.StrictMode>
    {location.pathname==='/insights'?<React.Suspense fallback={<p>正在打开数据报表…</p>}><Insights/></React.Suspense>:<>{location.pathname==='/encyclopedia'?<React.Suspense fallback={<p>正在展开旅行百科…</p>}><Encyclopedia/></React.Suspense>:<App/>}<AnalyticsPrivacy/><WishlistToast/></>}
  </React.StrictMode>,
);

import "./document-import.css";

import "./knowledge.css";

import "./my-menu.css";

import "./usability.css";

import "./editorial-v10.css";

import "./paper-theme.css";
