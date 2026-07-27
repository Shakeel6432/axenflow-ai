export type DesktopTool = {
  id: string;
  name: string;
  description: string;
  platform: string;
  /** Public path or external URL. */
  downloadUrl: string;
};

export const DESKTOP_TOOLS: DesktopTool[] = [
  {
    id: "axenflowai-bbb-scraper-windows",
    name: "AxenFlow AI BBB Scraper",
    description:
      "Better Business Bureau (BBB) lead scraper for Windows. Search by keyword and US state, export CSV/Excel. Always use with a VPN. Download the RAR, unpack it, then run the app.",
    platform: "Windows",
    downloadUrl:
      "https://github.com/Shakeel6432/axenflow-ai/releases/download/scraper-windows/axenflowai-desktop-scraper-windows.rar",
  },
  {
    id: "axenflowai-yellow-pages-windows",
    name: "AxenFlow AI Yellow Pages Scraper",
    description:
      "Keyword + location Yellow Pages scraper for Windows. Always use with a VPN. Download the ZIP, unpack it, then run AxenFlowAI_YellowPages.exe.",
    platform: "Windows",
    downloadUrl:
      "https://github.com/Shakeel6432/axenflow-ai/releases/download/yellow-pages-windows/axenflowai-yellow-pages-windows.zip",
  },
];
