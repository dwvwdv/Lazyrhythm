import { Injectable } from '@angular/core';

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
}

export interface ContractPayload {
  form_type: 'contact' | 'sponsor';
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  amount?: number | null;
}

@Injectable({ providedIn: 'root' })
export class WebsiteDataService {
  private readonly baseUrl = 'https://pwrwclutauqxbqsqfkjj.supabase.co/rest/v1';
  private readonly anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3cndjbHV0YXVxeGJxc3Fma2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxNjk2OTEsImV4cCI6MjA0OTc0NTY5MX0.vuocg4yRU0Tvx1ylxN9AXRwwifKWDAuyCjaE7wb_KRg';

  async getProjects(): Promise<WebsiteProjectRow[]> {
    const response = await fetch(
      `${this.baseUrl}/projects?select=slug,title,description,image_url,image_fit,project_url,category,tags,technologies,featured,sort_order&order=sort_order.asc`,
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
