// src/pages/resident/Promotions.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/axiosConfig';
import { toast } from 'react-toastify';

const ResidentPromotions = () => {
  const { id: urlPromoId } = useParams();
  const navigate = useNavigate();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromo, setSelectedPromo] = useState(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.promotions.getAll({ status: 'active', limit: 100 });
      const list = res.data?.data?.items || res.data?.data || res.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setPromotions(safeList);

      if (urlPromoId && safeList.length > 0) {
        const match = safeList.find(p => p.id === urlPromoId);
        if (match) setSelectedPromo(match);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [urlPromoId]);

  const handleCopyCode = async (code, promoId) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Promo code '${code}' copied!`);
      if (promoId) {
        api.promotions.trackClick(promoId).catch(() => {});
      }
    } catch (e) {
      toast.info(`Promo code: ${code}`);
    }
  };

  const filteredPromos = promotions.filter(p => {
    const s = searchTerm.toLowerCase();
    return (
      (p.title || '').toLowerCase().includes(s) ||
      (p.businessName || '').toLowerCase().includes(s) ||
      (p.description || '').toLowerCase().includes(s) ||
      (p.promoCode || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white m-0">
            Resident Deals & Promotions
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 m-0 mt-0.5">
            Exclusive discounts, local merchant perks, and verified partner offers
          </p>
        </div>
        <button
          onClick={fetchPromotions}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:border-amber-400 transition cursor-pointer self-start sm:self-auto flex items-center space-x-1.5 shadow-sm"
        >
          <i className="fa-solid fa-arrows-rotate text-xs"></i>
          <span>Refresh Deals</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search discounts by merchant, keyword, promo code..."
          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm dark:text-white focus:outline-none focus:border-amber-400 shadow-sm"
        />
      </div>

      {/* Promotions Responsive Grid */}
      <div>
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 text-amber-400"></i>
            <p className="m-0">Loading promotional offers...</p>
          </div>
        ) : filteredPromos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 text-gray-400">
            <i className="fa-solid fa-tags text-4xl mb-3 text-gray-300 dark:text-zinc-700"></i>
            <h4 className="font-bold text-gray-700 dark:text-gray-300 text-base m-0">No Promotions Found</h4>
            <p className="text-xs text-gray-400 mt-1 m-0">There are currently no active deals matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPromos.map((promo) => (
              <div
                key={promo.id}
                onClick={() => {
                  setSelectedPromo(promo);
                  navigate(`/resident/promotions/${promo.id}`);
                }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-amber-400 transition flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                <div>
                  {promo.imageUrl && (
                    <img 
                      src={promo.imageUrl} 
                      alt={promo.title} 
                      className="w-full h-40 object-cover border-b border-gray-100 dark:border-zinc-800" 
                    />
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base shrink-0 font-bold">
                          <i className="fa-solid fa-store"></i>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white m-0 break-words [overflow-wrap:anywhere] min-w-0 line-clamp-1">
                            {promo.title}
                          </h4>
                          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 m-0 mt-0.5">
                            {promo.businessName || 'Condo Partner'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">{promo.price && <span className="text-xs font-black text-amber-500 bg-amber-400/10 px-2 py-0.5 rounded-full">{promo.price} {promo.currency || "ETB"}</span>}<span className="text-[10px] text-gray-400 font-medium">
                        {promo.expiresAt ? `Exp: ${new Date(promo.expiresAt).toLocaleDateString()}` : 'Active'}
                      </span></div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 m-0 line-clamp-3 leading-relaxed break-words [overflow-wrap:anywhere] min-w-0">
                      {promo.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 flex items-center justify-between border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-xs font-mono font-bold bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-amber-600 dark:text-amber-400">
                      {promo.promoCode || 'RESIDENTDEAL'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCode(promo.promoCode || 'RESIDENTDEAL', promo.id);
                      }}
                      className="text-xs font-bold bg-amber-400 hover:bg-amber-500 text-black px-3.5 py-1.5 rounded-lg transition border-none cursor-pointer flex items-center space-x-1.5 shadow-sm"
                    >
                      <i className="fa-solid fa-copy text-xs"></i>
                      <span>Copy Code</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedPromo && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg max-w-[calc(100vw-2rem)] rounded-3xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto overflow-x-hidden min-w-0 [overflow-wrap:anywhere]">
            <div className="flex justify-between items-start pb-2 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-600 dark:text-amber-400">
                  {selectedPromo.category || 'Special Offer'}
                </span>
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white m-0 mt-1.5 break-words [overflow-wrap:anywhere] min-w-0">
                  {selectedPromo.title}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold m-0 mt-0.5">
                  {selectedPromo.businessName || 'Condo Merchant Partner'}
                </p>
              </div>
              <button 
                onClick={() => {
                  setSelectedPromo(null);
                  navigate('/resident/promotions');
                }}
                className="text-gray-400 hover:text-white border-none bg-transparent cursor-pointer p-1"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {selectedPromo.imageUrl && (
              <div className="rounded-2xl overflow-hidden max-h-56">
                <img src={selectedPromo.imageUrl} alt={selectedPromo.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-gray-700 dark:text-gray-300 m-0 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] min-w-0">
                {selectedPromo.description}
              </p>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl flex items-center justify-between border border-amber-200 dark:border-amber-900/40">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Promo Code</span>
                  <span className="text-base font-mono font-black text-amber-600 dark:text-amber-400">
                    {selectedPromo.promoCode || 'RESIDENTDEAL'}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(selectedPromo.promoCode || 'RESIDENTDEAL', selectedPromo.id)}
                  className="bg-amber-400 hover:bg-amber-500 font-extrabold px-4 py-2 rounded-xl text-black border-none cursor-pointer text-xs"
                >
                  Copy Promo Code
                </button>
              </div>

              
              {(selectedPromo.contactNumber || selectedPromo.email || selectedPromo.websiteUrl) && (
                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl space-y-2 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Merchant Contact & Info</span>
                  {selectedPromo.contactNumber && (
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <i className="fa-solid fa-phone text-amber-500 text-xs w-4"></i>
                      <span>{selectedPromo.contactNumber}</span>
                    </div>
                  )}
                  {selectedPromo.email && (
                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <i className="fa-solid fa-envelope text-amber-500 text-xs w-4"></i>
                      <span>{selectedPromo.email}</span>
                    </div>
                  )}
                  {selectedPromo.websiteUrl && (
                    <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                      <i className="fa-solid fa-globe text-amber-500 text-xs w-4"></i>
                      <a href={selectedPromo.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline break-all [overflow-wrap:anywhere] min-w-0 max-w-[280px] sm:max-w-xs truncate block" title={selectedPromo.websiteUrl}>
                        {selectedPromo.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {selectedPromo.expiresAt && (
                <span className="text-gray-400 block text-right">
                  Valid until: {new Date(selectedPromo.expiresAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedPromo(null);
                navigate('/resident/promotions');
              }}
              className="w-full bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-bold p-3 rounded-xl border-none cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentPromotions;
