import { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { ITEMS, RARITY_COLORS } from '../../data/items';
import { Zap, Shield, Sparkles, Map as MapIcon } from 'lucide-react';
import PageHeader from '../../components/UI/PageHeader';
import './Shop.css';

export default function Shop() {
  const { progress, spendCoins } = useProgress();
  const [activeTab, setActiveTab] = useState('items');

  const allItems = Object.values(ITEMS);
  const consumables = allItems.filter(i => i.type === 'consumable' || i.type === 'boost' || i.type === 'passive');
  
  const cosmetics = [
    { id: 'frame_gold', name: 'Golden Aura Frame', type: 'cosmetic', rarity: 'legendary', price: 1000, description: 'Surrounds your avatar in gold.', icon: '✨' },
    { id: 'dmg_pixel', name: 'Retro Damage Text', type: 'cosmetic', rarity: 'rare', price: 400, description: 'Changes damage numbers to pixel font.', icon: '👾' },
  ];

  const lockedRegions = Object.keys(progress.unlockedRegions).length < 8 ? [
    { id: 'strings', name: 'Strings', price: 300, icon: '📜' },
    { id: 'linked-lists', name: 'Linked Lists', price: 400, icon: '🔗' },
    { id: 'trees', name: 'Trees', price: 500, icon: '🌲' },
  ].filter(r => !progress.unlockedRegions[r.id]) : [];

  const handleBuy = (item) => {
    if (progress.coins >= item.price) {
      if (window.confirm(`Buy ${item.name} for ${item.price} coins?`)) {
        spendCoins(item.price);
        alert(`Purchased ${item.name}!`);
      }
    } else {
      alert("Not enough coins!");
    }
  };

  return (
    <div className="page shop-page animate-fadeIn">
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
              {consumables.map(item => (
                <div key={item.id} className="item-card neo-border neo-shadow">
                  <div className="item-icon-wrap" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
                    <span className="item-icon">{item.icon}</span>
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-type-badge" style={{ color: RARITY_COLORS[item.rarity] }}>{item.rarity} {item.type}</div>
                    <div className="item-desc">{item.description}</div>
                  </div>
                  <button className="neo-btn neo-btn-primary buy-btn" onClick={() => handleBuy(item)} disabled={progress.coins < item.price}>
                    <Zap size={14} fill="currentColor" /> {item.price}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cosmetics' && (
            <div className="shop-grid">
              {cosmetics.map(item => (
                <div key={item.id} className="item-card neo-border neo-shadow">
                  <div className="cosmetic-tag">COSMETIC ONLY</div>
                  <div className="item-icon-wrap" style={{ borderColor: RARITY_COLORS[item.rarity] }}>
                    <span className="item-icon">{item.icon}</span>
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-type-badge" style={{ color: RARITY_COLORS[item.rarity] }}>{item.rarity} {item.type}</div>
                    <div className="item-desc">{item.description}</div>
                  </div>
                  <button className="neo-btn neo-btn-primary buy-btn" onClick={() => handleBuy(item)} disabled={progress.coins < item.price}>
                    <Zap size={14} fill="currentColor" /> {item.price}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="shop-grid">
              {lockedRegions.length === 0 ? (
                <div className="empty-state">All regions unlocked!</div>
              ) : (
                lockedRegions.map(region => (
                  <div key={region.id} className="item-card neo-border neo-shadow">
                    <div className="item-icon-wrap">
                      <span className="item-icon">{region.icon}</span>
                    </div>
                    <div className="item-details">
                      <div className="item-name">{region.name} Region</div>
                      <div className="item-type-badge">Early Unlock</div>
                      <div className="item-desc">Unlock this region before completing the previous tiers.</div>
                    </div>
                    <button className="neo-btn buy-btn" onClick={() => handleBuy(region)} disabled={progress.coins < region.price}>
                      <Zap size={14} fill="currentColor" /> {region.price}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
