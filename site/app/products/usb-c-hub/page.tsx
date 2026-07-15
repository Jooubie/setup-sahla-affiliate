import type { Metadata } from "next";
import { ProductDetail } from "@/app/components/ProductDetail";
import { getProduct } from "@/app/lib/products";
import { routeMetadata } from "@/app/lib/site";

const route = "/products/usb-c-hub/";
const product = getProduct(route);
export const metadata: Metadata = routeMetadata("Anker 332 USB-C Hub fit check", `Compatibility, evidence and Egypt provider snapshots for ${product.name}.`, route);
export default function Page() { return <ProductDetail route={route} />; }
