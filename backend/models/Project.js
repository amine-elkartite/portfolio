import { createModel } from './BaseModel.js';
export default createModel('projects', ["title", "slug", "description", "long_description", "thumbnail", "category", "technologies", "github_url", "live_url", "status", "featured", "seo_title", "seo_description", "og_image"], 'id DESC');
