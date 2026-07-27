type BlogFigureProps = {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function BlogFigure({
  src,
  alt,
  caption,
  width = 1200,
  height = 675,
  priority = false,
}: BlogFigureProps) {
  return (
    <figure className="blog-figure my-8">
      {/* Native img: reliable for static public assets (PNG) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full rounded-2xl"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      {caption ? <figcaption className="blog-caption">{caption}</figcaption> : null}
    </figure>
  );
}
