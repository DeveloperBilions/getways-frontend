import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AdminContext } from "react-admin";
import CreateUserDialog from "../Views/User/dialog/CreateUserDialog";
const mockClose = jest.fn();
const mockFetchUsers = jest.fn();
describe("<CreateUserDialog />", () => {
  const setup = () =>
    render(
      <AdminContext>
        <CreateUserDialog
          open={true}
          onClose={mockClose}
          fetchAllUsers={mockFetchUsers}
        />
      </AdminContext>
    );
  //   it('renders the form and handles user input correctly', () => {
  //     setup();
  //     expect(screen.getByText('Add New user')).toBeInTheDocument();
  //     const userNameInput = screen.getByLabelText(/user name/i);
  //     fireEvent.change(userNameInput, { target: { value: 'testUser' } });
  //     expect(userNameInput.value).toBe('testUser');
  //     const confirmButton = screen.getByRole('button', { name: /confirm/i });
  //     fireEvent.click(confirmButton);

  //     expect(mockFetchUsers).not.toHaveBeenCalled(); // Assume no immediate fetch
  //   });
  //   it('handles modal close action', () => {
  //     setup();
  //     const cancelButton = screen.getByRole('button', { name: /cancel/i });
  //     fireEvent.click(cancelButton);
  //     expect(mockClose).toHaveBeenCalledTimes(1);
  //   });
  //   it('displays error when passwords do not match', async () => {
  //     setup();
  //     const passwordInput = screen.getByLabelText(/password/i);
  //     const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
  //     fireEvent.change(passwordInput, { target: { value: 'Password123' } });
  //     fireEvent.change(confirmPasswordInput, { target: { value: 'Mismatch123' } });
  //     const confirmButton = screen.getByRole('button', { name: /confirm/i });
  //     fireEvent.click(confirmButton);
  //     expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  //   });
  //   it('displays error if required fields are empty', async () => {
  //     setup();
  //     const confirmButton = screen.getByRole('button', { name: /confirm/i });
  //     fireEvent.click(confirmButton);
  //     expect(await screen.findByText(/User Name/i)).toBeInTheDocument();
  //     expect(screen.getByText(/Password must be at least 6 characters long./i)).toBeInTheDocument();
  //   });
  //   it('displays password visibility toggle functionality', () => {
  //     setup();
  //     const passwordInput = screen.getByLabelText(/password/i);
  //     const visibilityToggle = screen.getAllByRole('button')[0];
  //     fireEvent.change(passwordInput, { target: { value: 'Password123' } });
  //     fireEvent.click(visibilityToggle);
  //     expect(passwordInput.type).toBe('text');
  //   });
  it("creates a user with correct data and handles API response", async () => {
    setup();
    fireEvent.change(screen.getByLabelText(/user name/i), {
      target: { value: "testUser" },
    });
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test Name" },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    await waitFor(() => expect(mockFetchUsers).toHaveBeenCalledTimes(1));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
  //   it('disables parent selection for Agent user type', () => {
  //     setup();
  //     fireEvent.change(screen.getByLabelText(/user type/i), { target: { value: 'Agent' } });
  //     const parentTypeSelect = screen.getByLabelText(/parent type/i);
  //     expect(parentTypeSelect).toBeDisabled();
  //   });
});
