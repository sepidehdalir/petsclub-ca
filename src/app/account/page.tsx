import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Container, Section, SectionHeading } from "@/components/ui/layout-primitives";
import { ErrorState } from "@/components/ui/states";
import { isSupabaseConfigured } from "@/lib/env/public";
import { createMetadata } from "@/lib/seo/metadata";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = createMetadata({
  title: "Your account",
  description: "Your Pet Club account.",
  path: "/account",
  noIndex: true,
});

// The session is per-request, so this route is always rendered on demand.
export const dynamic = "force-dynamic";

/**
 * Protected account page.
 *
 * This is where server-side authentication is actually enforced. `getUser()`
 * revalidates the token with the Auth server rather than trusting the cookie,
 * and the profile read below goes through the anon key, so Row Level Security
 * decides what comes back — the server has no elevated access here.
 */
export default async function AccountPage() {
  if (!isSupabaseConfigured) {
    return (
      <Section>
        <Container width="prose">
          <ErrorState
            title="Accounts are not enabled on this deployment"
            description="Supabase credentials are not configured, so there is no account to show. See the README for the environment variables required."
            action={<ButtonLink href="/">Back to the homepage</ButtonLink>}
          />
        </Container>
      </Section>
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/account");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, bio, province, city, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title={profile?.display_name ?? "Your account"}
        description="Your Pet Club membership. Profile editing, pet profiles and notification settings arrive with a later milestone."
        breadcrumbs={[{ name: "Account", path: "/account" }]}
      />

      <Section aria-labelledby="account-profile-heading">
        <Container width="prose">
          <SectionHeading id="account-profile-heading" title="Profile" />

          {error ? (
            <ErrorState
              className="mt-6"
              title="We could not load your profile"
              description="Your account is fine — we just could not read the profile record. Try refreshing the page."
            />
          ) : profile ? (
            <Card className="mt-6">
              <CardBody className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar name={profile.display_name} src={profile.avatar_url} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-foreground">
                      {profile.display_name}
                    </p>
                    <p className="truncate text-sm text-foreground-muted">
                      @{profile.username}
                    </p>
                  </div>
                </div>

                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Email
                    </dt>
                    <dd className="mt-1 truncate text-sm text-foreground">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Member since
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {formatDate(profile.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Role
                    </dt>
                    <dd className="mt-1">
                      <Badge variant="brand">{profile.role}</Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {[profile.city, profile.province].filter(Boolean).join(", ") ||
                        "Not set"}
                    </dd>
                  </div>
                </dl>

                {profile.bio ? (
                  <div>
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Bio
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">{profile.bio}</p>
                  </div>
                ) : null}
              </CardBody>
            </Card>
          ) : (
            <ErrorState
              className="mt-6"
              title="No profile record found"
              description="Your profile is normally created automatically when you register. If you are seeing this, the database trigger may not have been applied — check that all migrations have run."
            />
          )}

          <form action="/auth/sign-out" method="post" className="mt-8">
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </Container>
      </Section>
    </>
  );
}
