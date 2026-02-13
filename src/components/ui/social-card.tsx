"use client";

import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  Link as LinkIcon,
} from "lucide-react";
import { useState } from "react";

interface SocialCardProps {
  author?: {
    name?: string;
    username?: string;
    avatar?: string;
    timeAgo?: string;
  };
  content?: {
    text?: string;
    link?: {
      title?: string;
      description?: string;
      icon?: React.ReactNode;
    };
  };
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMore?: () => void;
  className?: string;
  href?: string;
}

export function SocialCard({
  author,
  content,
  engagement,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onMore,
  className,
  href
}: SocialCardProps) {
  const [isLiked, setIsLiked] = useState(engagement?.isLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState(engagement?.isBookmarked ?? false);
  const [likes, setLikes] = useState(engagement?.likes ?? 0);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  };

  const handleCardClick = () => {
    if (href) {
      window.open(href, '_blank');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "w-full max-w-2xl mx-auto",
        "bg-white dark:bg-zinc-950",
        "border border-zinc-100 dark:border-zinc-800",
        "rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        href && "cursor-pointer hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300",
        className
      )}
    >
      <div className="p-8">
        {/* Author section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={author?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                alt={author?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {author?.name || "System"}
              </h3>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                @{author?.username || "system"} · {author?.timeAgo || "now"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMore?.();
            }}
            className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content section */}
        <p className="text-[15px] text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
          {content?.text}
        </p>

        {/* Link preview */}
        {content?.link && (
          <div className="mb-8 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-[0_2px_15px_rgb(0,0,0,0.02)]">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-full border border-zinc-50 dark:border-zinc-700 shadow-sm">
                {content.link.icon || <LinkIcon className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {content.link.title}
                </h4>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 truncate">
                  {content.link.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Engagement section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={handleLike}
              className={cn(
                "flex items-center gap-2.5 text-[13px] font-medium transition-colors group",
                isLiked
                  ? "text-rose-600"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-rose-600"
              )}
            >
              <Heart
                className={cn(
                  "w-[18px] h-[18px] transition-all",
                  isLiked && "fill-current scale-110"
                )}
              />
              <span>{likes}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onComment?.();
              }}
              className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
              <span>{engagement?.comments || 0}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
              }}
              className="flex items-center gap-2.5 text-[13px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-green-500 transition-colors"
            >
              <Repeat2 className="w-[18px] h-[18px]" />
              <span>{engagement?.shares || 0}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleBookmark}
            className={cn(
              "p-2 transition-all",
              isBookmarked 
                ? "text-zinc-900 dark:text-zinc-100" 
                : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <Bookmark className={cn(
              "w-[18px] h-[18px] transition-transform",
              isBookmarked && "fill-current"
            )} />
          </button>
        </div>
      </div>
    </div>
  );
}
