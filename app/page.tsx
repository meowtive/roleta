import { redirect } from "next/navigation";
import { getRemainingGifts, resetGifts } from "./actions";
import { PartyScreen } from "@/components/party-screen";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const resetValue = params.reset;
  const reset = Array.isArray(resetValue) ? resetValue[0] : resetValue;

  if (reset && process.env.RESET_SECRET) {
    const result = await resetGifts(reset);

    if (result.ok) {
      redirect("/");
    }
  }

  const state = await getRemainingGifts();

  return <PartyScreen initial={state} />;
}
