import { Router } from 'express';
import mongoose from 'mongoose';
import { Group, Product } from './models.js';
import { memory, makeId, makeCode } from './store.js';

export function buildRouter(useMongo) {
  const router = Router();

  router.get('/health', (_req, res) => res.json({ status: 'ok', database: useMongo ? 'mongodb' : 'memory-demo' }));
  router.get('/products', (_req, res) => res.json(memory.catalogue));

  router.get('/groups', async (_req, res, next) => {
    try {
      const groups = useMongo ? await Group.find().sort({ createdAt: -1 }).lean() : memory.groups;
      res.json(groups);
    } catch (e) { next(e); }
  });

  router.post('/groups', async (req, res, next) => {
    try {
      const name = String(req.body.name || '').trim();
      const createdBy = String(req.body.createdBy || 'Demo Member').trim();
      if (!name) return res.status(400).json({ message: 'Please enter a group name.' });
      let code = makeCode();
      if (useMongo) {
        let group = await Group.create({ name, createdBy, inviteCode: code, members: [{ name: createdBy, role: 'owner' }] });
        return res.status(201).json(group);
      }
      while (memory.groups.some(g => g.inviteCode === code)) code = makeCode();
      const group = { _id: makeId(), name, createdBy, inviteCode: code, members: [{ name: createdBy, role: 'owner' }], createdAt: new Date().toISOString() };
      memory.groups.unshift(group);
      res.status(201).json(group);
    } catch (e) { next(e); }
  });

  router.post('/groups/join', async (req, res, next) => {
    try {
      const code = String(req.body.code || '').trim().toUpperCase();
      const memberName = String(req.body.memberName || 'Guest Member').trim();
      if (!code) return res.status(400).json({ message: 'Enter an invite code.' });
      if (useMongo) {
        const group = await Group.findOne({ inviteCode: code });
        if (!group) return res.status(404).json({ message: 'No group found for that invite code.' });
        if (!group.members.some(m => m.name.toLowerCase() === memberName.toLowerCase())) group.members.push({ name: memberName });
        await group.save();
        return res.json(group);
      }
      const group = memory.groups.find(g => g.inviteCode === code);
      if (!group) return res.status(404).json({ message: 'No group found for that invite code.' });
      if (!group.members.some(m => m.name.toLowerCase() === memberName.toLowerCase())) group.members.push({ name: memberName, role: 'member' });
      res.json(group);
    } catch (e) { next(e); }
  });

  router.get('/groups/:id', async (req, res, next) => {
    try {
      let group;
      if (useMongo) {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid group ID.' });
        group = await Group.findById(req.params.id).lean();
        if (!group) return res.status(404).json({ message: 'Group not found.' });
        const products = await Product.find({ groupId: group._id }).sort({ createdAt: -1 }).lean();
        return res.json({ ...group, products });
      }
      group = memory.groups.find(g => g._id === req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found.' });
      res.json({ ...group, products: memory.products.filter(p => p.groupId === group._id) });
    } catch (e) { next(e); }
  });

  router.post('/groups/:id/products', async (req, res, next) => {
    try {
      const name = String(req.body.name || '').trim();
      if (!name) return res.status(400).json({ message: 'Product name is required.' });
      const price = Number(req.body.price || 0);
      const quantity = Math.max(1, Number(req.body.quantity || 1));
      if (!Number.isFinite(price) || price < 0) return res.status(400).json({ message: 'Price must be a valid non-negative number.' });
      if (useMongo) {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid group ID.' });
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found.' });
        const product = await Product.create({ ...req.body, name, price, quantity, groupId: group._id });
        return res.status(201).json(product);
      }
      const group = memory.groups.find(g => g._id === req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found.' });
      const product = { _id: makeId(), ...req.body, name, price, quantity, groupId: group._id, status: 'Pending', createdAt: new Date().toISOString() };
      memory.products.unshift(product);
      res.status(201).json(product);
    } catch (e) { next(e); }
  });

  router.patch('/products/:id', async (req, res, next) => {
    try {
      const allowed = {};
      if (req.body.status !== undefined) {
        if (!['Pending', 'Selected', 'Purchased'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid product status.' });
        allowed.status = req.body.status;
      }
      if (req.body.assignedTo !== undefined) allowed.assignedTo = String(req.body.assignedTo).slice(0, 100);
      if (!Object.keys(allowed).length) return res.status(400).json({ message: 'No supported fields to update.' });
      if (useMongo) {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
        const product = await Product.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        return res.json(product);
      }
      const product = memory.products.find(p => p._id === req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      Object.assign(product, allowed);
      res.json(product);
    } catch (e) { next(e); }
  });

  router.delete('/products/:id', async (req, res, next) => {
    try {
      if (useMongo) {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
        const result = await Product.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Product not found.' });
        return res.json({ message: 'Product removed.' });
      }
      const index = memory.products.findIndex(p => p._id === req.params.id);
      if (index < 0) return res.status(404).json({ message: 'Product not found.' });
      memory.products.splice(index, 1);
      res.json({ message: 'Product removed.' });
    } catch (e) { next(e); }
  });

  router.post('/groups/:id/suggestions', async (req, res, next) => {
    try {
      let group, items;
      if (useMongo) {
        if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid group ID.' });
        group = await Group.findById(req.params.id).lean();
        if (!group) return res.status(404).json({ message: 'Group not found.' });
        items = await Product.find({ groupId: group._id }).lean();
      } else {
        group = memory.groups.find(g => g._id === req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found.' });
        items = memory.products.filter(p => p.groupId === group._id);
      }
      const total = items.reduce((sum, p) => sum + p.price * p.quantity, 0);
      const pending = items.filter(p => p.status !== 'Purchased');
      const unassigned = pending.filter(p => !p.assignedTo);
      const suggestions = [];
      if (!items.length) suggestions.push('Add a few products to your shared list to start planning together.');
      else {
        suggestions.push(`${pending.length} of ${items.length} items are still not marked as purchased.`);
        if (unassigned.length) suggestions.push(`Assign ${unassigned.length} pending item(s) to group members so everyone knows what they are responsible for.`);
        if (group.members?.length > 1 && pending.length) suggestions.push('Try sharing pending items across members instead of giving every task to one person.');
        suggestions.push(`The current estimated total is ₹${Math.round(total).toLocaleString('en-IN')}. Confirm prices before purchasing.`);
        if (!unassigned.length && pending.length) suggestions.push('All pending items have an assigned buyer. Review the list together before you finish.');
      }
      res.json({ suggestions });
    } catch (e) { next(e); }
  });

  return router;
}
