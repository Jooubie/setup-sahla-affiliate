import type { Metadata } from "next";
import { GuideArticle } from "@/app/components/GuideArticle";
import { getGuide } from "@/app/lib/guides";
import { routeMetadata } from "@/app/lib/site";

const route = "/guides/usb-c-hub-buying-guide-egypt/";
const guide = getGuide(route);
export const metadata: Metadata = routeMetadata(guide.title, guide.description, route);
export default function Page() { return <GuideArticle route={route} />; }
