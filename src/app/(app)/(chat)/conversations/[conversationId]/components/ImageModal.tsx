'use client';

import Modal from '@/app/(app)/(chat)/(comp)/components/Modal';
import Image from 'next/image';

interface MediaModalProps {
  isOpen?: boolean;
  src?: string | null;
  onClose: () => void;
}

const ImageModal: React.FC<MediaModalProps> = ({ isOpen, src, onClose }) => {
  if (!src) {
    return null;
  }

  const isVideo = src.toLowerCase().match(/\.(mp4|webm|ogg|avi|mov|wmv)$/);
  const isGif = src.toLowerCase().includes('.gif');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-auto h-auto max-w-[90vw] max-h-[90vh]">
        {isVideo ? (
          <video
            controls
            className="max-w-full max-h-full object-contain"
            preload="metadata"
          >
            <source src={src} type="video/mp4" />
            <source src={src} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        ) : isGif ? (
          <img
            src={src}
            alt="GIF"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="relative w-80 h-80">
            <Image src={src} alt="Image" fill className="object-cover" />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageModal;
