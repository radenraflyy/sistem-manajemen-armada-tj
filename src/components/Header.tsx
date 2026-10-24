const Header = () => {
  return (
    <header className="flex min-h-22 items-center justify-between gap-8 bg-tj-navy px-[clamp(24px,8vw,120px)] text-white">
      <a
        className="inline-flex min-w-56 items-center gap-3 text-inherit no-underline"
        href="/"
        aria-label="Transjakarta — Beranda"
      >
        <img
          src="/icon-tj.png"
          alt=""
          className="size-17.5 object-contain"
        />
        <span className="grid gap-px">
          <strong className="text-base font-bold tracking-[-0.02em]">
            Transjakarta
          </strong>
          <span className="text-xs text-white/70">
            Sistem Manajemen Armada
          </span>
        </span>
      </a>
    </header>
  );
};

export default Header;
