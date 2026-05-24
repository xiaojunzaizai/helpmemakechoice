"use client";

import {
  App as MyApp,
  Button,
  Card,
  ConfigProvider,
  Flex,
  Input,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useState } from "react";
import Wheel from "./components/Wheel";

const { Text, Title } = Typography;

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
  "美式炸鸡",
];

function normalizeItem(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export default function Page() {

  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    window.queueMicrotask(() => {
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            Array.isArray(parsed) &&
            parsed.every((x) => typeof x === "string")
          ) {
            setItems(parsed);
          }
        }
      } catch {
        // ignore
      } finally {
        setStorageReady(true);
      }
    });
  }, []);

  // 删除读取 sessionStorage 的 useEffect（已移到 useState 初始化）

  // 组件挂载后才渲染 Wheel（避免 SSR/CSR 不一致）
  // 写入 sessionStorage
  useEffect(() => {

    if (!storageReady) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, storageReady]);

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
    if (winner) return `就决定是你了！！！！！今天就吃：${winner}`;
    return "用幸运大转盘决定今天吃什么";
  }, [winner]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 8,
          colorPrimary: "#1677ff",
          colorInfo: "#1677ff",
          fontFamily:
            "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        },
        components: {
          Card: {
            headerBg: "transparent",
          },
        },
      }}
    >
      <MyApp>
        <main className="page">
          <header className="header">
            <div className="titleWrap">
              <Title className="title" level={1}>
                今天吃什么
              </Title>
              <Text className="subtitle">{subtitle}</Text>
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={reset}
              title="重置为默认选项并清空 sessionStorage"
            >
              重置
            </Button>
          </header>

          <section className="grid">
            <Card
              className="panel wheelCard"
              title="幸运大转盘"
              extra={
                <Tag color={canSpin ? "processing" : "warning"}>
                  {items.length} 个选项
                </Tag>
              }
            >
              <Text className="cardDesc" type="secondary">
                {canSpin ? "点击 Spin 开始旋转" : "至少需要 2 个选项才能旋转"}
              </Text>

              <Wheel
                items={items}
                disabled={!canSpin}
                onFinish={(name) => setWinner(name)}
              />
            </Card>

            <Card className="panel listCard" title="备选列表">
              <Space className="listContent" orientation="vertical" size={16}>
                <Text className="cardDesc" type="secondary">
                  添加你的备选，刷新不会丢失（关闭页面才清空）
                </Text>
                <Flex className="inputRow" gap={8}>
                  <Input
                    allowClear
                    placeholder="输入一个选项，例如：麻辣烫 / 砂锅 / 泰餐"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onPressEnter={addItem}
                  />
                  <Button type="primary" icon={<PlusOutlined />} onClick={addItem}>
                    添加
                  </Button>
                </Flex>

                <div className="chips">
                  {items.map((x) => (
                    <Tag
                      className="choiceTag"
                      key={x}
                      closable
                      onClose={(event) => {
                        event.preventDefault();
                        removeItem(x);
                      }}
                    >
                      {x}
                    </Tag>
                  ))}
                </div>

                <Text className="hint" type="secondary">
                  小提示：删除到只剩 1 个选项时将无法旋转；重置可恢复默认列表。
                </Text>
              </Space>
            </Card>
          </section>

          <footer className="footer">
            <Text className="muted" type="secondary">
              这个页面小工具是来帮您作出选择的
            </Text>
          </footer>
        </main>
      </MyApp>
    </ConfigProvider>
  );
}
