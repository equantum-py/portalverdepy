import Image from 'next/image';
import Link from 'next/link';

type LogoProps = {
  desktopUrl?: string;
  mobileUrl?: string;
  alt?: string;
};

export function Logo({
  desktopUrl = '/images/logo-desktop.png',
  mobileUrl = '/images/logo-mobile.png',
  alt = 'Portal Verde',
}: LogoProps) {
  const desktopIsSvg = desktopUrl
    .toLowerCase()
    .endsWith('.svg');

  const mobileIsSvg = mobileUrl
    .toLowerCase()
    .endsWith('.svg');

  return (
    <Link
      href="/"
      aria-label="Portal Verde"
      className="flex items-center"
    >
      {/* Desktop */}
      <Image
        unoptimized={desktopIsSvg}
        src={desktopUrl}
        alt={alt}
        width={450}
        height={190}
        className="hidden h-14 w-auto object-contain lg:block"
        priority
      />

      {/* Tablet */}
      <Image
        unoptimized={desktopIsSvg}
        src={desktopUrl}
        alt={alt}
        width={450}
        height={150}
        className="hidden h-12 w-auto object-contain sm:block lg:hidden"
        priority
      />

      {/* Mobile */}
      <Image
        unoptimized={mobileIsSvg}
        src={mobileUrl}
        alt={alt}
        width={300}
        height={100}
        className="block h-10 w-auto object-contain sm:hidden"
        priority
      />
    </Link>
  );
}