import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders browse recipes heading", () => {
  render(<App />);
  const heading = screen.getByText(/browse recipes/i);
  expect(heading).toBeInTheDocument();
});
