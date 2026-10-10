import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingBag, Users, Plus, Search, Sparkles, ArrowUpRight, Check,
  CircleDollarSign, PackageCheck, Copy, ChevronDown, X, Link2, ShoppingCart,
  LayoutDashboard, Clock3, Trash2, RefreshCw
} from 'lucide-react';
import { api } from './api';

const money = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));
const categories = ['All items', 'Electronics', 'Home', 'Fashion', 'Essentials', 'Sports'];
const fallbackProducts = [
  { _id:'p1', name:'Wireless Headphones', category:'Electronics', price:1799, emoji:'🎧', color:'lavender', description:'Everyday sound, without the wires' },
  { _id:'p2', name:'Insulated Water Bottle', category:'Essentials', price:499, emoji:'🧴', color:'mint', description:'Keep your drink just right' },
  { _id:'p3', name:'Desk Lamp', category:'Home', price:899, emoji:'💡', color:'peach', description:'A little glow for your workspace' },
  { _id:'p4', name:'Canvas Tote Bag', category:'Fashion', price:349, emoji:'👜', color:'pink', description:'Room for all the essentials' },
  { _id:'p5', name:'Yoga Mat', category:'Sports', price:799, emoji:'🧘', color:'mint', description:'Make space for a reset' },
  { _id:'p6', name:'Bluetooth Speaker', category:'Electronics', price:1299, emoji:'🔊', color:'peach', description:'Bring your playlist along' },
  { _id:'p7', name:'Ceramic Coffee Mug', category:'Home', price:299, emoji:'☕', color:'pink', description:'Your new morning favourite' },
  { _id:'p8', name:'Running Shoes', category:'Fashion', price:2199, emoji:'👟', color:'lavender', description:'Lightweight everyday comfort' },
  { _id:'p9', name:'Power Bank', category:'Electronics', price:999, emoji:'🔋', color:'mint', description:'A little extra battery life' },
  { _id:'p10', name:'Storage Organizer', category:'Home', price:599, emoji:'🧺', color:'peach', description:'Give every little thing a home' },
  { _id:'p11', name:'Sunglasses', category:'Fashion', price:699, emoji:'🕶️', color:'pink', description:'An easy finishing touch' },
  { _id:'p12', name:'Resistance Bands', category:'Sports', price:399, emoji:'🏋️', color:'lavender', description:'Small kit, big possibilities' },
];

export default function App() {
  const [products, setProducts] = useState(fallbackProducts);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupDetail, setGroupDetail] = useState(null);
  const [category, setCategory] = useState('All items');
  const [query, setQuery] = useState('');
  const [displayName, setDisplayName] = useState('Suhani');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const notify = (msg) => { setToast(msg); window.setTimeout(() => setToast(''), 2600); };

  async function refreshGroups(preferredId) {
    try {
      const data = await api.getGroups();
      setGroups(data);
      const selected = data.find(g => g._id === preferredId) || data.find(g => g._id === activeGroup?._id) || data[0] || null;
      setActiveGroup(selected);
      if (selected) await loadGroup(selected._id);
      else setGroupDetail(null);
    } catch {
      // The UI stays usable if the API is not started yet.
    }
  }

  async function loadGroup(id) {
    try {
      const data = await api.getGroup(id);
      setGroupDetail(data);
      setActiveGroup(data);
    } catch {
      setGroupDetail(null);
    }
  }

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => {});
    refreshGroups();
  }, []);

  const filteredProducts = useMemo(() => products.filter(p =>
    (category === 'All items' || p.category === category) &&
    `${p.name} ${p.category} ${p.description || ''}`.toLowerCase().includes(query.toLowerCase())
  ), [products, category, query]);

  const items = groupDetail?.products || [];
  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
  const purchased = items.filter(i => i.status === 'Purchased').length;
  const progress = items.length ? Math.round((purchased / items.length) * 100) : 0;
  const members = groupDetail?.members || [];

  async function createGroup(e) {
    e.preventDefault();
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      const group = await api.createGroup({ name: groupName.trim(), createdBy: displayName });
      setShowCreate(false); setGroupName('');
      await refreshGroups(group._id);
      notify('Your shopping group is ready!');
    } catch (err) { notify(err.message || 'Could not create group'); }
    finally { setLoading(false); }
  }

  async function joinGroup(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      const group = await api.joinGroup({ code: joinCode.trim(), memberName: displayName });
      setShowJoin(false); setJoinCode('');
      await refreshGroups(group._id);
      notify('You joined the group!');
    } catch (err) { notify(err.message || 'Could not join group'); }
    finally { setLoading(false); }
  }

  async function addToGroup(product) {
    if (!activeGroup) { setShowCreate(true); notify('Create or join a group first'); return; }
    try {
      await api.addProduct(activeGroup._id, {
        productId: product._id, name: product.name, category: product.category,
        price: product.price, emoji: product.emoji || '🛍️', addedBy: displayName, quantity: 1
      });
      await loadGroup(activeGroup._id);
      notify(`${product.name} added to your group`);
    } catch (err) { notify(err.message || 'Could not add product'); }
  }

  async function updateItem(id, patch) {
    try { await api.updateProduct(id, patch); await loadGroup(activeGroup._id); }
    catch (err) { notify(err.message || 'Could not update item'); }
  }

  async function removeItem(id) {
    try { await api.deleteProduct(id); await loadGroup(activeGroup._id); notify('Item removed'); }
    catch (err) { notify(err.message || 'Could not remove item'); }
  }

  async function getSuggestions() {
    if (!activeGroup) { notify('Create or join a group first'); return; }
    try {
      const result = await api.suggestions(activeGroup._id);
      setSuggestions(result.suggestions || []);
    } catch {
      const pending = items.filter(i => i.status !== 'Purchased');
      setSuggestions(pending.length
        ? [`There are ${pending.length} items still to buy.`, `Your current estimated total is ${money(total)}.`, 'Assign each pending item to a member so responsibilities stay clear.']
        : ['Add products to your group list to get suggestions.', 'Set a group budget before making purchase decisions.']);
    }
    setSuggestionsOpen(true);
  }

  async function copyCode() {
    if (!activeGroup?.inviteCode) return;
    try { await navigator.clipboard.writeText(activeGroup.inviteCode); notify('Invite code copied'); }
    catch { notify(`Invite code: ${activeGroup.inviteCode}`); }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={e => e.preventDefault()}>
          <span className="brand-mark"><ShoppingBag size={21}/></span>
          <span>grouply<span className="brand-dot">.</span><small>SHOP BETTER TOGETHER</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-item active"><LayoutDashboard size={18}/> Overview</button>
        <button className="nav-item" onClick={() => setShowCreate(true)}><Plus size={18}/> Create a group</button>
        <button className="nav-item" onClick={() => setShowJoin(true)}><Link2 size={18}/> Join with a code</button>
        <div className="side-label group-label">YOUR GROUPS <span>{groups.length}</span></div>
        <div className="group-nav">
          {groups.map(g => <button key={g._id} className={`group-nav-item ${activeGroup?._id === g._id ? 'selected' : ''}`} onClick={() => loadGroup(g._id)}>
            <span className="group-avatar">{(g.name || 'G').slice(0,1).toUpperCase()}</span><span className="group-nav-name">{g.name}</span>
          </button>)}
          {!groups.length && <p className="empty-side">Your groups will appear here.</p>}
        </div>
        <div className="sidebar-bottom">
          <div className="avatar">{displayName.slice(0,1).toUpperCase()}</div>
          <div className="profile-copy"><strong>{displayName}</strong><span>Project demo account</span></div>
          <button className="icon-button" title="Change display name" onClick={() => { const n = prompt('Enter your display name', displayName); if (n?.trim()) setDisplayName(n.trim()); }}><ChevronDown size={17}/></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Discover</strong></div>
          <div className="topbar-actions">
            <span className="status-pill"><span className="live-dot"/> Prototype mode</span>
            <button className="primary-button compact" onClick={() => setShowCreate(true)}><Plus size={16}/> New group</button>
          </div>
        </header>

        <section className="welcome-row">
          <div>
            <div className="eyebrow">YOUR PEOPLE. YOUR PICKS.</div>
            <h1>Good things happen<br/><span>when we shop together.</span></h1>
            <p className="welcome-description">Plan purchases, share the list, and keep everyone on the same page.</p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-circle circle-one"></div><div className="hero-circle circle-two"></div>
            <div className="hero-bag">🛍️</div><div className="floating-chip chip-one"><Users size={15}/> <span>One shared plan</span></div>
            <div className="floating-chip chip-two"><Check size={15}/> <span>Everyone aligned</span></div>
            <div className="hero-spark">✳</div>
          </div>
        </section>

        {activeGroup && groupDetail && <section className="group-overview panel">
          <div className="section-heading">
            <div><div className="eyebrow">YOUR ACTIVE SPACE</div><h2>{groupDetail.name}</h2><p>Invite your people and make the list together.</p></div>
            <button className="outline-button" onClick={copyCode}><Copy size={15}/> Invite code <strong>{groupDetail.inviteCode}</strong></button>
          </div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon lilac"><ShoppingCart size={19}/></div><span>List items</span><strong>{items.length}</strong><small>Across your shared list</small></div>
            <div className="stat-card"><div className="stat-icon green"><CircleDollarSign size={19}/></div><span>Estimated total</span><strong>{money(total)}</strong><small>Based on listed prices</small></div>
            <div className="stat-card"><div className="stat-icon peach"><Users size={19}/></div><span>Group members</span><strong>{members.length}</strong><small>Shopping together</small></div>
            <div className="stat-card"><div className="stat-icon blue"><PackageCheck size={19}/></div><span>Purchased</span><strong>{progress}%</strong><small>{purchased} of {items.length} items done</small></div>
          </div>
          <div className="progress-line"><div style={{width:`${progress}%`}}/></div>
          <div className="progress-caption"><span>Shopping progress</span><span>{progress}% complete</span></div>
        </section>}

        <section className="catalog-section">
          <div className="catalog-heading">
            <div><div className="eyebrow">THE GOOD FINDS</div><h2>Explore products</h2><p>Add something to your group's shared list.</p></div>
            <div className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..."/>{query && <button onClick={() => setQuery('')}><X size={15}/></button>}</div>
          </div>
          <div className="category-tabs">
            {categories.map(c => <button key={c} className={category === c ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(c)}>{c}</button>)}
          </div>
          <div className="product-grid">
            {filteredProducts.map((p, i) => <article className="product-card" key={p._id}>
              <div className={`product-art ${p.color || ['lavender','mint','peach','pink'][i%4]}`}><span className="product-emoji">{p.emoji || '🛍️'}</span><span className="product-category">{p.category}</span></div>
              <div className="product-info"><h3>{p.name}</h3><p>{p.description || 'A useful pick for your next shared plan.'}</p>
                <div className="product-bottom"><strong>{money(p.price)}</strong><button className="add-button" onClick={() => addToGroup(p)} title="Add to group"><Plus size={17}/></button></div>
              </div>
            </article>)}
            {!filteredProducts.length && <div className="no-results">No products match that search. Try another keyword.</div>}
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel list-panel">
            <div className="panel-heading"><div><div className="eyebrow">MADE TOGETHER</div><h2>Shared shopping list</h2></div><span className="item-count">{items.length} items</span></div>
            {!activeGroup && <div className="blank-state"><div className="blank-icon"><Users size={25}/></div><h3>Your group starts here</h3><p>Create a group or join one with an invite code to start building a shared list.</p><div className="blank-actions"><button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={16}/> Create group</button><button className="outline-button" onClick={() => setShowJoin(true)}>Join group</button></div></div>}
            {activeGroup && items.length === 0 && <div className="blank-state small"><div className="blank-icon"><ShoppingBag size={24}/></div><h3>Your list is waiting</h3><p>Add a product above and it will appear here for everyone in the group.</p></div>}
            {activeGroup && items.length > 0 && <div className="shared-list">
              {items.map(item => <div className="shared-item" key={item._id}>
                <div className={`mini-product ${item.color || 'lavender'}`}>{item.emoji || '🛍️'}</div>
                <div className="shared-item-main"><strong>{item.name}</strong><span>Added by {item.addedBy || 'Member'} · Qty {item.quantity || 1}</span>
                  <label className="assign-label">Buying: <select value={item.assignedTo || ''} onChange={e => updateItem(item._id, { assignedTo: e.target.value })}><option value="">Unassigned</option>{members.map(m => <option key={typeof m === 'string' ? m : m.name} value={typeof m === 'string' ? m : m.name}>{typeof m === 'string' ? m : m.name}</option>)}</select></label>
                </div>
                <div className="shared-item-end"><strong>{money(item.price * (item.quantity || 1))}</strong><select className={`status-select ${String(item.status || 'Pending').toLowerCase()}`} value={item.status || 'Pending'} onChange={e => updateItem(item._id, { status: e.target.value })}><option>Pending</option><option>Selected</option><option>Purchased</option></select></div>
                <button className="delete-button" title="Remove item" onClick={() => removeItem(item._id)}><Trash2 size={15}/></button>
              </div>)}
            </div>}
            {activeGroup && items.length > 0 && <div className="list-footer"><span><Clock3 size={15}/> Shared list updates when you make a change</span><strong>Total: {money(total)}</strong></div>}
          </div>
          <aside className="ai-card">
            <div className="ai-orb"><Sparkles size={24}/></div><div className="eyebrow">A LITTLE HELP FROM AI</div><h2>Smarter choices,<br/>together.</h2><p>Get ideas for splitting up the shopping and keeping your plan on track.</p>
            <button className="ai-button" onClick={getSuggestions}>Get group suggestions <ArrowUpRight size={17}/></button>
            <div className="ai-footnote"><Sparkles size={13}/> Prototype recommendations · No checkout</div>
          </aside>
        </section>
        <footer className="footer"><span>grouply. · AI-Assisted Group Shopping Platform</span><span>Minor Project Prototype · Sample product data</span></footer>
      </main>

      {(showCreate || showJoin) && <div className="modal-backdrop" onMouseDown={e => { if(e.target === e.currentTarget) {setShowCreate(false);setShowJoin(false);} }}>
        <div className="modal">
          <button className="modal-close" onClick={() => {setShowCreate(false);setShowJoin(false);}}><X size={19}/></button>
          <div className="modal-icon">{showCreate ? <Users size={23}/> : <Link2 size={23}/>}</div>
          <div className="eyebrow">{showCreate ? 'START SOMETHING TOGETHER' : 'YOUR PEOPLE ARE WAITING'}</div>
          <h2>{showCreate ? 'Create a shopping group' : 'Join a shopping group'}</h2>
          <p>{showCreate ? 'Give your group a name. You can invite everyone with a code.' : 'Enter the invite code shared by your friend.'}</p>
          <form onSubmit={showCreate ? createGroup : joinGroup}>
            {showCreate ? <label>Group name<input autoFocus value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. College fest essentials" maxLength={60} required/></label> : <label>Invite code<input autoFocus value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="e.g. A7K9Q2" required/></label>}
            <button className="primary-button full" disabled={loading}>{loading ? 'Please wait...' : showCreate ? 'Create group' : 'Join group'} <ArrowUpRight size={17}/></button>
          </form>
          <div className="modal-switch">{showCreate ? 'Already have a code?' : 'Want to start a new group?'} <button onClick={() => {setShowCreate(!showCreate);setShowJoin(!showJoin);}}> {showCreate ? 'Join instead' : 'Create one'}</button></div>
        </div>
      </div>}

      {suggestionsOpen && <div className="modal-backdrop" onMouseDown={e => {if(e.target===e.currentTarget)setSuggestionsOpen(false);}}>
        <div className="modal suggestions-modal"><button className="modal-close" onClick={() => setSuggestionsOpen(false)}><X size={19}/></button>
          <div className="modal-icon sparkle"><Sparkles size={23}/></div><div className="eyebrow">GROUP SHOPPING ASSISTANT</div><h2>Your group's next steps</h2><p>Suggestions based on the current shared list.</p>
          <div className="suggestion-list">{suggestions.map((s,i)=><div className="suggestion-row" key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{s}</p></div>)}</div>
          <div className="demo-note">These are prototype suggestions. Connect an AI API later for generated recommendations.</div>
          <button className="primary-button full" onClick={() => setSuggestionsOpen(false)}>Got it <Check size={17}/></button>
        </div>
      </div>}
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}
