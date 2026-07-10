import type { MousePosition } from "@/hooks/use-mouse-parallax";

export function LoginClouds({ mouseCoordinates }: { mouseCoordinates: MousePosition }) {
  return (
    <div
      className="absolute -inset-4 z-1 pointer-events-none overflow-hidden dark:hidden transition-transform duration-200 ease-out will-change-transform"
      style={{
        transform: `translate3d(${-mouseCoordinates.x * 8}px, ${-mouseCoordinates.y * 8}px, 0)`,
      }}
    >
      {/* Nube 1 - grande, arriba izquierda */}
      <div className="absolute top-20 left-6">
        <div className="relative w-72 h-32">
          <div className="absolute bottom-0 left-6 w-40 h-24 bg-white/90 rounded-full" />
          <div className="absolute bottom-4 left-0 w-28 h-20 bg-white/90 rounded-full" />
          <div className="absolute bottom-6 left-24 w-32 h-24 bg-white/90 rounded-full" />
          <div className="absolute bottom-2 left-40 w-28 h-20 bg-white/90 rounded-full" />
          <div className="absolute -top-2 left-16 w-32 h-24 bg-white/90 rounded-full" />
          <div className="absolute -top-1 left-40 w-24 h-20 bg-white/90 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-14 bg-white/90 rounded-full" />
        </div>
      </div>

      {/* Nube 2 - mediana, izquierda media */}
      <div className="absolute top-40 left-[8%] max-[768px]:hidden">
        <div className="relative w-56 h-24">
          <div className="absolute bottom-0 left-4 w-28 h-4.5 bg-white/85 rounded-full" />
          <div className="absolute bottom-2 left-20 w-24 h-20 bg-white/85 rounded-full" />
          <div className="absolute -top-2 left-10 w-24 h-20 bg-white/85 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-10 bg-white/85 rounded-full" />
        </div>
      </div>

      {/* Nube 3 - pequeña, izquierda baja */}
      <div className="absolute top-[60%] left-[5%] opacity-75 max-[768px]:hidden">
        <div className="relative w-44 h-4.5">
          <div className="absolute bottom-0 left-2 w-5.5 h-3.5 bg-white/80 rounded-full" />
          <div className="absolute -top-1 left-3 w-4.5 h-4 bg-white/80 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-2.25 bg-white/80 rounded-full" />
        </div>
      </div>

      {/* Nube 4 - grande, fondo translúcido, izquierda */}
      <div className="absolute top-36 left-[3%] opacity-50 max-[768px]:hidden">
        <div className="relative w-80 h-28 blur-[1px]">
          <div className="absolute bottom-0 left-6 w-40 h-20 bg-white rounded-full" />
          <div className="absolute -top-2 left-24 w-36 h-6 bg-white rounded-full" />
          <div className="absolute bottom-0 left-36 w-28 h-4.5 bg-white rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-3 bg-white rounded-full" />
        </div>
      </div>

      {/* Nube 5 - grande, centro superior */}
      <div className="absolute top-10 left-[38%] -translate-x-1/2 max-[768px]:hidden">
        <div className="relative w-64 h-28">
          <div className="absolute bottom-0 left-4 w-36 h-20 bg-white/85 rounded-full" />
          <div className="absolute bottom-2 left-20 w-28 h-22 bg-white/85 rounded-full" />
          <div className="absolute -top-2 left-12 w-28 h-22 bg-white/85 rounded-full" />
          <div className="absolute bottom-0 left-32 w-24 h-16 bg-white/85 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-12 bg-white/85 rounded-full" />
        </div>
      </div>

      {/* Nube 6 - pequeña, centro */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 opacity-70 max-[768px]:hidden">
        <div className="relative w-48 h-20">
          <div className="absolute bottom-0 left-3 w-24 h-16 bg-white/75 rounded-full" />
          <div className="absolute -top-1 left-14 w-20 h-16 bg-white/75 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-10 bg-white/75 rounded-full" />
        </div>
      </div>

      {/* Nube 7 - grande, fondo centro */}
      <div className="absolute top-[55%] left-[40%] opacity-45 max-[768px]:hidden">
        <div className="relative w-72 h-24 blur-[1px]">
          <div className="absolute bottom-0 left-4 w-36 h-4.5 bg-white rounded-full" />
          <div className="absolute -top-1 left-20 w-28 h-5 bg-white rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-4.5 bg-white rounded-full" />
        </div>
      </div>

      {/* Nube 8 - mediana, centro-derecha arriba */}
      <div className="absolute top-28 right-[22%] max-[768px]:hidden">
        <div className="relative w-52 h-22">
          <div className="absolute bottom-0 left-4 w-28 h-4 bg-white/80 rounded-full" />
          <div className="absolute bottom-2 left-16 w-22 h-4.5 bg-white/80 rounded-full" />
          <div className="absolute -top-1 left-8 w-22 h-4.5 bg-white/80 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-2.5 bg-white/80 rounded-full" />
        </div>
      </div>

      {/* Nube 9 - pequeña, centro-derecha media */}
      <div className="absolute top-[45%] right-[18%] opacity-75 max-[768px]:hidden">
        <div className="relative w-40 h-16">
          <div className="absolute bottom-0 left-2 w-20 h-12 bg-white/75 rounded-full" />
          <div className="absolute -top-1 left-10 w-16 h-14 bg-white/75 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-8 bg-white/75 rounded-full" />
        </div>
      </div>

      {/* Nube 10 - mediana, centro-derecha baja */}
      <div className="absolute bottom-32 right-[20%] opacity-65 max-[768px]:hidden">
        <div className="relative w-56 h-20">
          <div className="absolute bottom-0 left-4 w-28 h-14 bg-white/70 rounded-full" />
          <div className="absolute -top-1 left-18 w-24 h-16 bg-white/70 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-9 bg-white/70 rounded-full" />
        </div>
      </div>

      {/* Nube 11 - mediana, abajo izquierda */}
      <div className="absolute bottom-16 left-[18%] opacity-70 max-[768px]:hidden">
        <div className="relative w-80 h-28">
          <div className="absolute bottom-0 left-6 w-40 h-20 bg-white/75 rounded-full" />
          <div className="absolute -top-1 left-24 w-36 h-24 bg-white/75 rounded-full" />
          <div className="absolute bottom-2 left-52 w-28 h-16 bg-white/75 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-12 bg-white/75 rounded-full" />
        </div>
      </div>

      {/* Nube 12 - pequeña, abajo centro */}
      <div className="absolute bottom-8 left-[55%] opacity-80 max-[768px]:hidden">
        <div className="relative w-44 h-16">
          <div className="absolute bottom-0 left-2 w-20 h-12 bg-white/70 rounded-full" />
          <div className="absolute -top-1 left-12 w-18 h-14 bg-white/70 rounded-full" />
          <div className="absolute bottom-0 left-0 w-full h-2.25 bg-white/70 rounded-full" />
        </div>
      </div>
    </div>
  );
}
