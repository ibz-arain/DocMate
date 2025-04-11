"use client";

import { CustomSidebar } from "@/components/custom-sidebar";
import { APIPlayground } from "@/components/api-playground";
import Head from "next/head";

export default function APIPage() {
  return (
    <>
      <Head>
        <title>API Integration | DocMate</title>
        <meta name="description" content="Create and manage custom API endpoints for document processing" />
      </Head>
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar
          selectedType="api"
        />
        <div className="flex-1 overflow-auto p-6">
          <APIPlayground />
        </div>
      </div>
    </>
  );
} 