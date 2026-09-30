import { Suspense } from "react";
import ResetPasswordClient from "./reset-client";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}