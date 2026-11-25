import {
  FaDribbble,
  FaEnvelope,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';

const SOCIAL_ICON_COMPONENTS = {
  linkedin: FaLinkedin,
  github: FaGithub,
  instagram: FaInstagram,
  twitter: FaTwitter,
  youtube: FaYoutube,
  dribbble: FaDribbble,
  website: FaGlobe,
  email: FaEnvelope,
};

export function getSocialIconComponent(platform = '') {
  return SOCIAL_ICON_COMPONENTS[String(platform).toLowerCase()] || FaGlobe;
}
