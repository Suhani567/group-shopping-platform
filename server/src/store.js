import { randomUUID } from 'node:crypto';

export const memory = {
  groups: [],
  products: [],
  catalogue: [
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
  ],
};
export const makeId = () => randomUUID();
export const makeCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
