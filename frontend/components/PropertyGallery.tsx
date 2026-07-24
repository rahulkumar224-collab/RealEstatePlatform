"use client";

import { useState } from "react";

type PropertyGalleryProps = {
  images: string[];
};

export default function PropertyGallery({
  images,
}: PropertyGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div>
      {/* Main Image */}
      <img
        src={selectedImage}
        alt="Property"
        className="w-full h-[500px] object-cover rounded-xl"
      />

      {/* Thumbnails */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt=""
            onClick={() => setSelectedImage(image)}
            className={`h-28 w-full object-cover rounded-lg cursor-pointer border-2 transition ${
              selectedImage === image
                ? "border-blue-600"
                : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}