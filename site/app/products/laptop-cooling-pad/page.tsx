import type { Metadata } from "next";
import { ProductDetail } from "@/app/components/ProductDetail";
import { getProduct } from "@/app/lib/products";
import { routeMetadata } from "@/app/lib/site";

const route = "/products/laptop-cooling-pad/";
const product = getProduct(route);
export const metadata: Metadata = routeMetadata("Havit F2069 cooling pad fit check", `Compatibility, evidence and Egypt provider snapshots for ${product.name}, without temperature or performance promises.`, route);
export default function Page() { return <ProductDetail route={route} />; }
