import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import type { PlannedGuide } from "@/features/editorial/fixtures";

export interface GuideCardProps {
  guide: PlannedGuide;
  headingLevel?: "h3" | "h4";
}

/**
 * Card for a planned editorial guide.
 *
 * Deliberately **not** a link: the article does not exist yet, and a card that
 * navigates to a placeholder or a 404 would be worse than one that plainly
 * says the guide is in progress.
 */
export function GuideCard({ guide, headingLevel: Heading = "h3" }: GuideCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{guide.topic}</Badge>
          <Badge variant="accent">In progress</Badge>
        </div>

        <Heading className="font-sans text-lg font-semibold leading-snug text-foreground">
          {guide.title}
        </Heading>

        <p className="text-sm leading-relaxed text-foreground-muted">{guide.summary}</p>
      </CardBody>
    </Card>
  );
}
