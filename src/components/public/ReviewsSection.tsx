import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquarePlus, Heart, Sparkles } from 'lucide-react';

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  category: 'Developers' | 'Designers' | 'Creators' | 'Business';
  date: string;
  verified: boolean;
  likes: number;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Hamza Tariq',
    role: 'Senior Full-Stack Engineer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Direct image URLs with .png/.jpg extensions and instant Markdown snippets made writing GitHub docs and tech blogs a breeze. Blazing fast CDN.',
    category: 'Developers',
    date: '2 days ago',
    verified: true,
    likes: 42,
  },
  {
    id: 'rev-2',
    name: 'Sarah Jenkins',
    role: 'E-commerce Brand Founder',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'We host over 5,000 product images here. Zero downtime, automatic high-res WebP compression, and our store load speeds improved by 40%!',
    category: 'Business',
    date: '3 days ago',
    verified: true,
    likes: 38,
  },
  {
    id: 'rev-3',
    name: 'Alex Rivera',
    role: 'Product Designer @ StudioNine',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'No annoying interstitial ads, no bloated popups. Just pure, clean asset hosting with customizable embed codes. Exactly what creative teams need.',
    category: 'Designers',
    date: '5 days ago',
    verified: true,
    likes: 29,
  },
  {
    id: 'rev-4',
    name: 'Zainab Ahmed',
    role: 'Growth & Content Lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'The view analytics and referral tracking helped us measure which viral campaign infographics drove the most engagement. Incredible tool.',
    category: 'Creators',
    date: '1 week ago',
    verified: true,
    likes: 51,
  },
  {
    id: 'rev-5',
    name: 'Marcus Chen',
    role: 'Open-Source Maintainer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Finally an image hosting platform that treats developer workflows first class. Clean API, direct raw endpoints, and dependable uptime.',
    category: 'Developers',
    date: '1 week ago',
    verified: true,
    likes: 33,
  },
  {
    id: 'rev-6',
    name: 'Elena Rostova',
    role: 'Editorial & Travel Photographer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Retains vibrant colors and sharp detail without harsh pixelation. Sending portfolio preview galleries to clients takes 2 seconds.',
    category: 'Designers',
    date: '2 weeks ago',
    verified: true,
    likes: 47,
  },
  {
    id: 'rev-7',
    name: 'David Miller',
    role: 'Technical Documentation Lead',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Batch upload and color-coded folder organizing is super smooth. We moved our whole company knowledgebase assets here effortlessly.',
    category: 'Business',
    date: '2 weeks ago',
    verified: true,
    likes: 22,
  },
  {
    id: 'rev-8',
    name: 'Ayesha Khan',
    role: 'Digital Creator & Influencer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Instant drag-and-drop right on the homepage! I love the privacy settings allowing me to choose between unlisted and public links in one click.',
    category: 'Creators',
    date: '3 weeks ago',
    verified: true,
    likes: 64,
  },
];

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New review form states
  const [newAuthor, setNewAuthor] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'Developers' | 'Designers' | 'Creators' | 'Business'>('Developers');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // Split into two rows for dynamic dual-scrolling
  const half = Math.ceil(reviews.length / 2);
  const rowOne = reviews.slice(0, half);
  const rowTwo = reviews.slice(half).length > 0 ? reviews.slice(half) : reviews;

  // Duplicate for seamless infinite loop
  const displayRowOne = [...rowOne, ...rowOne, ...rowOne, ...rowOne];
  const displayRowTwo = [...rowTwo, ...rowTwo, ...rowTwo, ...rowTwo];

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newText.trim()) return;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: newAuthor.trim(),
      role: newRole.trim() || 'Community Member',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newAuthor)}`,
      rating: newRating,
      text: newText.trim(),
      category: newCategory,
      date: 'Just now',
      verified: true,
      likes: 1,
    };

    setReviews([newReview, ...reviews]);
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setIsModalOpen(false);
      setNewAuthor('');
      setNewRole('');
      setNewText('');
      setNewRating(5);
    }, 1200);
  };

  return (
    <section id="reviews" className="py-20 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
      {/* Background ambient decorative blurs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Wall of Love</span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            Loved by Developers, Creators & Teams
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
            See how thousands of modern teams and creators power their blogs, stores, and workflows with ImgSphere.
          </p>

          {/* Social Proof Metric Highlights */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-900 dark:text-white">4.9 / 5.0</span>
              <span className="text-slate-400 dark:text-slate-500">Rating</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-slate-900 dark:text-white">12,000+</span>
              <span>Images Hosted Daily</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>99.99% Uptime Guarantee</span>
            </div>
          </div>

          {/* Write a Review Button */}
          <div className="mt-7 flex items-center justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-600/20 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Infinite Scrolling Tickers Container */}
      <div className="relative w-full overflow-hidden py-3">
        {/* Left & Right gradient edge fades for smooth cinema look */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50/90 dark:from-slate-900/90 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50/90 dark:from-slate-900/90 to-transparent z-10" />

        {/* Row 1 - Moves Left */}
        <div
          className="flex mb-5 select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`flex gap-5 shrink-0 ${
              isHovered ? '[animation-play-state:paused]' : ''
            } animate-marquee`}
          >
            {displayRowOne.map((item, idx) => (
              <ReviewCard key={`r1-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>

        {/* Row 2 - Moves Right (Reverse Direction) */}
        <div
          className="flex select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={`flex gap-5 shrink-0 ${
              isHovered ? '[animation-play-state:paused]' : ''
            } animate-marquee-reverse`}
          >
            {displayRowTwo.map((item, idx) => (
              <ReviewCard key={`r2-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom ticker hint */}
      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span>Cards auto-scroll automatically. Hover any card to pause and read.</span>
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-blue-600" />
              Share Your Experience
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Your feedback will appear immediately on the live community wall!
            </p>

            {submittedMessage ? (
              <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-base font-bold text-emerald-800 dark:text-emerald-300">Thank You!</h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Your review was published to the live animated ticker.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Miller"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Role or Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UI/UX Designer"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Developers">Developers</option>
                      <option value="Designers">Designers</option>
                      <option value="Creators">Creators</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setNewRating(num)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            num <= newRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                      {newRating} of 5 stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Review
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us about your experience with image uploads, links, or CDN speeds..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

// Subcomponent: Individual Card
const ReviewCard: React.FC<{ item: ReviewItem }> = ({ item }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!liked) {
      setLiked(true);
      setLikeCount(likeCount + 1);
    } else {
      setLiked(false);
      setLikeCount(likeCount - 1);
    }
  };

  return (
    <div className="w-[320px] sm:w-[380px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
      <div>
        {/* Top bar: Stars and Quote icon */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex text-amber-400">
            {[...Array(item.rating)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
            {item.category}
          </span>
        </div>

        {/* Review text */}
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all">
          "{item.text}"
        </p>
      </div>

      {/* Author details */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={item.avatar}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
            loading="lazy"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {item.name}
              </h4>
              {item.verified && (
                <span title="Verified User">
                  <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              {item.role}
            </p>
          </div>
        </div>

        {/* Helpful / Like counter */}
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
            liked
              ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
              : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          title="Mark as helpful"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-600' : ''}`} />
          <span className="text-[11px] font-semibold">{likeCount}</span>
        </button>
      </div>
    </div>
  );
};
