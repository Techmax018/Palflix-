export const dynamic = "force-dynamic";

import { LiveHub } from "@/components/live-hub";
import { query } from "@/lib/db";

export default async function LivePage() {
  const streams = await query(
    `SELECT s.*, p.username, p.display_name, p.avatar_url, p.is_verified
     FROM live_streams s
     JOIN profiles p ON p.id = s.user_id
     WHERE s.status IN ('live', 'scheduled')
     ORDER BY s.status ASC, s.viewer_count DESC
     LIMIT 20`
  ).catch(() => []);

  return <LiveHub streams={streams} />;
}
