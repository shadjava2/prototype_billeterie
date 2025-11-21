"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkflowPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login-simule");
  }, [router]);

  return null;
}
