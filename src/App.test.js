import React from "react";
import { render, screen } from "@testing-library/react";
import { AdminContext } from "react-admin";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders User Management for Super-User role", async () => {
  const mockAuthProvider = {
    getPermissions: jest.fn().mockResolvedValue("Super-User"),
  };
  render(
    <AdminContext authProvider={mockAuthProvider}>
      <MemoryRouter initialEntries={["/users"]}>
        <App />
      </MemoryRouter>
    </AdminContext>
  );
  const dashboardText = await screen.findByText(/User Management/i);
  expect(dashboardText).toBeInTheDocument();
});
