import { Product } from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

// Utility function to upload images to Cloudinary from buffer
const uploadToCloudinary = async (files, imageFieldNames) => {
  try {
    const uploadPromises = imageFieldNames.map(async (fieldName) => {
      const file = files.find(f => f.fieldname === fieldName);
      if (!file) {
        throw new Error(`File not found for field: ${fieldName}`);
      }
      
      // Upload to Cloudinary from buffer
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "kth_sports" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        
        // Send the buffer to Cloudinary
        uploadStream.end(file.buffer);
      });
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload images");
  }
};

// ✅ Add Product
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      type,
      brand,
      category,
      price,
      description,
      variants: variantsString,
      sizes: sizesString,
      availableSizes: availableSizesString,
      inStock
    } = req.body;

    // Required fields check
    if (!name || !type || !brand || !price || !category || !variantsString) {
      return res.status(400).json({ message: "❌ Missing required fields" });
    }

    // Parse the JSON strings
    const variants = JSON.parse(variantsString);
    const sizes = JSON.parse(sizesString || '[]');
    const availableSizes = JSON.parse(availableSizesString || '[]');

    // Process files from req.files
    const files = req.files || [];
    
    // Process variants with image uploads
    let processedVariants = [];
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        // Get image field names for this variant
        const imageFieldNames = variant.images || [];
        
        // Upload images to Cloudinary
        const uploadedImages = await uploadToCloudinary(files, imageFieldNames);
        
        processedVariants.push({
          color: variant.color,
          availableSizes: variant.availableSizes || [],
          images: uploadedImages
        });
      }
    }

    const newProduct = new Product({
      name,
      type,
      brand,
      category,
      price: parseFloat(price),
      description: description || '',
      variants: processedVariants,
      sizes,
      availableSizes,
      inStock: inStock === 'true' || inStock === true,
    });

    await newProduct.save();

    res.status(201).json({
      message: "✅ Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "❌ Failed to add product",
      error: error.message,
    });
  }
};

// ✅ Update Product
// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ message: "❌ Product ID is required" });
//     }

//     const {
//       name,
//       type,
//       brand,
//       category,
//       price,
//       description,
//       variants: variantsString,
//       sizes: sizesString,
//       availableSizes: availableSizesString,
//       inStock
//     } = req.body;

//     // Process files from req.files
//     const files = req.files || [];
    
//     // Parse the JSON strings
//     const variants = variantsString ? JSON.parse(variantsString) : null;
//     const sizes = sizesString ? JSON.parse(sizesString) : null;
//     const availableSizes = availableSizesString ? JSON.parse(availableSizesString) : null;

//     // Process variants with image uploads if variants are provided
//     let processedVariants;
//     if (variants && Array.isArray(variants)) {
//       processedVariants = [];
//       for (const variant of variants) {
//         // Check if this variant has new images to upload
//         const imageFieldNames = variant.images || [];
//         const existingImages = imageFieldNames.filter(img => img.startsWith('http'));
//         const newImageFields = imageFieldNames.filter(img => !img.startsWith('http'));
        
//         // Upload new images to Cloudinary
//         const uploadedImages = newImageFields.length > 0 
//           ? await uploadToCloudinary(files, newImageFields)
//           : [];
        
//         processedVariants.push({
//           color: variant.color,
//           availableSizes: variant.availableSizes || [],
//           images: [...existingImages, ...uploadedImages]
//         });
//       }
//     }

//     const updateData = {};
//     if (name) updateData.name = name;
//     if (type) updateData.type = type;
//     if (brand) updateData.brand = brand;
//     if (category) updateData.category = category;
//     if (price !== undefined) updateData.price = parseFloat(price);
//     if (description !== undefined) updateData.description = description;
//     if (processedVariants) updateData.variants = processedVariants;
//     if (sizes) updateData.sizes = sizes;
//     if (availableSizes) updateData.availableSizes = availableSizes;
//     if (inStock !== undefined) updateData.inStock = inStock === 'true' || inStock === true;

//     const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "❌ Product not found" });
//     }

//     res.status(200).json({
//       message: "✅ Product updated successfully",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({
//       message: "❌ Failed to update product",
//       error: error.message,
//     });
//   }
// };

// ✅ Update Product
// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ message: "❌ Product ID is required" });
//     }

//     const {
//       name,
//       type,
//       brand,
//       category,
//       price,
//       description,
//       variants: variantsString,
//       sizes: sizesString,
//       availableSizes: availableSizesString,
//       inStock
//     } = req.body;

//     // Process files from req.files
//     const files = req.files || [];
    
//     // Parse the JSON strings
//     const variants = variantsString ? JSON.parse(variantsString) : null;
//     const sizes = sizesString ? JSON.parse(sizesString) : null;
//     const availableSizes = availableSizesString ? JSON.parse(availableSizesString) : null;

//     // Get the existing product to preserve existing variant images
//     const existingProduct = await Product.findById(id);
//     if (!existingProduct) {
//       return res.status(404).json({ message: "❌ Product not found" });
//     }

//     // Process variants with image uploads if variants are provided
//     let processedVariants;
//     if (variants && Array.isArray(variants)) {
//       processedVariants = [];
      
//       for (const variant of variants) {
//         // Check if this is an existing variant (by comparing with existing product variants)
//         const existingVariant = existingProduct.variants.find(
//           v => v.color === variant.color
//         );
        
//         let finalImages = [];
        
//         if (existingVariant) {
//           // This is an existing variant - preserve existing images
//           finalImages = [...existingVariant.images];
//         }
        
//         // Process new images for this variant
//         // The variant.images array contains field names like "image-0", "image-1", etc.
//         const newImageFieldNames = variant.images || [];
        
//         // Upload new images to Cloudinary
//         const uploadPromises = newImageFieldNames.map(async (fieldName) => {
//           const file = files.find(f => f.fieldname === fieldName);
//           if (!file) {
//             // If file not found, it might be an existing image URL
//             if (fieldName.startsWith('http')) {
//               return fieldName; // Already a URL
//             }
//             return null; // Skip if not found and not a URL
//           }
          
//           // Upload to Cloudinary
//           return new Promise((resolve, reject) => {
//             const uploadStream = cloudinary.uploader.upload_stream(
//               { folder: "kth_sports" },
//               (error, result) => {
//                 if (error) reject(error);
//                 else resolve(result.secure_url);
//               }
//             );
            
//             // Send the buffer to Cloudinary
//             uploadStream.end(file.buffer);
//           });
//         });
        
//         const uploadedImages = (await Promise.all(uploadPromises)).filter(img => img !== null);
        
//         // If we have existing images and new images, combine them
//         // If we only have new images, use them
//         if (finalImages.length > 0 && uploadedImages.length > 0) {
//           finalImages = [...finalImages, ...uploadedImages];
//         } else if (uploadedImages.length > 0) {
//           finalImages = uploadedImages;
//         }
        
//         processedVariants.push({
//           color: variant.color,
//           availableSizes: variant.availableSizes || [],
//           images: finalImages
//         });
//       }
//     }

//     const updateData = {};
//     if (name) updateData.name = name;
//     if (type) updateData.type = type;
//     if (brand) updateData.brand = brand;
//     if (category) updateData.category = category;
//     if (price !== undefined) updateData.price = parseFloat(price);
//     if (description !== undefined) updateData.description = description;
//     if (processedVariants) updateData.variants = processedVariants;
//     if (sizes) updateData.sizes = sizes;
//     if (availableSizes) updateData.availableSizes = availableSizes;
//     if (inStock !== undefined) updateData.inStock = inStock === 'true' || inStock === true;

//     const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "❌ Product not found" });
//     }

//     res.status(200).json({
//       message: "✅ Product updated successfully",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({
//       message: "❌ Failed to update product",
//       error: error.message,
//     });
//   }
// };

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "❌ Product ID is required" });
    }

    const {
      name,
      type,
      brand,
      category,
      price,
      description,
      variants: variantsString,
      sizes: sizesString,
      availableSizes: availableSizesString,
      inStock
    } = req.body;

    // Process files from req.files
    const files = req.files || [];
    
    // Parse the JSON strings
    const variants = variantsString ? JSON.parse(variantsString) : null;
    const sizes = sizesString ? JSON.parse(sizesString) : null;
    const availableSizes = availableSizesString ? JSON.parse(availableSizesString) : null;

    // Get the existing product to preserve existing variant images
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    // Process variants with image uploads if variants are provided
    let processedVariants;
    if (variants && Array.isArray(variants)) {
      processedVariants = [];
      
      for (const variant of variants) {
        // Check if this is an existing variant (by comparing with existing product variants)
        const existingVariant = existingProduct.variants.find(
          v => v.color === variant.color
        );
        
        let finalImages = [];
        
        // Process new images for this variant
        // The variant.images array contains field names like "image-0", "image-1", etc.
        const newImageFieldNames = variant.images || [];
        
        // Upload new images to Cloudinary
        const uploadPromises = newImageFieldNames.map(async (fieldName) => {
          // If it's already a URL (existing image), just return it
          if (fieldName.startsWith('http')) {
            return fieldName;
          }
          
          // Otherwise, it's a new file that needs to be uploaded
          const file = files.find(f => f.fieldname === fieldName);
          if (!file) {
            return null; // Skip if not found
          }
          
          // Upload to Cloudinary
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "kth_sports" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            
            // Send the buffer to Cloudinary
            uploadStream.end(file.buffer);
          });
        });
        
        const uploadedImages = (await Promise.all(uploadPromises)).filter(img => img !== null);
        
        // If we have existing variant, use its images plus any new ones
        if (existingVariant) {
          finalImages = [...existingVariant.images];
          
          // Add only new images that aren't already in the existing images
          for (const newImage of uploadedImages) {
            if (!finalImages.includes(newImage)) {
              finalImages.push(newImage);
            }
          }
        } else {
          // This is a completely new variant, use all uploaded images
          finalImages = uploadedImages;
        }
        
        processedVariants.push({
          color: variant.color,
          availableSizes: variant.availableSizes || [],
          images: finalImages
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (brand) updateData.brand = brand;
    if (category) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;
    if (processedVariants) updateData.variants = processedVariants;
    if (sizes) updateData.sizes = sizes;
    if (availableSizes) updateData.availableSizes = availableSizes;
    if (inStock !== undefined) updateData.inStock = inStock === 'true' || inStock === true;

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    res.status(200).json({
      message: "✅ Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "❌ Failed to update product",
      error: error.message,
    });
  }
};

// Keep the other functions (getAllProducts, getProductById, deleteProduct) the same as before
// ✅ Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "❌ No products found",
      });
    }

    res.status(200).json({
      message: "✅ Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "❌ Failed to fetch products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "❌ Product ID is required" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    res.status(200).json({
      message: "✅ Product fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      message: "❌ Failed to fetch product",
      error: error.message,
    });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "❌ Product ID is required" });
    }

    const deletedProduct = await Product.findByIdAndDelete({_id: id});

    if (!deletedProduct) {
      return res.status(404).json({ message: "❌ Product not found" });
    }

    res.status(200).json({
      message: "✅ Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "❌ Failed to delete product",
      error: error.message,
    });
  }
};