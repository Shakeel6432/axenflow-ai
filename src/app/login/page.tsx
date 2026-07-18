import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

/** Legacy /login → /signin */
export default async function LoginRedirectPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  const qs = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
  redirect(`/signin${qs}`);
}
