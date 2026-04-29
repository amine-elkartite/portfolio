export function AnimatedBackground() {
  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-0 bg-ink" />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 opacity-80"
        style={{
          background:
            "radial-gradient(70% 45% at 50% 0%, rgba(0,255,133,0.16), transparent 62%), radial-gradient(62% 52% at 80% 26%, rgba(0,195,255,0.13), transparent 66%), linear-gradient(135deg, rgba(5,8,20,1) 0%, rgba(6,15,29,1) 52%, rgba(5,8,20,1) 100%)"
        }}
      />
      <div aria-hidden="true" className="ambient-grid fixed inset-0 z-[1] opacity-70" />
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-[-22%] z-[2] h-[68vh] opacity-60 blur-3xl"
        style={{
          background:
            "linear-gradient(115deg, transparent 12%, rgba(0,255,133,0.16) 38%, rgba(0,195,255,0.2) 56%, transparent 82%)",
          animation: "aurora 14s ease-in-out infinite alternate"
        }}
      />
      <div className="noise" aria-hidden="true" />
      <style>
        {`
          @keyframes aurora {
            0% { transform: translate3d(-4%, 0, 0) skewY(-4deg); opacity: .46; }
            100% { transform: translate3d(5%, 3%, 0) skewY(3deg); opacity: .74; }
          }
        `}
      </style>
    </>
  );
}
