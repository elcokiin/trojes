"use client";

import { use3DButton } from "@/hooks/use-3d-button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none">
      <path
        fill="#EA4335"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.667s3.773-8.667 8.6-8.667c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
}

export function GoogleSignInButton({ onClick }: { onClick?: () => void }) {
  const isMobile = useIsMobile();
  const { btnRef, handlers } = use3DButton();

  if (isMobile) {
    return (
      <Button
        onClick={onClick}
        className="w-full h-14 gap-3 rounded-xl text-base font-bold"
        size="lg"
      >
        <GoogleIcon />
        Continue with Google
      </Button>
    );
  }

  return (
    <>
      <style>{`
        #gbtn {
          --moss-1: #4d8a30;
          --moss-2: #6bae44;
          --moss-3: #5c9138;
          --moss-4: #528432;
          --moss-5: #7dba4a;
          --wood-outer: #8b5e34;
          --wood-outer-stroke: #54381c;
          --wood-inner: #9e6e3e;
          --wood-inner-stroke: #3d2514;
          --grain: #6b4423;
          --text: #f2e6d3;
          --raise-level: 5px;
          --pressed-level: 0px;
          --shadow-divisor: 2;
          --transform-speed: 0.15s;
          --release-speed: 0.12s;
          --hover-pressure: 1;
          --btn-shadow: transparent;
          --depth-face: transparent;
        }
        .dark #gbtn {
          --moss-1: #3f6b26;
          --moss-2: #5c9138;
          --moss-3: #4a7a2e;
          --moss-4: #436e28;
          --moss-5: #638f3a;
          --wood-outer: #6b4423;
          --wood-outer-stroke: #3e2712;
          --wood-inner: #7a4f28;
          --wood-inner-stroke: #2e1b0c;
          --grain: #4a2f18;
          --text: #f2e6d3;
          --depth-face: transparent;
          --btn-shadow: transparent;
        }

        #gbtn {
          position: relative;
          width: 420px;
          height: 92px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        #gbtn::before {
          content: '';
          position: absolute;
          width: calc(100% - 4px);
          height: calc(100% - (var(--raise-level) * var(--shadow-divisor)));
          bottom: calc(0px - (var(--raise-level) / var(--shadow-divisor)));
          left: 2px;
          border-radius: 14px;
          background: var(--btn-shadow);
          z-index: -1;
          transform: translate3d(0, 0, 0);
          transition: transform var(--transform-speed) ease-out,
                      background var(--transform-speed) ease-out;
          pointer-events: none;
        }

        .aws-btn__wrapper {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
        }

        .aws-btn__wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          bottom: calc(var(--raise-level) * -1);
          border-radius: 14px;
          background: var(--depth-face);
          z-index: -1;
          transition: transform var(--transform-speed) ease-out,
                      background-color var(--transform-speed) ease-out;
          pointer-events: none;
        }

        .aws-btn__content {
          position: relative;
          display: block;
          z-index: 1;
          transform: translate3d(0, 0, 0);
          transition: transform var(--transform-speed) ease-out;
        }

        #gbtn.--active::before {
          transform: translate3d(
            0,
            calc((var(--raise-level) - var(--pressed-level)) * -1),
            0
          );
        }

        #gbtn.--active .aws-btn__content {
          transform: translate3d(
            0,
            calc(var(--raise-level) - var(--pressed-level)),
            0
          );
        }

        #gbtn.--releasing::before,
        #gbtn.--releasing .aws-btn__content {
          transition-timing-function: ease-out;
          transition-duration: var(--release-speed);
        }

        #gbtn.--left::before {
          transform: skewY(calc(1deg * var(--hover-pressure) * 1));
        }

        #gbtn.--left .aws-btn__content {
          transform: skewY(calc(1deg * var(--hover-pressure) * -1));
        }

        #gbtn.--right::before {
          transform: skewY(calc(1deg * var(--hover-pressure) * -1));
        }

        #gbtn.--right .aws-btn__content {
          transform: skewY(calc(1deg * var(--hover-pressure) * 1));
        }

        #gbtn.--middle::before {
          transform: translate3d(0, calc(-1px * var(--hover-pressure)), 0);
        }

        #gbtn.--middle .aws-btn__content {
          transform: translate3d(0, calc(1px * var(--hover-pressure)), 0);
        }
      `}</style>
      <button
        ref={btnRef}
        id="gbtn"
        onPointerDown={handlers.onPointerDown}
        onPointerUp={handlers.onPointerUp}
        onPointerMove={handlers.onPointerMove}
        onPointerLeave={handlers.onPointerLeave}
        onClick={onClick}
      >
        <span className="aws-btn__wrapper">
          <span className="aws-btn__content">
            <svg
              width={420}
              height={92}
              viewBox="0 0 360 78"
              style={{ display: "block", overflow: "visible" }}
            >
              <defs>
                <filter id="blob">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.02"
                    numOctaves={2}
                    seed={7}
                    result="n"
                  />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale={6} />
                </filter>
                <filter id="grainf">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.9"
                    numOctaves={2}
                    seed={3}
                    result="n2"
                  />
                  <feDisplacementMap in="SourceGraphic" in2="n2" scale={2.5} />
                </filter>
              </defs>
              <g filter="url(#blob)">
                <g id="mossL">
                  <ellipse
                    cx={14}
                    cy={10}
                    rx={12}
                    ry={9}
                    fill="var(--moss-1)"
                  />
                  <ellipse cx={24} cy={6} rx={9} ry={7} fill="var(--moss-2)" />
                  <ellipse cx={6} cy={18} rx={8} ry={10} fill="var(--moss-3)" />
                  <ellipse cx={60} cy={4} rx={10} ry={7} fill="var(--moss-4)" />
                  <ellipse cx={68} cy={10} rx={8} ry={6} fill="var(--moss-2)" />
                  <ellipse cx={150} cy={3} rx={9} ry={7} fill="var(--moss-3)" />
                  <ellipse cx={158} cy={9} rx={7} ry={6} fill="var(--moss-5)" />
                  <ellipse
                    cx={230}
                    cy={4}
                    rx={10}
                    ry={7}
                    fill="var(--moss-4)"
                  />
                  <ellipse
                    cx={238}
                    cy={10}
                    rx={8}
                    ry={6}
                    fill="var(--moss-2)"
                  />
                  <ellipse cx={300} cy={3} rx={9} ry={7} fill="var(--moss-3)" />
                  <ellipse cx={292} cy={9} rx={7} ry={6} fill="var(--moss-5)" />
                  <ellipse
                    cx={346}
                    cy={10}
                    rx={12}
                    ry={9}
                    fill="var(--moss-1)"
                  />
                  <ellipse
                    cx={352}
                    cy={20}
                    rx={8}
                    ry={10}
                    fill="var(--moss-3)"
                  />
                </g>
                <g id="mossB">
                  <ellipse
                    cx={14}
                    cy={68}
                    rx={12}
                    ry={9}
                    fill="var(--moss-4)"
                  />
                  <ellipse cx={6} cy={58} rx={8} ry={10} fill="var(--moss-3)" />
                  <ellipse
                    cx={90}
                    cy={74}
                    rx={10}
                    ry={7}
                    fill="var(--moss-2)"
                  />
                  <ellipse cx={98} cy={68} rx={8} ry={6} fill="var(--moss-4)" />
                  <ellipse
                    cx={180}
                    cy={75}
                    rx={9}
                    ry={7}
                    fill="var(--moss-3)"
                  />
                  <ellipse
                    cx={188}
                    cy={69}
                    rx={7}
                    ry={6}
                    fill="var(--moss-5)"
                  />
                  <ellipse
                    cx={270}
                    cy={74}
                    rx={10}
                    ry={7}
                    fill="var(--moss-4)"
                  />
                  <ellipse
                    cx={262}
                    cy={68}
                    rx={8}
                    ry={6}
                    fill="var(--moss-2)"
                  />
                  <ellipse
                    cx={346}
                    cy={68}
                    rx={12}
                    ry={9}
                    fill="var(--moss-1)"
                  />
                  <ellipse
                    cx={352}
                    cy={58}
                    rx={8}
                    ry={10}
                    fill="var(--moss-3)"
                  />
                </g>
              </g>
              <rect
                x={8}
                y={8}
                width={344}
                height={62}
                rx={14}
                fill="var(--wood-outer)"
                stroke="var(--wood-outer-stroke)"
                strokeWidth={3}
              />
              <g
                filter="url(#grainf)"
                stroke="var(--grain)"
                strokeWidth={1.1}
                opacity={0.5}
                fill="none"
              >
                <path d="M12 20 Q120 15 200 20 T350 18" />
                <path d="M10 34 Q140 30 220 35 T352 32" />
                <path d="M11 50 Q130 55 230 48 T351 52" />
                <path d="M12 62 Q150 58 240 64 T350 60" />
              </g>
              <rect
                x={22}
                y={20}
                width={316}
                height={38}
                rx={8}
                fill="var(--wood-inner)"
                stroke="var(--wood-inner-stroke)"
                strokeWidth={1.4}
              />
              <g transform="translate(40,25)">
                <path
                  fill="#EA4335"
                  d="M13.5 11.2v4.6h6.4c-.28 1.5-1.13 2.77-2.4 3.62v3h3.87c2.27-2.1 3.58-5.2 3.58-8.88 0-.86-.08-1.68-.22-2.47H13.5z"
                />
                <path
                  fill="#34A853"
                  d="M13.5 26c3.24 0 5.96-1.07 7.95-2.9l-3.87-3c-1.07.72-2.45 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H2.75v3.1C4.73 23.3 8.83 26 13.5 26z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.75 16.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28v-3.1H2.75A12.9 12.9 0 0 0 1.4 14c0 1.98.48 3.86 1.35 5.38l4-3.1z"
                />
                <path
                  fill="#4285F4"
                  d="M13.5 6.75c1.77 0 3.35.6 4.6 1.8l3.42-3.42C19.45 3.2 16.74 2 13.5 2c-4.67 0-8.77 2.7-10.75 6.62l4 3.1c.95-2.85 3.61-4.97 6.75-4.97z"
                />
              </g>
              <text
                x={200}
                y={45}
                fontFamily="var(--font-sans), sans-serif"
                fontSize={17}
                fontWeight={700}
                fill="var(--text)"
                textAnchor="middle"
              >
                CONTINUE WITH GOOGLE
              </text>
            </svg>
          </span>
        </span>
      </button>
    </>
  );
}
