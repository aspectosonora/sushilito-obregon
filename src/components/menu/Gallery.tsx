import g1 from "@/assets/gallery-1.png";
import g2 from "@/assets/gallery-2.png";
import g3 from "@/assets/gallery-3.png";
import g4 from "@/assets/gallery-4.png";

const photos = [g1, g4, g2, g3];

export function Gallery() {
  return (
    <section aria-label="Galería" className="mx-auto max-w-3xl mt-5">
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2 snap-x snap-mandatory">
        {photos.map((url, i) => (
          <figure
            key={i}
            className="snap-start shrink-0 relative overflow-hidden rounded-2xl shadow-md w-64 h-56 sm:w-72 sm:h-60 bg-muted group ring-1 ring-black/5"
          >
            <img src={url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          </figure>
        ))}
      </div>
    </section>
  );
}
