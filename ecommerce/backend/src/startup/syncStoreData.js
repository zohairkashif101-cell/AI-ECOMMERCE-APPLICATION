const User = require("../models/User");
const Product = require("../models/Product");
const catalog = require("../../../frontend/src/data.json");

const syncStoreData = async () => {
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (ownerEmail) {
    const owner = await User.findOneAndUpdate(
      { email: ownerEmail },
      { $set: { role: "owner" } },
      { new: true, runValidators: true }
    );
    if (!owner) {
      console.warn("Configured owner account was not found; create that account and restart the backend.");
    }
  } else {
    console.warn("OWNER_EMAIL is not configured; no account will have owner permissions.");
  }

  for (const product of catalog) {
    let storedProduct = await Product.findOne({ name: product.name });
    if (!storedProduct) {
      const productData = { ...product };
      delete productData._id;
      await Product.create({ ...productData, stock: 10 });
      continue;
    }

    let needsSave = false;
    if (!Number.isInteger(storedProduct.stock)) {
      storedProduct.stock = 10;
      needsSave = true;
    }
    if (
      !storedProduct.image ||
      storedProduct.image === "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800"
    ) {
      storedProduct.image = product.image;
      needsSave = true;
    }
    if (needsSave) {
      await storedProduct.save();
    }
  }
};

module.exports = syncStoreData;
