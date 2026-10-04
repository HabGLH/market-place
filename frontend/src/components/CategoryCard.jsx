import { useState } from "react";
import { Link } from "react-router-dom";

const categoryIconMap = {
  laptop: "💻",
  shirt: "👕",
  home: "🏠",
  book: "📚",
  sparkles: "✨",
  tag: "🏷️",
  phone: "📱",
  desktop: "🖥️",
  audio: "🎧",
  headphones: "🎧",
  watch: "⌚",
  camera: "📷",
  gamepad: "🎮",
  speaker: "🔊",
  "smart devices": "📱",
  electronics: "💻",
  fashion: "👕",
  "home & living": "🏠",
  "books & stationeries": "📚",
  "fitness & outdoor": "🏃",
  accessories: "⌚",
  office: "💻",
  gaming: "🎮",
  wearables: "⌚",
  cameras: "📷",
  tablets: "📱",
  laptops: "💻",
  phones: "📱",
  speakers: "🔊",
  storage: "💾",
  networking: "🌐",
  software: "📀",
};

const categoryGradients = [
  "from-indigo-500 to-cyan-500",
  "from-violet-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-red-500",
  "from-sky-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-lime-500 to-green-500",
];

const CategoryCard = ({
  category,
  index,
  isSelected = false,
  onSelect,
  to,
}) => {
  const [imageError, setImageError] = useState(false);
  const catName = typeof category === "string" ? category : category.name;
  const rawIcon = category?.icon?.toLowerCase();
  const rawName = catName?.toLowerCase();

  const fallbackIcon =
    categoryIconMap[rawIcon] ||
    categoryIconMap[rawName] ||
    (rawIcon && rawIcon.length <= 4 ? rawIcon : null) ||
    "🏷️";

  const hasValidImageUrl =
    category?.image &&
    typeof category.image === "string" &&
    (category.image.startsWith("http://") ||
      category.image.startsWith("https://") ||
      category.image.startsWith("/") ||
      category.image.startsWith("data:"));

  const showImage = hasValidImageUrl && !imageError;
  const gradient = categoryGradients[index % categoryGradients.length];
  const CardWrapper = to ? Link : "button";

  return (
    <CardWrapper
      {...(to ? { to } : { type: "button", onClick: () => onSelect(catName) })}
      className={`soft-card group flex flex-col justify-between h-full overflow-hidden p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isSelected
          ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900"
          : ""
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-md transition-transform duration-300 group-hover:scale-105`}
          >
            {showImage ? (
              <img
                src={category.image}
                alt=""
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span role="img" aria-label={catName}>
                {fallbackIcon}
              </span>
            )}
          </div>
          {typeof category.productCount === "number" && (
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {category.productCount}{" "}
              {category.productCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {catName}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
          {category.description || "Handpicked essentials for a smarter lifestyle."}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-semibold text-indigo-600 dark:text-indigo-400">
        <span>{isSelected ? "✓ Selected" : "Explore collection"}</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </CardWrapper>
  );
};

export default CategoryCard;
