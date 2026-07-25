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
    id: "axenflowai-desktop-scraper-windows",
    name: "AxenFlow AI Desktop Scraper",
    description:
      "Fresh-lead Windows scraper from AxenFlow AI. Always use this tool with a VPN. Download the RAR, unpack it, then run the app.",
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
