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
    downloadUrl: "/downloads/axenflowai-desktop-scraper-windows.rar",
  },
];
