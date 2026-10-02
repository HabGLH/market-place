import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <main className="grid min-h-[70vh] place-items-center px-4 pt-16 text-center">
    <div>
      <p className="font-mono text-sm font-semibold text-emerald-800 dark:text-emerald-400">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">
        Page not found
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        That address does not match a page in the store.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded bg-emerald-800 px-4 py-2 font-semibold text-white hover:bg-emerald-900"
      >
        Return home
      </Link>
    </div>
  </main>
);

export default NotFoundPage;
