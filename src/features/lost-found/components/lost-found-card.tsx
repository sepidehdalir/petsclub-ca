import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import type { DemoLostFoundReport } from "@/features/lost-found/fixtures";
import { formatRelativeDays } from "@/lib/utils/format";

export interface LostFoundCardProps {
  report: DemoLostFoundReport;
  headingLevel?: "h3" | "h4";
}

/**
 * Card for a Lost & Found report.
 *
 * Non-interactive by design. The reports rendered today are samples, and a
 * card that behaved like a real listing — clickable, with contact details —
 * could send someone looking for an animal that does not exist.
 */
export function LostFoundCard({ report, headingLevel: Heading = "h3" }: LostFoundCardProps) {
  const isLost = report.status === "lost";

  return (
    <Card className="flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isLost ? "accent" : "brand"}>{isLost ? "Lost" : "Found"}</Badge>
          <Badge variant="outline">{report.species}</Badge>
        </div>

        <Heading className="font-sans text-base font-semibold leading-snug text-foreground">
          {report.descriptor}
        </Heading>

        <p className="mt-auto text-sm text-foreground-muted">
          {report.city}, {report.province} &middot; {formatRelativeDays(report.reportedDaysAgo)}
        </p>
      </CardBody>
    </Card>
  );
}
