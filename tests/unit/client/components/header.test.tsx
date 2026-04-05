// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../../../../webapp/client/components/layout/header.js";

vi.mock("../../../../webapp/client/hooks/use-auth.js", () => ({
  useAuth: vi.fn().mockReturnValue({
    isAuthenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("Header", () => {
  it("renders the app title", () => {
    render(<Header />);
    expect(screen.getByText("Template React Hono")).toBeInTheDocument();
  });

  it("shows Login button when not authenticated", () => {
    render(<Header />);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
