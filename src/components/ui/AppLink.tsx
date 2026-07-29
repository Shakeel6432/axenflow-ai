import NextLink from "next/link";
import type { ComponentProps } from "react";

type AppLinkProps = ComponentProps<typeof NextLink>;

/**
 * Site-wide Link: prefetch off by default so the Network tab only loads
 * the current page — not every nav/footer route in the background.
 * Pass prefetch={true} only where intentional.
 */
export function Link({ prefetch = false, ...props }: AppLinkProps) {
  return <NextLink prefetch={prefetch} {...props} />;
}

export default Link;
