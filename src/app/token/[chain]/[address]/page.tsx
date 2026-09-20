import { TokenDetail } from "@/components/TokenDetail";

export default async function TokenPage({
  params,
}: {
  params: Promise<{ chain: string; address: string }>;
}) {
  const { chain, address } = await params;
  return (
    <main className="min-h-dvh">
      <TokenDetail chain={chain} address={address} />
    </main>
  );
}
