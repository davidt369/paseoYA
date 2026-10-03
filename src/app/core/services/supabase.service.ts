import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  get instance(): SupabaseClient {
    return this.client;
  }

  get auth() {
    return this.client.auth;
  }

  get rpc() {
    return this.client.rpc.bind(this.client);
  }

  get from() {
    return this.client.from.bind(this.client);
  }

  get channel() {
    return this.client.channel.bind(this.client);
  }
}
