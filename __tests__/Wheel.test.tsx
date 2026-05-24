import { fireEvent, render, screen } from "@testing-library/react";
import Wheel from "../app/components/Wheel";

describe("Wheel", () => {
  it("does not spin when disabled", () => {
    const onFinish = jest.fn();

    render(<Wheel items={["火锅", "烧烤"]} disabled onFinish={onFinish} />);

    fireEvent.click(screen.getByRole("button", { name: /Spin/ }));

    expect(screen.getByRole("button", { name: /Spin/ })).toBeDisabled();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("spins and reports the winner after transition ends", () => {
    const onFinish = jest.fn();
    jest.spyOn(Math, "random").mockReturnValue(0);

    const { container } = render(<Wheel items={["火锅", "烧烤"]} onFinish={onFinish} />);

    fireEvent.click(screen.getByRole("button", { name: /Spin/ }));
    fireEvent.transitionEnd(container.querySelector(".wheelStage") as Element);

    expect(onFinish).toHaveBeenCalledWith("火锅");

    jest.restoreAllMocks();
  });
});
