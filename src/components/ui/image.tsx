import Image from 'next/image';
import { ComponentProps } from 'react';

type ImageProps = Omit<ComponentProps<typeof Image>, 'src'> & {
  src: string;
  fallbackSrc?: string;
};

export function CustomImage({
  src,
  alt,
  className,
  fallbackSrc = '/images/placeholder.png',
  ...props
}: ImageProps) {
  return (
    <div className={`relative ${className || ''}`}>
      <Image
        src={src}
        alt={alt}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (fallbackSrc && target.src !== fallbackSrc) {
            target.src = fallbackSrc;
          }
        }}
        {...props}
      />
    </div>
  );
}
