import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Page from "../app/page";

const STORAGE_KEY = "what_to_eat_wheel_items_v1";

describe("Page", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders the default choice wheel experience", async () => {
    render(<Page />);

    expect(screen.getByRole("heading", { name: "今天吃什么" })).toBeInTheDocument();
    expect(screen.getByText("用幸运大转盘决定今天吃什么")).toBeInTheDocument();
    expect(screen.getByText("幸运大转盘")).toBeInTheDocument();
    expect(screen.getByText("备选列表")).toBeInTheDocument();

    await waitFor(() => {
      expect(sessionStorage.getItem(STORAGE_KEY)).toContain("川菜");
    });
  });

  it("adds a normalized item and stores it", async () => {
    render(<Page />);

    fireEvent.change(screen.getByPlaceholderText("输入一个选项，例如：麻辣烫 / 砂锅 / 泰餐"), {
      target: { value: "  麻辣   烫  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /添加/ }));

    expect(screen.getByText("麻辣 烫")).toBeInTheDocument();

    await waitFor(() => {
      expect(sessionStorage.getItem(STORAGE_KEY)).toContain("麻辣 烫");
    });
  });

  it("does not add duplicated items and clears the input", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(sessionStorage.getItem(STORAGE_KEY)).toContain("川菜");
    });

    const input = screen.getByPlaceholderText("输入一个选项，例如：麻辣烫 / 砂锅 / 泰餐");
    fireEvent.change(input, { target: { value: "川菜" } });
    fireEvent.click(screen.getByRole("button", { name: /添加/ }));

    expect(screen.getAllByText("川菜")).toHaveLength(1);
    expect(input).toHaveValue("");
  });

  it("loads saved items, removes an item, and disables spinning with one item left", async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(["火锅", "烧烤"]));

    const { container } = render(<Page />);

    expect(await screen.findByText("火锅")).toBeInTheDocument();
    expect(screen.getByText("烧烤")).toBeInTheDocument();

    const closeButtons = container.querySelectorAll(".ant-tag-close-icon");
    fireEvent.click(closeButtons[0]);

    expect(screen.queryByText("火锅")).not.toBeInTheDocument();
    expect(screen.getByText("至少需要 2 个选项才能旋转")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Spin/ })).toBeDisabled();
  });

  it("resets the list and stores the default list", async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(["砂锅", "泰餐"]));

    render(<Page />);

    expect(await screen.findByText("砂锅")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /重置/ }));

    expect(screen.queryByText("砂锅")).not.toBeInTheDocument();
    expect(screen.getByText("川菜")).toBeInTheDocument();
    await waitFor(() => {
      expect(sessionStorage.getItem(STORAGE_KEY)).toContain("川菜");
    });
  });

  it("updates the subtitle when the wheel finishes", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(sessionStorage.getItem(STORAGE_KEY)).toContain("川菜");
    });

    const wheelStage = document.querySelector(".wheelStage");
    expect(wheelStage).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Spin/ }));
    fireEvent.transitionEnd(wheelStage as Element);

    expect(screen.getByText(/就决定是你了！！！！！今天就吃：/)).toBeInTheDocument();
  });
});
