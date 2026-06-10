import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppShell } from "./components/layout/AppShell";
import { AuthGuard } from "./components/layout/AuthGuard";
import { RouteErrorBoundary } from "./components/layout/RouteErrorBoundary";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

// Auth Pages
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ConnectGhl = lazy(() => import("./pages/auth/ConnectGhl"));
const AcceptInvite = lazy(() => import("./pages/auth/AcceptInvite"));

// App Pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Leads = lazy(() => import("./pages/Leads"));
const LeadDetail = lazy(() => import("./pages/LeadDetail"));
const Contacts = lazy(() => import("./pages/Contacts"));
const ContactDetail = lazy(() => import("./pages/ContactDetail"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientDetail = lazy(() => import("./pages/ClientDetail"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Offers = lazy(() => import("./pages/Offers"));
const OfferDetail = lazy(() => import("./pages/OfferDetail"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Notes = lazy(() => import("./pages/Notes"));
const NoteEditor = lazy(() => import("./pages/NoteEditor"));
const Settings = lazy(() => import("./pages/Settings"));
const IntegrationLog = lazy(() => import("./pages/IntegrationLog"));

const SuspenseFallback = () => (
  <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <Suspense fallback={<SuspenseFallback />}><SignIn /></Suspense>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/sign-up",
    element: <Suspense fallback={<SuspenseFallback />}><SignUp /></Suspense>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/forgot-password",
    element: <Suspense fallback={<SuspenseFallback />}><ForgotPassword /></Suspense>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/connect-ghl",
    element: <Suspense fallback={<SuspenseFallback />}><ConnectGhl /></Suspense>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/accept-invite",
    element: <Suspense fallback={<SuspenseFallback />}><AcceptInvite /></Suspense>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <AuthGuard />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Suspense fallback={<SuspenseFallback />}><Dashboard /></Suspense> },
          { path: "leads", element: <Suspense fallback={<SuspenseFallback />}><Leads /></Suspense> },
          { path: "leads/:leadId", element: <Suspense fallback={<SuspenseFallback />}><LeadDetail /></Suspense> },
          { path: "contacts", element: <Suspense fallback={<SuspenseFallback />}><Contacts /></Suspense> },
          { path: "contacts/:contactId", element: <Suspense fallback={<SuspenseFallback />}><ContactDetail /></Suspense> },
          { path: "clients", element: <Suspense fallback={<SuspenseFallback />}><Clients /></Suspense> },
          { path: "clients/:clientId", element: <Suspense fallback={<SuspenseFallback />}><ClientDetail /></Suspense> },
          { path: "properties", element: <Suspense fallback={<SuspenseFallback />}><Properties /></Suspense> },
          { path: "properties/:propertyId", element: <Suspense fallback={<SuspenseFallback />}><PropertyDetail /></Suspense> },
          { path: "offers", element: <Suspense fallback={<SuspenseFallback />}><Offers /></Suspense> },
          { path: "offers/:recordId", element: <Suspense fallback={<SuspenseFallback />}><OfferDetail /></Suspense> },
          { path: "calendar", element: <Suspense fallback={<SuspenseFallback />}><Calendar /></Suspense> },
          { path: "tasks", element: <Suspense fallback={<SuspenseFallback />}><Tasks /></Suspense> },
          { path: "notes", element: <Suspense fallback={<SuspenseFallback />}><Notes /></Suspense> },
          { path: "notes/new", element: <Suspense fallback={<SuspenseFallback />}><NoteEditor /></Suspense> },
          { path: "notes/:noteId", element: <Suspense fallback={<SuspenseFallback />}><NoteEditor /></Suspense> },
          { path: "settings", element: <Suspense fallback={<SuspenseFallback />}><Settings /></Suspense> },
          { path: "settings/integration/log", element: <Suspense fallback={<SuspenseFallback />}><IntegrationLog /></Suspense> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <RouterProvider router={router} />
  </TooltipProvider>
);

export default App;
