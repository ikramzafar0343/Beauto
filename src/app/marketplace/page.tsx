"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ExternalLink, Check, Loader2, ArrowLeft, Filter, X, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Integration {
  id: string;
  name: string;
  logo: string;
  category: string;
  description?: string;
  marketplaceUrl?: string;
  connected?: boolean;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(908); // Fixed total
  const [userId, setUserId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      if (userId) params.set("userId", userId);
      params.set("limit", itemsPerPage.toString());
      params.set("offset", ((currentPage - 1) * itemsPerPage).toString());

      const res = await fetch(`/api/composio/toolkits?${params}`);
      const data = await res.json();
      
      setIntegrations(data.toolkits || []);
      setCategories(data.categories || []);
      setTotalCount(data.total || 908);
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, userId, currentPage]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  useEffect(() => {
    const initUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    initUser();

    // Refresh on focus
    window.addEventListener("focus", fetchIntegrations);
    return () => window.removeEventListener("focus", fetchIntegrations);
  }, [fetchIntegrations]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#f0f4f8]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#dae0e2]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#f8f9fa] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#343434]" />
              <span className="text-sm font-medium text-[#343434]">Back to Home</span>
            </button>

            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#343434]/40" />
                <input
                  type="text"
                  placeholder="Search among 908 integrations..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#dae0e2] text-[#343434] placeholder:text-[#343434]/40 focus:outline-none focus:border-[#343434]/30 bg-white shadow-sm"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#dae0e2] hover:bg-[#f8f9fa] transition-colors"
            >
              <Filter className="w-5 h-5 text-[#343434]" />
              <span className="text-sm font-medium text-[#343434]">Filters</span>
              {selectedCategory && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-medium">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-xl bg-white border border-[#dae0e2] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#343434]">Categories</h3>
                {selectedCategory && (
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setCurrentPage(1);
                    }}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat ? "" : cat);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-[#343434] text-white shadow-md"
                        : "bg-[#f8f9fa] text-[#343434] hover:bg-[#dae0e2]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 border-b border-[#dae0e2] bg-gradient-to-b from-white to-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl font-bold text-[#343434] mb-4 bg-gradient-to-r from-[#343434] to-[#666] bg-clip-text text-transparent">
            App Marketplace
          </h1>
          <p className="text-xl text-[#343434]/60 mb-8">
            Connect your favorite apps and automate workflows with AI
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                908
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-[#343434]">Available Apps</p>
                <p className="text-sm text-[#343434]/60">Ready to integrate</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                <Check className="w-8 h-8" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-[#343434]">Easy Setup</p>
                <p className="text-sm text-[#343434]/60">One-click connect</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#343434]/40" />
            </div>
          ) : integrations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[#f8f9fa] flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-[#343434]/40" />
              </div>
              <h3 className="text-xl font-semibold text-[#343434] mb-2">No apps found</h3>
              <p className="text-[#343434]/60">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#343434]/60">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of <span className="font-semibold text-[#343434]">908</span> apps
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setCurrentPage(1);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f8f9fa] hover:bg-[#dae0e2] transition-colors"
                  >
                    <span className="text-sm text-[#343434]">{selectedCategory}</span>
                    <X className="w-4 h-4 text-[#343434]/60" />
                  </button>
                )}
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      onClick={() => router.push(`/chat?connect=${integration.id}`)}
                      className="group p-6 rounded-2xl bg-white border border-[#dae0e2] hover:border-[#343434]/30 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f8f9fa] to-white border border-[#dae0e2] flex items-center justify-center overflow-hidden mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                          <Image
                            src={integration.logo}
                            alt={integration.name}
                            width={40}
                            height={40}
                            unoptimized
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/beauto-logo.png";
                            }}
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-[#343434] mb-1 line-clamp-1">
                          {integration.name}
                        </h3>
                        <p className="text-xs text-[#343434]/40 mb-2 line-clamp-1">
                          {integration.category}
                        </p>
                        <p className="text-[10px] text-[#343434]/60 mb-3 line-clamp-2 min-h-[2.5em]">
                          {integration.description}
                        </p>
                        
                        <div className="flex flex-col gap-2 w-full">
                          {integration.connected ? (
                            <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Connected
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/chat?connect=${integration.id}`);
                              }}
                              className="w-full flex items-center justify-center gap-2 text-xs text-white font-medium bg-[#343434] py-1.5 rounded-xl hover:bg-[#343434]/90 transition-colors"
                            >
                              Connect
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          {integration.marketplaceUrl && (
                            <a 
                              href={integration.marketplaceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-blue-500 hover:text-blue-600 font-medium flex items-center justify-center gap-1"
                            >
                              View on Rube
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-[#dae0e2] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#343434]" />
                  </button>

                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      // Show first 3, last 3, and current +/- 2
                      if (
                        page <= 3 ||
                        page > totalPages - 3 ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                              currentPage === page
                                ? "bg-[#343434] text-white shadow-md"
                                : "bg-white border border-[#dae0e2] text-[#343434] hover:bg-[#f8f9fa]"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === 4 && currentPage > 6 ||
                        page === totalPages - 3 && currentPage < totalPages - 5
                      ) {
                        return <span key={page} className="text-[#343434]/40">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-[#dae0e2] hover:bg-[#f8f9fa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#343434]" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#dae0e2] bg-gradient-to-b from-white to-[#f8f9fa]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-[#343434] mb-4">
            Ready to automate your workflows?
          </h2>
          <p className="text-lg text-[#343434]/60 mb-8">
            Connect your apps and let AI handle repetitive tasks
          </p>
          <button
            onClick={() => router.push("/auth/sign-up")}
            className="px-8 py-4 rounded-xl bg-[#343434] text-white text-lg font-medium hover:bg-[#343434]/90 hover:shadow-xl transition-all"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}