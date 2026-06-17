import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  TouchEvent,
  WheelEvent,
} from 'react';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image' | 'custom';
  mediaSrc?: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  customContent?: ReactNode;
  badgeContent?: ReactNode;
  subtitleContent?: ReactNode;
  ctaContent?: ReactNode;
  children?: ReactNode;
}

export const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc = '',
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  customContent,
  badgeContent,
  subtitleContent,
  ctaContent,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If we are at the top and scrolling up, contract the media first
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.0009;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005;
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }

        setTouchStartY(touchY);
      }
    };

    const handleTouchEnd = (): void => {
      setTouchStartY(0);
    };

    const handleScroll = (): void => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel as unknown as EventListener, {
      passive: false,
    });
    window.addEventListener('scroll', handleScroll as EventListener);
    window.addEventListener(
      'touchstart',
      handleTouchStart as unknown as EventListener,
      { passive: false }
    );
    window.addEventListener(
      'touchmove',
      handleTouchMove as unknown as EventListener,
      { passive: false }
    );
    window.addEventListener('touchend', handleTouchEnd as EventListener);

    return () => {
      window.removeEventListener(
        'wheel',
        handleWheel as unknown as EventListener
      );
      window.removeEventListener('scroll', handleScroll as EventListener);
      window.removeEventListener(
        'touchstart',
        handleTouchStart as unknown as EventListener
      );
      window.removeEventListener(
        'touchmove',
        handleTouchMove as unknown as EventListener
      );
      window.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY]);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div
      ref={sectionRef}
      className='transition-colors duration-700 ease-in-out overflow-x-hidden'
    >
      <section className='relative flex flex-col items-center justify-start min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100dvh]'>
          <motion.div
            className='absolute inset-0 z-0 h-full w-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <img
              src={bgImageSrc}
              alt='Background'
              className='w-screen h-screen object-cover object-center'
              loading="eager"
            />
            <div className='absolute inset-0 bg-black/60' />
          </motion.div>

          <div className='container mx-auto flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100dvh] relative'>
              
              {/* TOP HEADER BLOCK: Pulsing Badge & Sliding Titles */}
              <div className='absolute top-[8%] left-0 right-0 flex flex-col items-center justify-center z-20 px-4 text-center pointer-events-none'>
                {badgeContent && (
                  <motion.div
                    animate={{ 
                      opacity: 1 - scrollProgress, 
                      y: -scrollProgress * 60,
                      scale: 1 - scrollProgress * 0.1
                    }}
                    transition={{ duration: 0.1 }}
                    style={{ pointerEvents: scrollProgress > 0.4 ? 'none' : 'auto' }}
                    className="mb-4"
                  >
                    {badgeContent}
                  </motion.div>
                )}

                <div
                  className={`flex items-center justify-center text-center gap-1.5 w-full relative transition-none flex-col ${
                    textBlend ? 'mix-blend-difference' : 'mix-blend-normal'
                  }`}
                >
                  <motion.h2
                    className='text-[clamp(30px,5vw,60px)] font-serif font-extrabold text-white leading-tight'
                    style={{ transform: `translateX(-${textTranslateX}vw)` }}
                  >
                    {firstWord}
                  </motion.h2>
                  <motion.h2
                    className='text-[clamp(30px,5vw,60px)] font-serif font-extrabold bg-gradient-to-r from-[#C9A962] to-[#f0d080] bg-clip-text text-transparent leading-tight mt-1'
                    style={{ transform: `translateX(${textTranslateX}vw)` }}
                  >
                    {restOfTitle}
                  </motion.h2>
                </div>
              </div>

              {/* CENTER CARD BLOCK: Expanding Media */}
              <div
                className='absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-none rounded-2xl overflow-hidden'
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.7)',
                }}
              >
                {mediaType === 'custom' && customContent ? (
                  <div className="w-full h-full relative overflow-y-auto">
                    {customContent}
                  </div>
                ) : mediaType === 'video' ? (
                  mediaSrc.includes('youtube.com') ? (
                    <div className='relative w-full h-full pointer-events-none'>
                      <iframe
                        width='100%'
                        height='100%'
                        src={
                          mediaSrc.includes('embed')
                            ? mediaSrc +
                              (mediaSrc.includes('?') ? '&' : '?') +
                              'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1'
                            : mediaSrc.replace('watch?v=', 'embed/') +
                              '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' +
                              mediaSrc.split('v=')[1]
                        }
                        className='w-full h-full rounded-xl'
                        frameBorder='0'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                      />
                      <div
                        className='absolute inset-0 z-10'
                        style={{ pointerEvents: 'none' }}
                      ></div>

                      <motion.div
                        className='absolute inset-0 bg-black/30 rounded-xl'
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  ) : (
                    <div className='relative w-full h-full pointer-events-none'>
                      <video
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload='auto'
                        className='w-full h-full object-cover rounded-xl'
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                      />
                      <div
                        className='absolute inset-0 z-10'
                        style={{ pointerEvents: 'none' }}
                      ></div>

                      <motion.div
                        className='absolute inset-0 bg-black/30 rounded-xl'
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )
                ) : (
                  <div className='relative w-full h-full'>
                    <img
                      src={mediaSrc}
                      alt={title || 'Media content'}
                      className='w-full h-full object-cover rounded-xl'
                    />

                    <motion.div
                      className='absolute inset-0 bg-black/50 rounded-xl'
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-full text-center transition-none pointer-events-none'>
                  {date && (
                    <p
                      className='text-lg md:text-2xl text-amber-200/90 font-serif font-bold italic'
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                    >
                      {date}
                    </p>
                  )}
                  {scrollToExpand && scrollProgress < 0.95 && (
                    <p
                      className='text-xs md:text-sm text-white/50 font-medium tracking-widest uppercase mt-1 animate-pulse'
                      style={{ transform: `translateX(${textTranslateX}vw)` }}
                    >
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>

              {/* BOTTOM FOOTER BLOCK: Subtitle & CTAs */}
              <div className='absolute bottom-[8%] left-0 right-0 flex flex-col items-center justify-center z-20 px-6 text-center pointer-events-none'>
                {subtitleContent && (
                  <motion.div
                    animate={{ 
                      opacity: 1 - scrollProgress, 
                      y: scrollProgress * 60,
                      scale: 1 - scrollProgress * 0.1
                    }}
                    transition={{ duration: 0.1 }}
                    style={{ pointerEvents: scrollProgress > 0.4 ? 'none' : 'auto' }}
                    className="max-w-[540px] mb-6"
                  >
                    {subtitleContent}
                  </motion.div>
                )}

                {ctaContent && (
                  <motion.div
                    animate={{ 
                      opacity: 1 - scrollProgress, 
                      y: scrollProgress * 80,
                      scale: 1 - scrollProgress * 0.05
                    }}
                    transition={{ duration: 0.1 }}
                    style={{ pointerEvents: scrollProgress > 0.4 ? 'none' : 'auto' }}
                  >
                    {ctaContent}
                  </motion.div>
                )}
              </div>

            </div>

            <motion.section
              className='flex flex-col w-full'
              initial={{ opacity: 0, display: 'none' }}
              animate={{ 
                opacity: showContent ? 1 : 0,
                display: showContent ? 'flex' : 'none'
              }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
