import Wishlist from '../models/Wishlist.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

async function getOrCreateWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
}

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await (await getOrCreateWishlist(req.user._id)).populate({
    path: 'products',
    match: { isActive: true },
    populate: { path: 'brand', select: 'name slug' },
  });
  res.status(200).json({ success: true, wishlist });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  if (!wishlist.products.some((id) => id.equals(req.body.productId))) {
    wishlist.products.push(req.body.productId);
    await wishlist.save();
  }
  res.status(200).json({ success: true, wishlist });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.products = wishlist.products.filter((id) => id.toString() !== req.params.productId);
  await wishlist.save();
  res.status(200).json({ success: true, wishlist });
});

export const moveToCart = asyncHandler(async (req, res) => {
  // Delegates the actual cart-insert to the client, which already calls
  // POST /cart with this productId — this endpoint just removes it here
  // so both actions happen together from a single button.
  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.products = wishlist.products.filter((id) => id.toString() !== req.params.productId);
  await wishlist.save();
  res.status(200).json({ success: true, wishlist });
});

export default { getWishlist, addToWishlist, removeFromWishlist, moveToCart };
