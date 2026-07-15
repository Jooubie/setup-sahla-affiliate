import type { Metadata } from "next";
import { ProductDetail } from "@/app/components/ProductDetail";
import { getProduct } from "@/app/lib/products";
import { routeMetadata } from "@/app/lib/site";

const route = "/products/ergonomic-mouse/";
const product = getProduct(route);
export const metadata: Metadata = routeMetadata("Logitech M650 mouse fit check", `Hand-size, shape, variant evidence and Egypt provider snapshots for ${product.name}; it is not a vertical mouse.`, route);
export default function Page() { return <ProductDetail route={route} />; }
