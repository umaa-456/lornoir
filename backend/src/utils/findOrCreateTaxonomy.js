function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The product form may submit a new brand/category while its autocomplete
 * list is stale. Reuse the matching taxonomy record instead of attempting a
 * duplicate insert that MongoDB correctly rejects with E11000.
 */
export async function findOrCreateTaxonomy(Model, payload) {
  const name = String(payload.name || '').trim();
  const exactName = new RegExp(`^${escapeRegex(name)}$`, 'i');
  let record = await Model.findOne({ name: exactName });

  if (record) {
    if (!record.isActive) {
      record.isActive = true;
      await record.save();
    }
    return { record, created: false };
  }

  try {
    record = await Model.create({ ...payload, name });
    return { record, created: true };
  } catch (err) {
    // A concurrent request can create the same taxonomy value between the
    // lookup and insert. In that case, fetch and reuse it rather than return
    // a conflict to the product form.
    if (err?.code !== 11000) throw err;
    record = await Model.findOne({ name: exactName });
    if (!record) throw err;
    if (!record.isActive) {
      record.isActive = true;
      await record.save();
    }
    return { record, created: false };
  }
}
