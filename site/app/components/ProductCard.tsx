import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/app/lib/products";
import { productImages } from "@/app/lib/products";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const image = productImages[product.route];
  return (
    <article className="product-card">
      <Link href={product.route} className="product-card__image" aria-label={`Read the fit verdict for ${product.name}`}>
        <Image src={image.src} alt={image.alt} width={760} height={520} unoptimized sizes="(max-width: 760px) 100vw, 33vw" />
        <span className="product-card__number" aria-hidden="true">0{index + 1}</span>
      </Link>
      <div className="product-card__body">
        <div className="card-meta"><span>{product.category}</span><span>{product.score.total}/100 editorial score</span></div>
        <h3><Link href={product.route}>{product.name}</Link></h3>
        <p>{product.problem}</p>
        <Link href={product.route} className="text-link">Check the fit <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
