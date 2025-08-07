import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductImageCarouselProps } from "../types";
import Image from "next/image";

export default function ProductImageCarousel({ images, title }: ProductImageCarouselProps) {
  return (
    <Carousel className="mb-6 rounded-2xl overflow-hidden shadow-lg">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
              <Image
                src={image}
                alt={`${title} - Image ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm border-none text-white" />
      <CarouselNext className="right-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm border-none text-white" />
    </Carousel>
  );
} 