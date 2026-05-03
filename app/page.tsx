"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Wheel from "./components/Wheel";

const STORAGE_KEY = "what_to_eat_wheel_items_v1";

const DEFAULT_ITEMS = [
  "川菜",
  "湘菜",
  "粤菜",
  "淮扬菜",
  "鲁菜",
  "东北菜",
  "牛排",
  "巴西烤肉",
  "火锅",
  "日料",
  "韩式烤肉",
  "韩式炸鸡",
  "韩式豆腐汤",
  "泰餐",
  "越南粉(PHO)",
  "印度咖喱",
  "轻食沙拉",
  "披萨",
  "汉堡",
  "面馆",
  "烧烤",
];

function normalizeItem(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export default function Page() {

  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_ITEMS; // SSR 时返回默认值

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_ITEMS;
  });
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const mountedRef = useRef(false);


  useEffect(() => {
    mountedRef.current = true;
  }, []);

  // 删除读取 sessionStorage 的 useEffect（已移到 useState 初始化）

  // 组件挂载后才渲染 Wheel（避免 SSR/CSR 不一致）
  // 写入 sessionStorage
  useEffect(() => {
    if (!mountedRef.current) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const canSpin = items.length >= 2;

  const addItem = () => {
    const v = normalizeItem(input);
    if (!v) return;

    // 去重（不区分大小写）
    const exists = items.some((x) => x.toLowerCase() === v.toLowerCase());
    if (exists) {
      setInput("");
      return;
    }

    setItems((prev) => [...prev, v]);
    setInput("");
  };

  const removeItem = (name: string) => {
    setItems((prev) => prev.filter((x) => x !== name));
    setWinner((w) => (w === name ? null : w));
  };

  const reset = () => {
    setItems(DEFAULT_ITEMS);
    setWinner(null);
    setInput("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const subtitle = useMemo(() => {
    if (winner) return `恭喜你，今天就吃：${winner}`;
    return "用幸运大转盘决定今天吃什么";
  }, [winner]);

  return (
    <main className="page">
      <header className="header">
        <div className="titleWrap">
          <h1 className="title">今天吃什么</h1>
          <p className="subtitle">{subtitle}</p>
        </div>

        <div className="actions">
          <button className="btn ghost" onClick={reset} title="重置为默认选项并清空 sessionStorage">
            重置
          </button>
        </div>
      </header>

      <section className="grid">
        <div className="card wheelCard">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">幸运大转盘</div>
              <div className="cardDesc">
                {canSpin ? "点击 Spin 开始旋转" : "至少需要 2 个选项才能旋转"}
              </div>
            </div>
          </div>

          <Wheel
            items={items}
            disabled={!canSpin}
            onFinish={(name) => setWinner(name)}
          />
        </div>

        <div className="card listCard">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">备选列表</div>
              <div className="cardDesc">添加你的备选，刷新不会丢失（关闭页面才清空）</div>
            </div>
          </div>

          <div className="inputRow">
            <input
              className="input"
              placeholder="输入一个选项，例如：麻辣烫 / 砂锅…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
              }}
            />
            <button className="btn" onClick={addItem}>
              添加
            </button>
          </div>

          <div className="chips">
            {items.map((x) => (
              <div className="chip" key={x}>
                <span className="chipText">{x}</span>
                <button className="chipX" onClick={() => removeItem(x)} aria-label={`删除 ${x}`}>
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="hint">
            小提示：删除到只剩 1 个选项时将无法旋转；Reset 可恢复默认列表。
          </div>
        </div>
      </section>

      <footer className="footer">
        <span className="muted">这个页面小工具是来帮您作出选择的</span>
      </footer>
    </main>
  );
}
