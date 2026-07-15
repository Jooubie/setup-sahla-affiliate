import type { Metadata } from "next";
import { ProductDetail } from "@/app/components/ProductDetail";
import { getProduct } from "@/app/lib/products";
import { routeMetadata } from "@/app/lib/site";

const route = "/products/desk-cable-management/";
const product = getProduct(route);
export const metadata: Metadata = routeMetadata("JOYROOM JR-ZS368 cable organizer fit check", `Cable diameter, surface cautions, evidence and Egypt provider snapshots for ${product.name}.`, route);
export default function Page() { return <ProductDetail route={route} />; }
