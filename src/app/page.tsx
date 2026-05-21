import Image from "next/image";

export default function Home() {
  return (
    <div className="flez flex-row">
      {/* Dados */}
      <div>
        <h1>[frases]</h1>
        <span>Umidade do solo: [umidade]</span>
      </div>

      {/* Avatar da Petucia */}
      <div>
        <Image
          src="/avatar-petucia.svg"
          alt="Avatar da Petucia"
          width={100}
          height={100}
          loading="eager"
          className="w-auto h-[90vh] object-cover pointer-events-none"
        />
      </div>
    </div>
  );
}
