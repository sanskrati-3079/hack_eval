const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-foreground">
              Codora AI Hackathon 2025
            </p>
            <p className="text-xs text-muted-foreground">Mentor Portal</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <div className="flex items-center gap-1 font-medium text-primary">
              <span>Digital India</span>
              <span className="text-muted-foreground">Initiative</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
