import type { Metadata } from "next";
import { ProductDetail } from "@/app/components/ProductDetail";
import { getProduct } from "@/app/lib/products";
import { routeMetadata } from "@/app/lib/site";

const route = "/products/laptop-stand/";
const product = getProduct(route);
export const metadata: Metadata = routeMetadata("UGREEN 40289 laptop stand fit check", `Compatibility, evidence and Egypt provider snapshots for ${product.name}.`, route);
export default function Page() { return <ProductDetail route={route} />; }
