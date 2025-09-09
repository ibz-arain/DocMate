"use client";

import { CustomSidebar } from "@/components/custom-sidebar";
import { HistorySection } from "@/components/document/history-section";
import { useAuthContext } from "@/components/auth-provider";
import Head from "next/head";

export default function HistoryPage() {
  const { user } = useAuthContext();

  return (
    <>
      <Head>
        <title>Document History | Docimate</title>
        <meta name="description" content="View and manage your document history" />
      </Head>
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar
          selectedType="history"
        />
        <HistorySection user={user} />
      </div>
    </>
  );
} 