import Image from "next/image";

import { PetuciaStatus } from "./components/petucia-status";

export default function Home() {
  return (
    <div className="flex min-h-full flex-row items-center gap-8 p-6">
      <div className="max-w-md flex-1">
        <PetuciaStatus />
      </div>

      <div className="shrink-0">
        <Image
          src="/avatar-petucia.svg"
          alt="Avatar da Petucia"
          width={100}
          height={100}
          loading="eager"
          className="pointer-events-none h-[90vh] w-auto object-cover"
        />
      </div>
    </div>
  );
}
