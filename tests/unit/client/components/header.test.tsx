// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "../../../../webapp/client/components/layout/header.js";

vi.mock("../../../../webapp/client/hooks/use-auth.js", () => ({
  useAuth: vi.fn().mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    loginWithPassword: vi.fn(),
    loginWithMsal: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("Header", () => {
  it("renders the app title", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText("Template React Hono")).toBeInTheDocument();
  });

  it("shows Login button when not authenticated", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
