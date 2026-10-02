const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-300 dark:border-slate-800">
      <div className="section-shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-lg font-black text-white shadow-lg shadow-indigo-900/30">
              T
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white">
                Tech<span className="text-indigo-300">Brand</span>
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
            Premium electronics, smart technology, and everyday essentials built
            for a smoother, faster, and more confident lifestyle.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium text-slate-300">
            {["Free delivery", "Secure payments", "Local support"].map(
              (badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                >
                  {badge}
                </span>
              ),
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
            Explore
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-400">
            <li>
              <a href="/" className="transition hover:text-white">
                Home
              </a>
            </li>
            <li>
              <a href="/products" className="transition hover:text-white">
                Products
              </a>
            </li>
            <li>
              <a href="/about" className="transition hover:text-white">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-white">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
            Support
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-400">
            <li>
              <a
                href="/shipping-returns"
                className="transition hover:text-white"
              >
                Shipping & Returns
              </a>
            </li>
            <li>
              <a href="/privacy" className="transition hover:text-white">
                Privacy
              </a>
            </li>
            <li>
              <a href="/terms" className="transition hover:text-white">
                Terms
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="section-shell flex flex-col items-center justify-between gap-3 py-5 text-sm text-slate-500 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} TechBrand. All rights reserved.
          </p>
          <p>Built for a better shopping experience.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
