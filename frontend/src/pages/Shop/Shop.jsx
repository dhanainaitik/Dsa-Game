import { useState, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { ITEMS, RARITY_COLORS } from '../../data/items';
import { Zap, Shield, Sparkles, Map as MapIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import './Shop.css';

export default function Shop() {
  const { progress, buyItem, unlockRegion } = useProgress();
  const [activeTab, setActiveTab] = useState('items');
  const [toast, setToast] = useState(null);
  const [busyItem, setBusyItem] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const allItems = Object.values(ITEMS);
  const consumables = allItems.filter(i => i.type === 'consumable' || i.type === 'boost' || i.type === 'passive');
  
  const cosmetics = [
    { id: 'frame_gold', name: 'Golden Aura Frame', type: 'cosmetic', rarity: 'legendary', price: 1000, description: 'Surrounds your avatar in gold.', icon: '✨' },
    { id: 'dmg_pixel', name: 'Retro Damage Text', type: 'cosmetic', rarity: 'rare', price: 400, description: 'Changes damage numbers to pixel font.', icon: '👾' },
  ];

  const lockedRegions = Object.keys(progress.unlockedRegions || {}).length < 8 ? [
    { id: 'strings', name: 'Strings', price: 300, icon: '📜' },
    { id: 'linked-lists', name: 'Linked Lists', price: 400, icon: '🔗' },
    { id: 'trees', name: 'Trees', price: 500, icon: '🌲' },
  ].filter(r => !progress.unlockedRegions?.[r.id]) : [];

  const handleBuy = (item) => {
    if (busyItem) return; // Prevent rapid double-clicks

    const currentCoins = progress.coins ?? 0;
    if (currentCoins < item.price) {
      setToast({
        type: 'error',
        message: `Insufficient Coins! You have ${currentCoins}, but need ${item.price}.`,
      });
      return;
    }

    setBusyItem(item.id);

    try {
      if (item.type === 'map' || ['strings', 'linked-lists', 'trees'].includes(item.id)) {
        const res = buyItem(item);
        if (res.success) {
          unlockRegion(item.id);
          setToast({
            type: 'success',
            message: `Unlocked ${item.name} Region! Access granted on World Map.`,
            icon: item.icon,
          });
        }
      } else {
        const res = buyItem(item);
        if (res.success) {
          const count = res.newQuantity || (progress.inventory?.[item.id] || 0) + 1;
          setToast({
            type: 'success',
            message: `Purchased ${item.name}! Added to your Bag (Now x${count}).`,
            icon: item.icon,
          });
        } else {
          setToast({
            type: 'error',
            message: `Purchase failed: ${res.reason || 'Please try again.'}`,
          });
        }
      }
    } finally {
      setTimeout(() => setBusyItem(null), 300);
    }
  };

  return (
    <div className="page shop-page animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div className={`shop-toast-banner ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <div className="toast-icon">
            {toast.icon ? <span className="text-xl">{toast.icon}</span> : toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <PageHeader 
        title="THE MERCHANT'S VAULT" 
        description="Exchange your hard-earned coins for advantages in the Abyss."
      />

      <div className="container">
        <div className="shop-tabs">
          <button className={`neo-btn ${activeTab === 'items' ? 'neo-btn-primary' : ''}`} onClick={() => setActiveTab('items')}>
            <Shield size={16} /> Magic Items
          </button>
          <button className={`neo-btn ${activeTab === 'cosmetics' ? 'neo-btn-primary' : ''}`} onClick={() => setActiveTab('cosmetics')}>
            <Sparkles size={16} /> Cosmetics
          </button>
          <button className={`neo-btn ${activeTab === 'map' ? 'neo-btn-primary' : ''}`} onClick={() => setActiveTab('map')}>
            <MapIcon size={16} /> Map Unlocks
          </button>
        </div>

        <div className="shop-content">
          {activeTab === 'items' && (
            <div className="shop-grid">
              {consumables.map(item => {
                const ownedQty = progress.inventory?.[item.id] || 0;
                const canAfford = (progress.coins || 0) >= item.price;
                const isBuying = busyItem === item.id;

                return (
                  <div key={item.id} className="item-card neo-border neo-shadow">
                    {ownedQty > 0 && (
                      <div className="owned-tag">IN BAG: x{ownedQty}</div>
                    )}
                    <div className="item-icon-wrap" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
                      <span className="item-icon">{item.icon}</span>
                    </div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-type-badge" style={{ color: RARITY_COLORS[item.rarity] }}>
                        {item.rarity} {item.type}
                      </div>
                      <div className="item-desc">{item.description}</div>
                    </div>
                    <button 
                      className="neo-btn neo-btn-primary buy-btn" 
                      onClick={() => handleBuy(item)} 
                      disabled={!canAfford || isBuying}
                    >
                      {isBuying ? (
                        'PURCHASING...'
                      ) : (
                        <>
                          <Zap size={14} fill="currentColor" /> {item.price} COINS
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'cosmetics' && (
            <div className="shop-grid">
              {cosmetics.map(item => {
                const ownedQty = progress.inventory?.[item.id] || 0;
                const canAfford = (progress.coins || 0) >= item.price;
                const isBuying = busyItem === item.id;

                return (
                  <div key={item.id} className="item-card neo-border neo-shadow">
                    <div className="cosmetic-tag">COSMETIC ONLY</div>
                    {ownedQty > 0 && (
                      <div className="owned-tag" style={{ top: '40px' }}>IN BAG: x{ownedQty}</div>
                    )}
                    <div className="item-icon-wrap" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
                      <span className="item-icon">{item.icon}</span>
                    </div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-type-badge" style={{ color: RARITY_COLORS[item.rarity] }}>
                        {item.rarity} {item.type}
                      </div>
                      <div className="item-desc">{item.description}</div>
                    </div>
                    <button 
                      className="neo-btn neo-btn-primary buy-btn" 
                      onClick={() => handleBuy(item)} 
                      disabled={!canAfford || isBuying}
                    >
                      {isBuying ? 'PURCHASING...' : <><Zap size={14} fill="currentColor" /> {item.price} COINS</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="shop-grid">
              {lockedRegions.length === 0 ? (
                <div className="empty-state">All regions unlocked!</div>
              ) : (
                lockedRegions.map(region => {
                  const canAfford = (progress.coins || 0) >= region.price;
                  const isBuying = busyItem === region.id;

                  return (
                    <div key={region.id} className="item-card neo-border neo-shadow">
                      <div className="item-icon-wrap">
                        <span className="item-icon">{region.icon}</span>
                      </div>
                      <div className="item-details">
                        <div className="item-name">{region.name} Region</div>
                        <div className="item-type-badge">Early Unlock</div>
                        <div className="item-desc">Unlock this region before completing the previous tiers.</div>
                      </div>
                      <button 
                        className="neo-btn buy-btn" 
                        onClick={() => handleBuy(region)} 
                        disabled={!canAfford || isBuying}
                      >
                        {isBuying ? 'UNLOCKING...' : <><Zap size={14} fill="currentColor" /> {region.price} COINS</>}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
