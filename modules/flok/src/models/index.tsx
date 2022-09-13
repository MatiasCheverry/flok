export type ImageModel = {
  id: number
  image_url: string
  alt: string
  orientation: "LANDSCAPE" | "PORTRAIT"
}

export const sampleLandscape: ImageModel = {
  id: 1,
  image_url:
    "https://flok-b32d43c.s3.us-east-1.amazonaws.com/misc/david-vives-ELf8M_YWRTY-unsplash.jpg",
  orientation: "LANDSCAPE",
  alt: "",
}
export const samplePortrait: ImageModel = {
  id: 1,
  image_url: "https://images.unsplash.com/photo-1611005813863-6c1bc3d3908b",
  orientation: "PORTRAIT",
  alt: "",
}

export type ResourceNotFoundType = "RESOURCE_NOT_FOUND"
export const ResourceNotFound: ResourceNotFoundType = "RESOURCE_NOT_FOUND"
