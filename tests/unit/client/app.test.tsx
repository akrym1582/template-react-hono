// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "@client/App.js";
import { useUsers } from "@client/hooks/use-users.js";

vi.mock("@client/hooks/use-auth.js", () => ({
  useAuth: vi.fn().mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    loginWithPassword: vi.fn(),
    loginWithMsal: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("@client/hooks/use-users.js", () => ({
  useUsers: vi.fn().mockReturnValue({
    data: [
      {
        id: "1",
        name: "Ada Lovelace",
        email: "ada@example.com",
      },
    ],
    isLoading: false,
  }),
}));

const mockedUseUsers = vi.mocked(useUsers);

describe("AppRoutes", () => {
  it("renders the welcome page on the index route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
  });

  it("renders the dashboard page on the dashboard route", () => {
    mockedUseUsers.mockReturnValue({
      data: [
        {
          id: "1",
          name: "Ada Lovelace",
          email: "ada@example.com",
        },
      ],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUsers>);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("renders a fallback message when the dashboard query fails", () => {
    mockedUseUsers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useUsers>);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText("Unable to load users.")).toBeInTheDocument();
  });
});
