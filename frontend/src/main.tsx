import React from "react";
import ReactDOM from "react-dom/client";  // ✅ Use `react-dom/client`
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ Create a QueryClient instance
const queryClient = new QueryClient();

// ✅ Use `ReactDOM.createRoot()` instead of `ReactDOM.render()`
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
