import type { Metadata } from "next";
import { GuideArticle } from "@/app/components/GuideArticle";
import { getGuide } from "@/app/lib/guides";
import { routeMetadata } from "@/app/lib/site";

const route = "/guides/laptop-heat-screen-height-cable-management/";
const guide = getGuide(route);
export const metadata: Metadata = routeMetadata(guide.title, guide.description, route);
export default function Page() { return <GuideArticle route={route} />; }
