import { UserProfile } from '../types';
import { mockUsers } from '../data/mockData';
import { initFirebase, loginWithGoogle as fbGoogleLogin, logoutUser as fbLogout } from './firebase';

const CURRENT_USER_ID_KEY = 'mefe_current_user_id';
const ALL_USERS_KEY = 'mefe_all_users';
const USER_CREDENTIALS_KEY = 'mefe_user_credentials';

interface StoredCredentials {
  [email: string]: string; // email -> password
}

class AuthService {
  getAllUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(ALL_USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(mockUsers));
    return mockUsers;
  }

  saveAllUsers(users: UserProfile[]): void {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  }

  private getCredentials(): StoredCredentials {
    try {
      const raw = localStorage.getItem(USER_CREDENTIALS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    const defaults: StoredCredentials = {
      'camille@mefe.app': 'password123',
      'elena@mefe.app': 'password123',
      'marcus@mefe.app': 'password123',
    };
    localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(defaults));
    return defaults;
  }

  private saveCredentials(creds: StoredCredentials): void {
    localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(creds));
  }

  getCurrentUser(): UserProfile | null {
    const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!currentId) return null;
    const users = this.getAllUsers();
    return users.find(u => u.uid === currentId) || null;
  }

  loginWithEmail(email: string, password?: string): UserProfile {
    const cleanEmail = email.toLowerCase().trim();
    const users = this.getAllUsers();
    const creds = this.getCredentials();

    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!existingUser) {
      throw new Error('No account found with this email address. Please Sign Up first.');
    }

    if (password && creds[cleanEmail] && creds[cleanEmail] !== password) {
      throw new Error('Invalid password. Please check your credentials and try again.');
    }

    localStorage.setItem(CURRENT_USER_ID_KEY, existingUser.uid);
    return existingUser;
  }

  register(displayName: string, email: string, password?: string): UserProfile {
    const cleanEmail = email.toLowerCase().trim();
    const users = this.getAllUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please Sign In instead.');
    }

    const newUser: UserProfile = {
      uid: 'usr_' + Date.now(),
      email: cleanEmail,
      displayName: displayName.trim(),
      photoURL: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      bio: 'Mindful style & wardrobe curator 🌿',
      role: 'user',
      isPremium: true,
      preferredLanguage: 'en',
      status: { state: 'active', until: null, reason: '' },
      avatarConfig: {
        baseModelId: 'mannequin_classic',
        skinTone: '#E4B698',
        hairStyle: 'sleek_bob',
        hairColor: '#3C2F2F',
        canvasScale: 1,
        bodyType: 'classic'
      },
      followersCount: 0,
      followingCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveAllUsers(users);

    if (password) {
      const creds = this.getCredentials();
      creds[cleanEmail] = password;
      this.saveCredentials(creds);
    }

    localStorage.setItem(CURRENT_USER_ID_KEY, newUser.uid);
    return newUser;
  }

  async loginWithGoogle(googleProfile?: { email: string; displayName: string; photoURL?: string }): Promise<UserProfile> {
    // 1. Try real Firebase Google Popup if Firebase is configured
    const { isConfigured } = initFirebase();
    if (isConfigured && !googleProfile) {
      try {
        const result = await fbGoogleLogin();
        if (result.user) {
          const email = (result.user.email || 'googleuser@gmail.com').toLowerCase();
          const users = this.getAllUsers();
          let user = users.find(u => u.email.toLowerCase() === email);
          if (!user) {
            user = {
              uid: result.user.uid,
              email,
              displayName: result.user.displayName || email.split('@')[0],
              photoURL: result.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              bio: 'Connected via Google Account ✨',
              role: 'user',
              isPremium: true,
              preferredLanguage: 'en',
              status: { state: 'active', until: null, reason: '' },
              avatarConfig: {
                baseModelId: 'mannequin_classic',
                skinTone: '#E4B698',
                hairStyle: 'sleek_bob',
                hairColor: '#3C2F2F',
                canvasScale: 1,
                bodyType: 'classic'
              },
              followersCount: 12,
              followingCount: 18,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            users.push(user);
            this.saveAllUsers(users);
          }
          localStorage.setItem(CURRENT_USER_ID_KEY, user.uid);
          return user;
        }
      } catch (err) {
        console.warn('Firebase Google popup fallback:', err);
      }
    }

    // 2. Authenticate with provided Google profile
    const email = (googleProfile?.email || 'camille@mefe.app').toLowerCase().trim();
    const users = this.getAllUsers();
    let user = users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      user = {
        uid: 'usr_google_' + Date.now(),
        email,
        displayName: googleProfile?.displayName || email.split('@')[0],
        photoURL: googleProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Verified Google Account Member 🌿',
        role: 'user',
        isPremium: true,
        preferredLanguage: 'en',
        status: { state: 'active', until: null, reason: '' },
        avatarConfig: {
          baseModelId: 'mannequin_classic',
          skinTone: '#E4B698',
          hairStyle: 'sleek_bob',
          hairColor: '#3C2F2F',
          canvasScale: 1,
          bodyType: 'classic'
        },
        followersCount: 1,
        followingCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(user);
      this.saveAllUsers(users);
    }

    localStorage.setItem(CURRENT_USER_ID_KEY, user.uid);
    return user;
  }

  logout(): void {
    fbLogout().catch(() => {});
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  }

  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.uid === current.uid);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveAllUsers(users);
    return users[index];
  }
}

export const authService = new AuthService();
