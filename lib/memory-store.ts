// Shared in-memory storage for images (temporary workaround)
export const imageStore = new Map<string, any>();

export function addImage(image: any) {
  imageStore.set(image.id, image);
}

export function getImage(id: string) {
  return imageStore.get(id) || null;
}

export function getAllImages() {
  return Array.from(imageStore.values()).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getImagesByCategory(category: string) {
  const allImages = getAllImages();
  if (category === "all" || !category) {
    return allImages;
  }
  return allImages.filter(img => img.category === category);
}

export function getCategories() {
  const allImages = getAllImages();
  return [...new Set(allImages.map(img => img.category).filter(Boolean))];
} 