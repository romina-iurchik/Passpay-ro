import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

const C = { deep: "#0B0E14", teal: "#2DD4BF" };

// Escena del demo: grabación real (con sus banners sincronizados horneados) dentro
// de un marco de teléfono. Los subtítulos viven en el propio video (sync perfecto).
export const PhoneDemo: React.FC = () => {
  const SCREEN_W = 600;
  const SCREEN_H = 1125;
  const BEZEL = 28;
  const DEV_W = SCREEN_W + BEZEL * 2;
  const DEV_H = SCREEN_H + BEZEL * 2;

  return (
    <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#fff", fontSize: 44, fontWeight: 800, marginBottom: 40 }}>
        Demo <span style={{ color: C.teal }}>en vivo</span>
      </div>

      <div
        style={{
          width: DEV_W,
          height: DEV_H,
          borderRadius: 70,
          background: "#0f1320",
          border: "2px solid rgba(255,255,255,0.12)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.55), 0 0 70px rgba(91,75,245,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: BEZEL + 10,
            width: 160,
            height: 28,
            borderRadius: 16,
            background: C.deep,
            zIndex: 2,
          }}
        />
        <div style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: 44, overflow: "hidden", background: C.deep }}>
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
