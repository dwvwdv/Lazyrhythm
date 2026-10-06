import { Injectable } from '@angular/core';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase.config';
import { Lang } from '../i18n/translations';

export interface ProjectTranslation {
  title?: string;
  description?: string;
  tags?: string[];
}

export interface WebsiteProjectRow {
  slug: string;
  title: string;
  description: string;
  image_url: string | null;
  image_fit: 'contain' | 'cover';
  project_url: string;
  category: 'finance' | 'gaming' | 'security' | 'automation' | 'reading' | 'other';
  tags: string[];
  technologies: string[];
  featured: boolean;
  sort_order: number;
  /** 英文以外的語系；缺少的欄位沿用英文原欄位。 */
  translations: Partial<Record<Lang, ProjectTranslation>> | null;
}

export interface ContractPayload {
  form_type: 'contact' | 'sponsor';
  name: string;
  email?: string | null;
  subject?: string | null;
  message: string;
  amount?: number | null;
}

@Injectable({ providedIn: 'root' })
export class WebsiteDataService {
  private readonly baseUrl = `${SUPABASE_URL}/rest/v1`;
  private readonly anonKey = SUPABASE_ANON_KEY;

  async getProjects(): Promise<WebsiteProjectRow[]> {
    const response = await fetch(
      `${this.baseUrl}/projects?select=slug,title,description,image_url,image_fit,project_url,category,tags,technologies,featured,sort_order,translations&order=sort_order.asc`,
      { headers: this.headers('website') }
    );

    if (!response.ok) {
      throw new Error(`Failed to load projects (${response.status})`);
    }

    return response.json();
  }

  async submitContract(payload: ContractPayload): Promise<void> {
    const response = await fetch(`${this.baseUrl}/contract`, {
      method: 'POST',
      headers: {
        ...this.headers('website'),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to submit contact form (${response.status})`);
    }
  }

  private headers(schema: string): Record<string, string> {
    return {
      apikey: this.anonKey,
      Authorization: `Bearer ${this.anonKey}`,
      'Accept-Profile': schema,
      'Content-Profile': schema
    };
  }
}
