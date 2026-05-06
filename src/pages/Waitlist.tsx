import { Navigate, useSearchParams } from "react-router-dom";

/**
 * Legacy /waitlist route — redirects to /betalist preserving query params.
 */
export default function WaitlistPage() {
  const [params] = useSearchParams();
  const qs = params.toString();
  return <Navigate to={`/betalist${qs ? `?${qs}` : ""}`} replace />;
}
