"use client";

import { use3DButton } from "@/hooks/use-3d-button";
import { Button } from "@/components/ui/button";

export const GOOGLE_BTN_ID = "gbtn";
export const GOOGLE_BTN_SELECTOR = `#${GOOGLE_BTN_ID}`;

function GoogleLogoPaths() {
  return (
    <>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6">
      <GoogleLogoPaths />
    </svg>
  );
}

export function GoogleSignInButton({ onClick }: { onClick?: () => void }) {
  const { btnRef, handlers } = use3DButton();

  return (
    <>
      <div className="md:hidden">
        <Button
          onClick={onClick}
          className="w-full h-14 gap-3 rounded-xl text-base font-bold bg-(--card-color-terracotta) text-white border-2 border-[color-mix(in_oklch,var(--card-color-terracotta),black_20%)] shadow-[0_4px_0_color-mix(in_oklch,var(--card-color-terracotta),black_30%)] active:translate-y-[3px] active:shadow-[0_1px_0_color-mix(in_oklch,var(--card-color-terracotta),black_30%)] active:bg-[var(--card-color-terracotta)] hover:bg-[var(--card-color-terracotta)] focus-visible:ring-0 transition-all duration-75 ease-out"
          size="lg"
        >
          <GoogleIcon />
          Continue with Google
        </Button>
      </div>
      <div className="hidden md:block">
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
          id={GOOGLE_BTN_ID}
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
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="n2"
                      scale={2.5}
                    />
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
                    <ellipse
                      cx={24}
                      cy={6}
                      rx={9}
                      ry={7}
                      fill="var(--moss-2)"
                    />
                    <ellipse
                      cx={6}
                      cy={18}
                      rx={8}
                      ry={10}
                      fill="var(--moss-3)"
                    />
                    <ellipse
                      cx={60}
                      cy={4}
                      rx={10}
                      ry={7}
                      fill="var(--moss-4)"
                    />
                    <ellipse
                      cx={68}
                      cy={10}
                      rx={8}
                      ry={6}
                      fill="var(--moss-2)"
                    />
                    <ellipse
                      cx={150}
                      cy={3}
                      rx={9}
                      ry={7}
                      fill="var(--moss-3)"
                    />
                    <ellipse
                      cx={158}
                      cy={9}
                      rx={7}
                      ry={6}
                      fill="var(--moss-5)"
                    />
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
                    <ellipse
                      cx={300}
                      cy={3}
                      rx={9}
                      ry={7}
                      fill="var(--moss-3)"
                    />
                    <ellipse
                      cx={292}
                      cy={9}
                      rx={7}
                      ry={6}
                      fill="var(--moss-5)"
                    />
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
                    <ellipse
                      cx={6}
                      cy={58}
                      rx={8}
                      ry={10}
                      fill="var(--moss-3)"
                    />
                    <ellipse
                      cx={90}
                      cy={74}
                      rx={10}
                      ry={7}
                      fill="var(--moss-2)"
                    />
                    <ellipse
                      cx={98}
                      cy={68}
                      rx={8}
                      ry={6}
                      fill="var(--moss-4)"
                    />
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
                <g transform="translate(42,27)">
                  <GoogleLogoPaths />
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
      </div>
    </>
  );
}
