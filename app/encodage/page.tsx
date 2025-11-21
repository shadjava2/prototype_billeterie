"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EncodagePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login-simule");
  }, [router]);

  return null;
}
