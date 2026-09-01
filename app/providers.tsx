"use client";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App as AntApp } from "antd";

// Studio workbench theme — graphite + indigo, Plus Jakarta Sans UI, filled
// controls. The paper preview is the hero; the chrome is calm and tinted.
const theme = {
  token: {
    colorPrimary: "#4f46e5",
    colorInfo: "#4f46e5",
    colorTextBase: "#17181c",
    colorBgLayout: "#e6e7ea",
    colorBorder: "#e7e7ea",
    colorBorderSecondary: "#eeeef0",
    borderRadius: 10,
    fontFamily: "var(--font-ui)",
    fontSize: 14,
    controlHeight: 38,
  },
  components: {
    Layout: { headerBg: "#ffffff", headerHeight: 60 },
    Segmented: {
      itemSelectedBg: "#ffffff",
      itemSelectedColor: "#17181c",
      trackBg: "#eeeef1",
      borderRadius: 10,
      trackPadding: 3,
    },
    Button: { fontWeight: 600, primaryShadow: "none" },
    Input: { activeShadow: "0 0 0 3px rgba(79,70,229,0.12)" },
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme} variant="filled">
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
