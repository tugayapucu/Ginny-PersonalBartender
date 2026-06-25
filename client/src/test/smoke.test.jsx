import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";

// Hoist mocks before any component imports
vi.mock("../hooks/useAuth", () => ({ default: vi.fn() }));
vi.mock("../hooks/useFavorites", () => ({ default: vi.fn() }));
vi.mock("../api", () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  fetchCocktails: vi.fn(),
  searchCocktails: vi.fn(),
  getRandomCocktail: vi.fn(),
  getMeRequest: vi.fn(),
  updateMeRequest: vi.fn(),
  changePasswordRequest: vi.fn(),
  updatePreferencesRequest: vi.fn(),
  deleteAccountRequest: vi.fn(),
  disableAccountRequest: vi.fn(),
  getPantryRequest: vi.fn(),
  addPantryItemRequest: vi.fn(),
  removePantryItemRequest: vi.fn(),
}));

import useAuth from "../hooks/useAuth";
import useFavorites from "../hooks/useFavorites";
import { fetchCocktails, getMeRequest, getPantryRequest } from "../api";

import Navbar from "../components/Navbar";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import CocktailList from "../components/CocktailList";
import Settings from "../pages/Settings";
import Pantry from "../pages/Pantry";

// Default unauthenticated state — individual tests override as needed
beforeEach(() => {
  useAuth.mockReturnValue({
    authStatus: "unauthenticated",
    isAuthenticated: false,
    authError: "",
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
  });
  useFavorites.mockReturnValue({
    favorites: [],
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  });
  fetchCocktails.mockResolvedValue({ data: { items: [], page: 1, page_size: 100, total: 0 } });
  // No theme in response — keeps handleThemeChange from touching window.matchMedia
  getMeRequest.mockResolvedValue({ data: { username: "", email: "" } });
});

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------
describe("Navbar", () => {
  it("renders Ginny brand name", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText(/ginny/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
describe("Login page", () => {
  it("renders email and password fields", () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    // type="email" has implicit role textbox
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    // type="password" has no ARIA role — query by attribute
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
describe("Register page", () => {
  it("renders username, email, and password fields", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ProtectedRoute
// ---------------------------------------------------------------------------
describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to /login", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CocktailList
// ---------------------------------------------------------------------------
describe("CocktailList", () => {
  it("renders mocked cocktail cards after data loads", async () => {
    fetchCocktails.mockResolvedValue({
      data: {
        items: [
          { id: 1, name: "Margarita", category: "Classic", thumb_url: null },
          { id: 2, name: "Mojito", category: "Classic", thumb_url: null },
        ],
        page: 1,
        page_size: 100,
        total: 2,
      },
    });
    render(
      <MemoryRouter>
        <CocktailList />
      </MemoryRouter>
    );
    // fetchCocktails fires after a 400 ms debounce — waitFor handles the delay
    await waitFor(() => {
      expect(screen.getByText("Margarita")).toBeInTheDocument();
      expect(screen.getByText("Mojito")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Pantry
// ---------------------------------------------------------------------------
describe("Pantry page", () => {
  it("renders heading, add form, and empty state when pantry is empty", async () => {
    useAuth.mockReturnValue({
      authStatus: "authenticated",
      isAuthenticated: true,
      authError: "",
      token: "fake-token",
      login: vi.fn(),
      logout: vi.fn(),
    });
    getPantryRequest.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Pantry />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /my pantry/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/ingredient/i)).toBeInTheDocument();
    expect(screen.getByTestId("pantry-add-btn")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("pantry-empty")).toBeInTheDocument();
    });
  });

  it("renders saved pantry items after load", async () => {
    useAuth.mockReturnValue({
      authStatus: "authenticated",
      isAuthenticated: true,
      authError: "",
      token: "fake-token",
      login: vi.fn(),
      logout: vi.fn(),
    });
    getPantryRequest.mockResolvedValue({
      data: [
        { id: 1, ingredient_name: "Tequila", ingredient_key: "tequila", ingredient_id: 1 },
        { id: 2, ingredient_name: "Lime Juice", ingredient_key: "lime juice", ingredient_id: 2 },
      ],
    });

    render(
      <MemoryRouter>
        <Pantry />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("pantry-list")).toBeInTheDocument();
      expect(screen.getAllByTestId("pantry-item")).toHaveLength(2);
    });

    expect(screen.getByText("Tequila")).toBeInTheDocument();
    expect(screen.getByText("Lime Juice")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
describe("Settings page", () => {
  it("renders profile, password, and theme sections when authenticated", async () => {
    useAuth.mockReturnValue({
      authStatus: "authenticated",
      isAuthenticated: true,
      authError: "",
      token: "fake-token",
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    // Section headings are static JSX — no need to wait
    expect(screen.getByRole("heading", { name: "Profile Information" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Change Password" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Appearance" })).toBeInTheDocument();
    // Let async effects (getMeRequest) flush before cleanup
    await waitFor(() => {});
  });
});
