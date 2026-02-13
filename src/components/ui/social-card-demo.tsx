"use client";

import { SocialCard } from "@/components/ui/social-card";
import { Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export function SocialCardDemo() {
  const [cards, setCards] = useState([
    {
      id: 1,
      author: {
        name: "Dorian Baffier",
        username: "dorian_baffier",
        avatar: "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-04-uuYHWIRvVPi01gEt6NwnGyjqLeeZhz.png",
        timeAgo: "2h ago",
      },
      content: {
        text: "Just launched Kokonut UI! Check out the documentation and let me know what you think 🎨",
        link: {
          title: "Kokonut UI Documentation",
          description: "A comprehensive guide to Kokonut UI",
          icon: <LinkIcon className="w-5 h-5 text-blue-500" />,
        },
      },
      engagement: {
        likes: 128,
        comments: 32,
        shares: 24,
        isLiked: false,
        isBookmarked: false,
      },
    },
  ]);

  const handleAction = (id: number, action: string) => {
    console.log(`Card ${id}: ${action}`);
  };

  return (
    <div className="space-y-8 p-4">
      <div>
        {cards.map(card => (
          <SocialCard
            key={card.id}
            {...card}
            onLike={() => handleAction(card.id, 'liked')}
            onComment={() => handleAction(card.id, 'commented')}
            onShare={() => handleAction(card.id, 'shared')}
            onBookmark={() => handleAction(card.id, 'bookmarked')}
            onMore={() => handleAction(card.id, 'more')}
          />
        ))}
      </div>
    </div>
  );
}
