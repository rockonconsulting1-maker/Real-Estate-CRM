import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { PermissionProvider } from "./providers/PermissionProvider";
import { PipelineConfigProvider } from "./providers/PipelineConfigProvider";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <PermissionProvider>
          <PipelineConfigProvider>
            <App />
          </PipelineConfigProvider>
        </PermissionProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);
