import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HiOutlineDownload } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import ActivityIndicator from '@/components/utilities/activity.indicator';
import styles from "./css/viewable_image.module.css";
import { createPortal } from 'react-dom';

interface ImageViewerProps {
  src: string | undefined;
  alt?: string;
  caption?: string;
  onload?: () => void;
  itemProp?: any;
  options: {
    thumbnailClassName?: string;
    height?: string | number;
    width?: string | number;
    rounded?: boolean;
    canView?: boolean;
  };
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  options = { canView: true },
  src,
  alt = '',
  onload,
  itemProp,
  caption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { thumbnailClassName, width = '100%', height = 'auto', rounded = false } = options;

  const [fullCaption, setFullCaption] = useState(false);
  const [displayedCaption, setDisplayedCaption] = useState('');
  const captionShortLen = 20;

  const [canDispGuide, setCanDispGuide] = useState<boolean>(false);
  const [displayGuide, setDisplayGuide] = useState<boolean>(true);

  const [thumbLoading, setThumbLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const inst = localStorage.getItem('show_image_viewer_guide');
    if (!inst) return setCanDispGuide(true);
    return setCanDispGuide(inst === 'yes');
  }, [displayGuide]);

  useEffect(() => {
    if (!caption) return;
    if (fullCaption) setDisplayedCaption(caption);
    else {
      const text =
        caption.length > captionShortLen
          ? caption.slice(0, captionShortLen) + '...'
          : caption;
      setDisplayedCaption(text);
    }
  }, [fullCaption, caption]);

  const handleOpen = () => {
    setIsOpen(true);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setImageLoading(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const newScale = Math.min(Math.max(0.5, scale - e.deltaY * 0.001), 5);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setTranslate({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (!isOpen) return;
    const imgElement = imgRef.current;
    if (imgElement) imgElement.addEventListener('wheel', handleWheel, { passive: false });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (imgElement) imgElement.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, scale, startPos, isDragging, translate]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = src || "";
    link.download = src?.split('/').pop() || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [src]);

  return (
    <>
      <div style={{ position: "relative", display: "inline-block", width, height }}>
        {thumbLoading && (
          <ActivityIndicator cover style="spin" size="small" />
        )}

        <img
          itemProp={itemProp}
          src={src}
          alt={alt}
          onClick={options.canView ? handleOpen : undefined}
          onLoad={() => {
            setThumbLoading(false);
            onload?.();
          }}
          className={`${thumbnailClassName || ''} ${styles.app_utility_thumbnail}`}
          style={{
            overflow: "hidden",
            borderRadius: rounded ? '50%' : '0',
            opacity: thumbLoading ? 0 : 1,
          }}
        />
      </div>

      {isOpen && createPortal(
        <div className={`${styles.app_utility_modal} ${isDragging ? styles.app_utility_dragging : null}`}>
          <div className={styles.app_utility_modal_topbar}>
            <div style={{ marginLeft: "auto" }} className={styles.app_utility_icon} onClick={handleDownload}>
              <HiOutlineDownload color="#eeeeee" size={30} />
            </div>
            <div className={styles.app_utility_icon} onClick={handleClose}>
              <IoClose color="#eeeeee" size={30} />
            </div>
          </div>

          {canDispGuide && displayGuide && (
            <div className={styles.app_utility_guide_box}>
              <span>
                Scroll vertically to zoom in/out, and drag to move the image.
              </span>
              <div className={styles.app_utility_guide_buttons}>
                <button
                  className={styles.app_utility_button_close}
                  onClick={() => setDisplayGuide(false)}
                >
                  close
                </button>
                <button
                  className={styles.app_utility_button_dontshow}
                  onClick={() => {
                    localStorage.setItem('show_image_viewer_guide', 'no');
                    setCanDispGuide(false);
                  }}
                >
                  do not show again
                </button>
              </div>
            </div>
          )}

          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {imageLoading && (
              <ActivityIndicator cover style="spin" size="big" />
            )}

            <img
              ref={imgRef}
              src={src}
              alt={alt}
              onMouseDown={handleMouseDown}
              onLoad={() => setImageLoading(false)}
              className={styles.app_utility_full_image}
              style={{
                transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                opacity: imageLoading ? 0 : 1,
              }}
            />
          </div>

          {caption && (
            <div className={styles.app_utility_caption}>
              {caption.length > captionShortLen ? (
                <div>
                  {displayedCaption}
                  <span
                    className={styles.app_utility_toggle_caption}
                    onClick={() => setFullCaption(!fullCaption)}
                  >
                    {fullCaption ? 'Show less' : 'Show more'}
                  </span>
                </div>
              ) : (
                <div>{caption}</div>
              )}
            </div>
          )}
        </div >,
        document.body
      )}
    </>
  );
};

export default ImageViewer;
