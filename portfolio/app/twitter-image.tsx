import {
  renderSocialImage,
  socialImageAlt,
  socialImageContentType,
  socialImageSize,
} from "./social-card";

export const alt = socialImageAlt;
export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function TwitterImage() {
  return renderSocialImage();
}
