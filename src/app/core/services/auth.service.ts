import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Profile, UserRole } from '../models';
import { User } from '@supabase/supabase-js';

export const DEMO_USERS: Record<string, { profile: Profile; password: string }> = {
  'cliente@paseo.bo': {
    profile: {
      id: '11111111-1111-4111-a111-111111111111',
      email: 'cliente@paseo.bo',
      nombre_completo: 'Carlos Mendoza',
      telefono: '70712345',
      rol: 'cliente',
    },
    password: 'paseo123',
  },
  'comercio@paseo.bo': {
    profile: {
      id: '22222222-2222-4222-a222-222222222222',
      email: 'comercio@paseo.bo',
      nombre_completo: 'Sony Store Cochabamba (Piso 2)',
      telefono: '71798765',
      rol: 'comercio',
      store_id: 'a0000000-0000-0000-0000-000000000001',
    },
    password: 'paseo123',
  },
  'comercio2@paseo.bo': {
    profile: {
      id: '22222222-2222-4222-b222-222222222222',
      email: 'comercio2@paseo.bo',
      nombre_completo: 'Burger Craft (Piso 3)',
      telefono: '74456789',
      rol: 'comercio',
      store_id: 'a0000000-0000-0000-0000-000000000004',
    },
    password: 'paseo123',
  },
  'admin@paseo.bo': {
    profile: {
      id: '33333333-3333-4333-a333-333333333333',
      email: 'admin@paseo.bo',
      nombre_completo: 'Administración Paseo Aranjuez',
      telefono: '44521000',
      rol: 'admin',
    },
    password: 'paseo123',
  },
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  // Signals
  readonly user = signal<User | null>(null);
  readonly profile = signal<Profile | null>(null);
  readonly loading = signal<boolean>(true);

  // Computed signals
  readonly role = computed<UserRole | null>(() => this.profile()?.rol ?? null);
  readonly isAuthenticated = computed<boolean>(() => !!this.user() || !!this.profile());
  readonly isCliente = computed<boolean>(() => this.role() === 'cliente');
  readonly isComercio = computed<boolean>(() => this.role() === 'comercio');
  readonly isAdmin = computed<boolean>(() => this.role() === 'admin');

  constructor() {
    this.initAuth();
  }

  private async initAuth(): Promise<void> {
    try {
      // Check local storage for mock demo session first
      const savedMock = localStorage.getItem('PASEO_DEMO_USER');
      if (savedMock && DEMO_USERS[savedMock]) {
        const demo = DEMO_USERS[savedMock];
        this.profile.set(demo.profile);
        this.user.set({
          id: demo.profile.id,
          email: demo.profile.email,
          app_metadata: {},
          user_metadata: {
            nombre_completo: demo.profile.nombre_completo,
            rol: demo.profile.rol,
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
        this.loading.set(false);
        return;
      }

      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.user) {
        this.user.set(session.user);
        await this.loadProfile(session.user.id);
      }
    } catch (err) {
      console.warn('Supabase session lookup error (falling back to guest):', err);
    } finally {
      this.loading.set(false);
    }

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (localStorage.getItem('PASEO_DEMO_USER')) return;

      this.user.set(session?.user ?? null);
      if (session?.user) {
        await this.loadProfile(session.user.id);
      } else {
        this.profile.set(null);
      }
      this.loading.set(false);
    });
  }

  async loadProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Fallback: build profile from user metadata if database table isn't seeded yet
        const u = this.user();
        if (u) {
          const fallbackProfile: Profile = {
            id: u.id,
            email: u.email || '',
            nombre_completo: u.user_metadata?.['nombre_completo'] || 'Usuario',
            telefono: u.user_metadata?.['telefono'],
            rol: (u.user_metadata?.['rol'] as UserRole) || 'cliente',
            store_id: u.user_metadata?.['store_id'],
          };
          this.profile.set(fallbackProfile);
          return fallbackProfile;
        }
        return null;
      }

      this.profile.set(data as Profile);
      return data as Profile;
    } catch (err) {
      console.error('Failed to load profile:', err);
      return null;
    }
  }

  async login(email: string, password: string): Promise<{ error: Error | null; role?: UserRole }> {
    this.loading.set(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try real Supabase auth
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data.user) {
        localStorage.removeItem('PASEO_DEMO_USER');
        const prof = await this.loadProfile(data.user.id);
        const userRole = prof?.rol || (data.user.user_metadata?.['rol'] as UserRole) || 'cliente';
        this.redirectByRole(userRole);
        return { error: null, role: userRole };
      }
    } catch (err) {
      console.warn('Supabase signInWithPassword failed, testing demo fallback:', err);
    }

    // 2. Demo fallback for hackathon evaluators
    if (DEMO_USERS[cleanEmail] && DEMO_USERS[cleanEmail].password === password) {
      const demo = DEMO_USERS[cleanEmail];
      localStorage.setItem('PASEO_DEMO_USER', cleanEmail);
      this.profile.set(demo.profile);
      this.user.set({
        id: demo.profile.id,
        email: demo.profile.email,
        app_metadata: {},
        user_metadata: {
          nombre_completo: demo.profile.nombre_completo,
          rol: demo.profile.rol,
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);

      this.redirectByRole(demo.profile.rol);
      this.loading.set(false);
      return { error: null, role: demo.profile.rol };
    }

    this.loading.set(false);
    return { error: new Error('Credenciales inválidas. Verifica tu correo y contraseña.') };
  }

  async loginAsDemo(role: UserRole): Promise<void> {
    const demoMap: Record<UserRole, string> = {
      cliente: 'cliente@paseo.bo',
      comercio: 'comercio@paseo.bo',
      admin: 'admin@paseo.bo',
    };
    const email = demoMap[role];
    await this.login(email, 'paseo123');
  }

  async register(
    email: string,
    password: string,
    nombreCompleto: string,
    rol: UserRole = 'cliente',
    telefono?: string,
    storeId?: string
  ): Promise<{ error: Error | null }> {
    this.loading.set(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            rol,
            telefono: telefono ?? '',
            store_id: storeId ?? null,
          },
        },
      });

      if (error) {
        // If Supabase is offline/placeholder, create local session
        if (error.message.includes('fetch') || error.message.includes('URL') || error.message.includes('apikey')) {
          const fakeId = 'user-' + Math.random().toString(36).substring(2, 9);
          const newProfile: Profile = {
            id: fakeId,
            email: cleanEmail,
            nombre_completo: nombreCompleto,
            telefono: telefono ?? '',
            rol,
            store_id: storeId,
          };
          DEMO_USERS[cleanEmail] = {
            profile: newProfile,
            password,
          };
          localStorage.setItem('PASEO_DEMO_USER', cleanEmail);
          this.profile.set(newProfile);
          this.user.set({ id: fakeId, email: cleanEmail } as User);
          return { error: null };
        }
        throw error;
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    this.loading.set(true);
    try {
      localStorage.removeItem('PASEO_DEMO_USER');
      await this.supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut warning:', e);
    } finally {
      this.user.set(null);
      this.profile.set(null);
      this.loading.set(false);
      this.router.navigate(['/auth/login']);
    }
  }

  redirectByRole(rol: UserRole): void {
    switch (rol) {
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'comercio':
        this.router.navigate(['/comercio']);
        break;
      case 'cliente':
      default:
        this.router.navigate(['/cliente']);
        break;
    }
  }
}
