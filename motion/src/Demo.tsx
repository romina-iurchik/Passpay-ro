import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

const C = { deep: "#0B0E14", teal: "#2DD4BF" };

// Escena del demo: grabación real (con sus banners sincronizados horneados) dentro
// de un marco de teléfono. Los subtítulos viven en el propio video (sync perfecto).
export const PhoneDemo: React.FC = () => {
  // Teléfono grande (ocupa más de la pantalla) y SIN notch, para que el banner de
  // descripción (horneado arriba del video) se lea completo y no quede tapado.
  const SCREEN_W = 760;
  const SCREEN_H = 1424;
  const BEZEL = 22;
  const DEV_W = SCREEN_W + BEZEL * 2;
  const DEV_H = SCREEN_H + BEZEL * 2;

  return (
    <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#fff", fontSize: 40, fontWeight: 800, marginBottom: 20 }}>
        Demo <span style={{ color: C.teal }}>en vivo</span>
      </div>

      <div
        style={{
          width: DEV_W,
          height: DEV_H,
          borderRadius: 60,
          background: "#0f1320",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.55), 0 0 70px rgba(91,75,245,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: 38, overflow: "hidden", background: C.deep }}>
          <OffthreadVideo
            src={staticFile("demo.mp4")}
            muted
            style={{ width: SCREEN_W, height: SCREEN_H, objectFit: "cover" }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
