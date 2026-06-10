import { Property } from "@/types";
import { money } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, MapPin, Hash } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PropertyHeroCarouselProps {
  property: Property;
}

export function PropertyHeroCarousel({ property }: PropertyHeroCarouselProps) {
  const images = property.images?.length ? property.images : [""];

  return (
    <div className="relative w-full h-[35vh] min-h-[250px] max-h-[400px] bg-muted">
      <Carousel className="w-full h-full">
        <CarouselContent className="h-full">
          {images.map((src, index) => (
            <CarouselItem key={index} className="h-full">
              {src ? (
                <img 
                  src={src} 
                  alt={`${property.address} - Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full image-placeholder">No Images Available</div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white pointer-events-none">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                {property.status}
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {property.mls}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 [text-shadow:_0_1px_3px_rgba(0,0,0,0.3)]">
              {money(property.price)}
            </h1>
            <div className="flex items-center gap-1.5 text-white/90 text-sm md:text-base [text-shadow:_0_1px_2px_rgba(0,0,0,0.3)]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{property.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm md:text-base font-medium bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
            {property.beds !== undefined && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-white/70" />
                <span>{property.beds}</span>
              </div>
            )}
            {property.baths !== undefined && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-white/70" />
                <span>{property.baths}</span>
              </div>
            )}
            {property.sqft !== undefined && (
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4 text-white/70" />
                <span>{property.sqft}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
