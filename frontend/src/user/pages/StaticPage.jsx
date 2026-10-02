import { Link, useParams } from "react-router-dom";

const pages = {
  about: {
    title: "About TechBrand",
    body: "We are an Ethiopian technology retailer focused on dependable products and clear service. Replace this text with your company story, mission, and local business details.",
  },
  contact: {
    title: "Contact",
    body: "For product and order questions, contact our team at support@example.com or +251 911 123 456. Replace these sample details with your official support channels.",
  },
  "shipping-returns": {
    title: "Shipping and Returns",
    body: "Delivery options and fees are shown during checkout. Contact support to arrange a return. Replace this placeholder with your delivery coverage, estimated timing, and return policy.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "We use account, delivery, and transaction details to fulfill orders and provide support. Replace this placeholder with your complete privacy policy and data-retention practices.",
  },
  terms: {
    title: "Terms and Conditions",
    body: "Orders are subject to product availability and the price shown at checkout. Replace this placeholder with your complete terms of sale, payment, cancellation, and dispute terms.",
  },
};

const StaticPage = () => {
  const { slug } = useParams();
  const page = pages[slug] || pages.about;

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl px-4 pb-16 pt-28 sm:px-6">
      <p className="text-sm font-semibold uppercase text-emerald-800 dark:text-emerald-400">
        TechBrand
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">
        {page.title}
      </h1>
      <p className="mt-6 whitespace-pre-line leading-7 text-gray-700 dark:text-gray-300">
        {page.body}
      </p>
      <Link
        to="/products"
        className="mt-8 inline-flex rounded bg-emerald-800 px-4 py-2 font-semibold text-white hover:bg-emerald-900"
      >
        Browse products
      </Link>
    </main>
  );
};

export default StaticPage;
