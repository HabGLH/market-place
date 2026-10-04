import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-300 dark:border-slate-800">
      <div className="section-shell grid gap-10 py-14 md:grid-cols-4">
        {/* Brand Col */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-base font-black text-white shadow-lg shadow-indigo-900/30">
              T
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-white">
                Tech<span className="text-indigo-400">Brand</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-400">
            Premium electronics, smart technology, and everyday essentials built
            for a smoother, faster, and more confident lifestyle.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-medium text-slate-300">
            {["Fast delivery", "Secure checkout", "Local support"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Marketplace Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Marketplace
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
            <li>
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/categories" className="transition hover:text-white">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/products" className="transition hover:text-white">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/cart" className="transition hover:text-white">
                Shopping Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
            <li>
              <Link to="/about" className="transition hover:text-white">
                About TechBrand
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition hover:text-white">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="transition hover:text-white">
                Help & FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Policy Links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Customer Care
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-400">
            <li>
              <Link to="/shipping" className="transition hover:text-white">
                Shipping & Delivery
              </Link>
            </li>
            <li>
              <Link to="/returns" className="transition hover:text-white">
                Returns & Refunds
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-slate-950/80">
        <div className="section-shell flex flex-col items-center justify-between gap-3 py-4 text-xs text-slate-500 md:flex-row">
          <p>&copy; {new Date().getFullYear()} TechBrand. All rights reserved.</p>
          <p>Designed for a seamless e-commerce experience.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
