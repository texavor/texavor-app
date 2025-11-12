import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";

const ArticleCard = ({
  title,
  description,
  date,
  tag,
  slug,
  image,
  type,
}: {
  title: string;
  description: string;
  date: string;
  tag: string[];
  slug: string;
  image: string;
  type: string;
}) => {
  return (
    <div className="cursor-pointer w-full p-2 rounded-xl relative group">
      <div className="absolute inset-0 bg-[#EEDED3] rounded-xl transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-in-out origin-bottom"></div>
      <div className="relative">
        <Link className="flex justify-between" href={`/blog/${slug}`}>
          <div
            className={`w-full space-y-1 ${type === "flex" && "flex gap-2"}`}
          >
            <div className="relative w-full aspect-[1000/420]">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover rounded-xl"
              />
            </div>
            <div>
              <p className="font-arcade text-xl font-medium hover:text-[#104127]">
                {title}
              </p>
              <p className="font-raleway whitespace-nowrap">
                {format(new Date(date || new Date()), "dd MMM, yyyy")}
              </p>
              <div className="flex flex-wrap">
                {tag?.map((item) => (
                  <span
                    className="font-raleway underline mr-2 decoration-[#104127] decoration-2"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p
                className="font-raleway text-sm cursor-pointer md:block hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {description}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;
