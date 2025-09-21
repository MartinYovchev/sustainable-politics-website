import React, { useState, useEffect, useRef } from 'react';

interface CarouselProps {
  children: React.ReactNode[];
  autoSlideDelay?: number;
  enableTouch?: boolean;
  equalizeHeights?: boolean;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  autoSlideDelay = 7000,
  enableTouch = true,
  equalizeHeights = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto slide functionality
  useEffect(() => {
    const startAutoSlide = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (!isPaused && children.length > 1) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex(prevIndex =>
            prevIndex === children.length - 1 ? 0 : prevIndex + 1
          );
        }, autoSlideDelay);
      }
    };

    startAutoSlide();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, children.length, autoSlideDelay]); // Removed currentIndex dependency to prevent restart on every slide

  // Touch/swipe support
  useEffect(() => {
    if (!enableTouch || !carouselRef.current) return;

    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
      isDragging = true;
      setIsPaused(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const currentX = e.changedTouches[0].clientX;
      const currentY = e.changedTouches[0].clientY;
      const diffX = Math.abs(currentX - touchStartX);
      const diffY = Math.abs(currentY - touchStartY);

      // If horizontal swipe is more significant than vertical, prevent default
      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;

      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      handleSwipe();
      isDragging = false;
      setIsPaused(false);
    };

    const handleSwipe = () => {
      const minSwipeDistance = 80;
      const swipeDistanceX = touchStartX - touchEndX;
      const swipeDistanceY = Math.abs(touchStartY - touchEndY);

      // Only register horizontal swipes (prevent accidental swipes during vertical scroll)
      if (Math.abs(swipeDistanceX) > minSwipeDistance && swipeDistanceY < 100) {
        if (swipeDistanceX > 0) {
          // Swiped left, go to next slide
          setCurrentIndex(prev => prev === children.length - 1 ? 0 : prev + 1);
        } else {
          // Swiped right, go to previous slide
          setCurrentIndex(prev => prev === 0 ? children.length - 1 : prev - 1);
        }
      }
    };

    const carousel = carouselRef.current;
    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      carousel.removeEventListener('touchstart', handleTouchStart);
      carousel.removeEventListener('touchmove', handleTouchMove);
      carousel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enableTouch, children.length]);

  // Equalize heights
  useEffect(() => {
    if (!equalizeHeights || window.innerWidth <= 768) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    // Process each slide group separately
    const slideGroups = carousel.querySelectorAll('.goals-group');

    slideGroups.forEach((group) => {
      const items = group.querySelectorAll('ul.goals-list li.icon');

      // Reset heights first
      items.forEach((item: Element) => {
        (item as HTMLElement).style.height = 'auto';
      });

      // Get max height
      let maxHeight = 0;
      items.forEach((item: Element) => {
        maxHeight = Math.max(maxHeight, (item as HTMLElement).offsetHeight);
      });

      // Set all items to max height
      if (maxHeight > 0) {
        items.forEach((item: Element) => {
          (item as HTMLElement).style.height = `${maxHeight}px`;
        });
      }
    });
  }, [currentIndex, equalizeHeights]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < children.length) {
      setCurrentIndex(index);
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 1000); // Resume after 1 second
      
      // Debug logging
      console.log(`Carousel: Going to slide ${index + 1} of ${children.length}`);
    }
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  if (children.length === 0) return null;

  return (
    <>
      <div className="carousel-container">
        <div
          className="carousel-wrapper"
          ref={carouselRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="carousel-content"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: 'transform 0.5s ease'
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {children.length > 1 && (
        <div className="carousel-dots">
          {children.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              title={`Goal ${index + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Carousel;