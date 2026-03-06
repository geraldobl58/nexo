"use client";

import {
  forwardRef,
  type ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Slider from "react-slick";
import type { Settings } from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselHandle = {
  prev: () => void;
  next: () => void;
};

export type CarouselProps = {
  items: ReactNode[];
  dots?: boolean;
  arrows?: boolean;
  infinite?: boolean;
  autoPlay?: boolean;
  autoPlaySpeed?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
  adaptiveHeight?: boolean;
  gap?: "none" | "sm" | "md" | "lg";
  className?: string;
};

const gapClasses = {
  none: "",
  sm: "px-1",
  md: "px-2",
  lg: "px-4",
} as const;

export const Carousel = forwardRef<CarouselHandle, CarouselProps>(
  (
    {
      items,
      dots = true,
      arrows = true,
      infinite = true,
      autoPlay = false,
      autoPlaySpeed = 3000,
      slidesToShow = 3,
      slidesToScroll = 1,
      adaptiveHeight = false,
      gap = "md",
      className,
    },
    ref,
  ) => {
    const sliderRef = useRef<Slider>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const isFirst = !infinite && currentSlide === 0;
    const isLast = !infinite && currentSlide >= items.length - slidesToShow;

    useImperativeHandle(ref, () => ({
      prev: () => sliderRef.current?.slickPrev(),
      next: () => sliderRef.current?.slickNext(),
    }));

    const settings: Settings = {
      dots,
      arrows: false,
      infinite,
      autoplay: autoPlay,
      autoplaySpeed: autoPlaySpeed,
      slidesToShow,
      slidesToScroll,
      adaptiveHeight,
      beforeChange: (_, next) => setCurrentSlide(next),
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(slidesToShow, 2),
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    };

    const wrapperClass = ["nexo-slider", className].filter(Boolean).join(" ");

    const navButtonClass = (disabled: boolean) =>
      [
        "flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white transition-all",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "hover:bg-primary/90 cursor-pointer",
      ].join(" ");

    return (
      <div className={wrapperClass} data-testid="carousel">
        {arrows && (
          <div
            className="flex justify-end gap-2 mb-4"
            data-testid="carousel-nav"
          >
            <button
              onClick={() => !isFirst && sliderRef.current?.slickPrev()}
              aria-label="Anterior"
              disabled={isFirst}
              className={navButtonClass(isFirst)}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => !isLast && sliderRef.current?.slickNext()}
              aria-label="Próximo"
              disabled={isLast}
              className={navButtonClass(isLast)}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
        <Slider ref={sliderRef} {...settings}>
          {items.map((item, index) => (
            <div key={index} className={gapClasses[gap]}>
              {item}
            </div>
          ))}
        </Slider>
      </div>
    );
  },
);

Carousel.displayName = "Carousel";
