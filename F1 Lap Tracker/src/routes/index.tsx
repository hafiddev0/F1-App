import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/f1/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenF1 Engineering Dashboard" },
      {
        name: "description",
        content:
          "Live Formula 1 timing, telemetry and race control data powered by the OpenF1 API.",
      },
      { property: "og:title", content: "OpenF1 Engineering Dashboard" },
      {
        property: "og:description",
        content:
          "Live Formula 1 timing, telemetry and race control data powered by the OpenF1 API.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Dashboard />;
}
