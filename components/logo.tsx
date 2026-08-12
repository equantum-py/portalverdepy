import Image from 'next/image';
import Link from 'next/link';

export function Logo({desktopUrl='/images/logo-desktop.png',mobileUrl='/images/logo-mobile.png',alt='Portal Verde'}:{desktopUrl?:string;mobileUrl?:string;alt?:string}) {
  return (
    <Link href="/" aria-label="Portal Verde" className="flex items-center">
      
      {/* Desktop */}
      <Image
        src={desktopUrl}
        alt={alt}
        width={450}
        height={190}
        quality={90}
        className="hidden lg:block h-14 w-auto object-contain"
      />

      {/* Tablet */}
      <Image
        src={desktopUrl}
        alt={alt}
        width={450}
        height={150}
        quality={90}
        className="hidden sm:block lg:hidden h-12 w-auto object-contain"
      />

      {/* Mobile */}
      <Image
        src={mobileUrl}
        alt={alt}
        width={300}
        height={100}
        quality={90}
        className="block sm:hidden h-10 w-auto object-contain"
      />

    </Link>
  );
}
